"""The compute host's resources for the web panel: one plain shell query over ssh (no remote package needed)."""

from __future__ import annotations

import pytest
from fake_runner import FakeRunner

from realman_training import compute
from realman_training.config import load_config

ANSWER = """\
0, GPU-aaa, NVIDIA RTX 5880 Ada Generation, 4, 49140, 0
1, GPU-bbb, NVIDIA RTX 5880 Ada Generation, 18000, 49140, 63
@@mem
              total        used        free      shared  buff/cache   available
Mem:         257652       19450      117000        9000      120000      225000
Swap:          2047           0        2047
@@disk
Filesystem     1024-blocks       Used Available Capacity Mounted on
/dev/nvme0n1p1  3750000000 3650000000  49283072      99% /home/ca/big_space
@@load
3.79 1.43 0.94 2/1234 5678
112
"""


@pytest.fixture()
def config(tmp_path):
    path = tmp_path / "c.yaml"
    path.write_text(
        "training_console:\n"
        f"  data_root: {tmp_path / 'data'}\n"
        "  compute:\n    ssh_host: ca_host\n    workdir: /work/x\n",
        encoding="utf-8",
    )
    return load_config(path)


def test_one_ssh_command_inside_the_work_dir_reads_everything(config):
    runner = FakeRunner().on("nvidia-smi", stdout=ANSWER)
    data = compute.host_resources(config, runner)
    call = runner.calls[-1]
    assert call[-2] == "ca_host" and call[-1].startswith("cd /work/x && ")
    for part in ("nvidia-smi --query-gpu=", "free -m", "df -Pk .", "/proc/loadavg", "nproc"):
        assert part in call[-1]
    assert "query-compute-apps" not in call[-1]  # other users' processes are not read
    assert data["available"] is True and data["host_name"] == "ca_host"
    assert [g["index"] for g in data["gpus"]] == [0, 1]
    assert data["gpus"][1] == {"index": 1, "name": "NVIDIA RTX 5880 Ada Generation", "used_mib": 18000,
                               "total_mib": 49140, "util_pct": 63, "busy": True, "users": []}
    assert data["host"] == {"mem_total_mib": 257652, "mem_used_mib": 19450, "mem_available_mib": 225000,
                            "disk_total_kib": 3750000000, "disk_used_kib": 3650000000, "disk_avail_kib": 49283072,
                            "load1": 3.79, "cores": 112}
    assert "at" in data


def test_missing_gpus_still_report_the_host(config):
    answer = "NVIDIA-SMI has failed\n@@gpu-error\n@@mem\n" + ANSWER.split("@@mem\n", 1)[1]
    data = compute.host_resources(config, FakeRunner().on("nvidia-smi", stdout=answer))
    assert data["available"] is False and data["gpus"] == [] and "nvidia-smi" in data["error"]
    assert data["host"]["cores"] == 112


def test_unreachable_host_is_reported_not_raised(config):
    data = compute.host_resources(config, FakeRunner().on("nvidia-smi", returncode=255, stdout="Connection refused"))
    assert data["available"] is False and data["host"] is None and "ca_host" in data["error"]


def test_gpu_query_is_the_host_query_when_a_compute_host_is_set(config):
    runner = FakeRunner().on("nvidia-smi", stdout=ANSWER)
    assert compute.gpu_query(config, runner)["host"]["cores"] == 112
    assert not runner.commands("_gpus")  # no remote package or venv needed for the panel
