from __future__ import annotations

from fake_runner import FakeRunner

from realman_training import gpus

CID = "5da9e66ad003bd07a061671d95bcec04e6d89e6162a8d30a0a00c4e536905f56"
GPU_CSV = (
    "0, GPU-a, NVIDIA GeForce RTX 5090, 15627, 32607, 97\n"
    "1, GPU-b, NVIDIA GeForce RTX 5090, 3, 32607, 0\n"
    "2, GPU-c, NVIDIA GeForce RTX 5090, [N/A], 32607, [N/A]\n"
)
APPS_CSV = "GPU-a, 4242, 15571 MiB\nGPU-a, 4343, 50\nGPU-x, 1, 5\n"


def _proc(tmp_path):
    proc = tmp_path / "proc"
    (proc / "4242").mkdir(parents=True)
    (proc / "4242" / "cgroup").write_text(f"0::/system.slice/docker-{CID}.scope\n")
    (proc / "4242" / "status").write_text("Name:\tpython3\nUid:\t1000\t1000\t1000\t1000\n")
    (proc / "4242" / "comm").write_text("python3\n")
    (proc / "4343").mkdir()
    (proc / "4343" / "cgroup").write_text("0::/user.slice/user-1001.slice/session-1.scope\n")
    (proc / "4343" / "status").write_text("Uid:\t1001\t1001\t1001\t1001\n")
    (proc / "4343" / "comm").write_text("python\n")
    passwd = tmp_path / "passwd"
    passwd.write_text("root:x:0:0::/root:/bin/sh\nserver5090:x:1000:1000::/home/server5090:/bin/bash\nalice:x:1001:1001::/home/alice:/bin/bash\n")
    return proc, passwd


def test_each_gpu_lists_its_holders_by_container_or_user(tmp_path):
    proc, passwd = _proc(tmp_path)
    runner = (FakeRunner().on("--query-gpu", stdout=GPU_CSV).on("--query-compute-apps", stdout=APPS_CSV)
              .on("docker ps", stdout=f"{CID} openpi-serve-openpi-1\n"))
    data = gpus.query(runner, busy_mib=2000, passwd=passwd, proc=proc)
    assert data["available"] is True and data["busy_mib"] == 2000
    first, second, third = data["gpus"]
    assert (first["index"], first["used_mib"], first["total_mib"], first["util_pct"], first["busy"]) == (0, 15627, 32607, 97, True)
    assert [u["who"] for u in first["users"]] == ["openpi-serve-openpi-1", "alice python"]
    assert first["users"][0]["container"] == "openpi-serve-openpi-1" and first["users"][0]["used_mib"] == 15571
    assert first["users"][1] == {"pid": 4343, "who": "alice python", "container": None, "user": "alice",
                                 "command": "python", "used_mib": 50}
    assert second["busy"] is False and second["users"] == []
    assert third["used_mib"] is None and third["busy"] is False
    assert "uuid" not in first


def test_an_invisible_process_is_named_by_pid(tmp_path):
    runner = (FakeRunner().on("--query-gpu", stdout="0, GPU-a, X, 9000, 32607, 5\n")
              .on("--query-compute-apps", stdout="GPU-a, 77, 9000\n"))
    data = gpus.query(runner, busy_mib=2000, passwd=tmp_path / "none", proc=tmp_path / "noproc")
    assert data["gpus"][0]["users"][0]["who"] == "pid 77"


def test_no_nvidia_smi_is_reported_not_raised(tmp_path):
    runner = FakeRunner().on("--query-gpu", stdout="NVIDIA-SMI has failed", returncode=9)
    data = gpus.query(runner, busy_mib=2000, passwd=tmp_path / "p", proc=tmp_path)
    assert data == {"available": False, "busy_mib": 2000, "gpus": [], "error": "NVIDIA-SMI has failed"}


def test_a_missing_binary_is_reported_not_raised(tmp_path):
    class Missing(FakeRunner):
        def run(self, argv, **kwargs):
            raise FileNotFoundError("nvidia-smi")

    data = gpus.query(Missing(), busy_mib=1, passwd=tmp_path / "p", proc=tmp_path)
    assert data["available"] is False and "nvidia-smi" in data["error"]
