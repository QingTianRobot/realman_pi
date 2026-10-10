"""Guard the image build's layer cache.

On the robot host every rebuild used to re-download ~2.4 GB of pip packages
because the whole ``config/`` tree was copied ahead of the pip layers: any edit
to a runtime YAML changed that layer and invalidated everything after it. These
tests keep the large downloads keyed only on the files they actually read.
"""
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).parents[1]
DOCKERFILE = ROOT / "config" / "docker" / "ros2-humble-rviz.Dockerfile"
PIP_CACHE_MOUNT = "--mount=type=cache,target=/root/.cache/pip"


def instructions():
    """Return (first_line_number, text) per Dockerfile instruction, joined across ``\\`` continuations."""
    result = []
    pending = None
    for number, raw in enumerate(DOCKERFILE.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw.strip()
        if pending is None:
            if not line or line.startswith("#"):
                continue
            pending = [number, ""]
        pending[1] += line.rstrip("\\").strip() + " "
        if not raw.rstrip().endswith("\\"):
            result.append((pending[0], pending[1].strip()))
            pending = None
    return result


def pip_installs():
    return [(n, text) for n, text in instructions() if text.startswith("RUN") and "pip install" in text]


def first_line(predicate):
    for number, text in instructions():
        if predicate(text):
            return number
    return None


class DockerfileLayerCacheTest(unittest.TestCase):
    def test_pip_layers_exist(self):
        self.assertGreaterEqual(len(pip_installs()), 5, "expected the torch/recording/sdk/ik/gripper/policy pip layers")

    def test_requirements_are_copied_on_their_own_before_pip(self):
        requirements_copy = first_line(lambda t: re.match(r"COPY config/python\s", t))
        first_pip = pip_installs()[0][0]
        self.assertIsNotNone(requirements_copy, "pip layers need `COPY config/python ...` so they key only on requirements files")
        self.assertLess(requirements_copy, first_pip)

    def test_full_config_is_not_copied_before_pip(self):
        full_config_copy = first_line(lambda t: re.match(r"COPY config\s", t))
        self.assertIsNotNone(full_config_copy, "the full config tree must still land in the image for colcon")
        last_pip = pip_installs()[-1][0]
        self.assertGreater(
            full_config_copy,
            last_pip,
            "COPY config before a pip layer makes every runtime YAML edit re-download the pip packages",
        )

    def test_source_is_not_copied_before_pip(self):
        source_copy = first_line(lambda t: re.match(r"COPY src\s", t))
        self.assertGreater(source_copy, pip_installs()[-1][0])

    def test_full_config_precedes_colcon_build(self):
        # CMake installs the repository-root config into the package share, so
        # colcon needs the complete tree; it must not be deferred past the build.
        full_config_copy = first_line(lambda t: re.match(r"COPY config\s", t))
        colcon_build = first_line(lambda t: t.startswith("RUN") and "colcon build" in t)
        self.assertLess(full_config_copy, colcon_build)

    def test_pip_layers_use_a_buildkit_cache_mount(self):
        for number, text in pip_installs():
            with self.subTest(line=number):
                self.assertIn(PIP_CACHE_MOUNT, text, "pip downloads must survive layer invalidation")
                self.assertNotIn("--no-cache-dir", text, "--no-cache-dir defeats the pip cache mount")

    def test_pip_layers_only_read_requirements_copied_earlier(self):
        copied_to = "/opt/rm65_ws/config/python"
        for number, text in pip_installs():
            for path in re.findall(r"--requirement\s+(\S+)", text):
                with self.subTest(line=number, path=path):
                    self.assertTrue(path.startswith(copied_to + "/"), f"{path} is not under {copied_to}")

    def test_proxy_args_come_after_the_apt_layer(self):
        # An ARG/ENV placed ahead of the apt RUN changes that RUN's cache key, so
        # touching the build proxy re-installed ~1.2 GB of apt packages (an hour
        # on the robot's Wi-Fi). The proxy is only needed by the pip layers.
        apt_install = first_line(lambda t: t.startswith("RUN") and "apt-get" in t and "install" in t)
        proxy_args = [n for n, t in instructions() if re.match(r"ARG\s+(HTTP|HTTPS)_PROXY\b", t)]
        self.assertIsNotNone(apt_install)
        self.assertTrue(proxy_args, "the optional pip build proxy ARGs should still exist")
        for number in proxy_args:
            self.assertGreater(number, apt_install, f"line {number}: proxy ARG precedes the apt layer")

    def test_proxy_is_not_baked_into_the_image(self):
        # ENV would persist into every container; with a build proxy set, all
        # runtime HTTP clients would silently route through it.
        baked = [t for _, t in instructions() if re.match(r"ENV\b.*\b(HTTP|HTTPS)_PROXY\b", t, re.IGNORECASE)]
        self.assertEqual(baked, [])

    def test_pip_layers_only_use_the_configured_mirrors(self):
        # On the robot LAN pypi.org, files.pythonhosted.org and download.pytorch.org
        # are unreachable much of the time; with `--retries 5 --timeout 300` a dead
        # extra index stalled five builds for 13 to 43 minutes each before they
        # failed. Every source must be a replaceable mirror ARG, never a literal host.
        for number, text in pip_installs():
            with self.subTest(line=number):
                self.assertNotIn("--extra-index-url", text)
                self.assertNotIn("--find-links", text)
                urls = re.findall(r"--index-url\s+\"?([^\s\"]+)", text)
                self.assertEqual(len(urls), 1)
                self.assertIn(urls[0], ("${PIP_INDEX_URL}", "${PYTORCH_INDEX_URL}"), f"hard-coded package source: {urls[0]}")
                self.assertNotRegex(text, r"pypi\.org|pythonhosted|download\.pytorch\.org")

    def test_torch_uses_the_pytorch_mirror_and_everything_else_the_pypi_mirror(self):
        torch_layers = [t for _, t in pip_installs() if "torch==" in t]
        self.assertEqual(len(torch_layers), 1)
        self.assertIn('--index-url "${PYTORCH_INDEX_URL}"', torch_layers[0])
        for number, text in pip_installs():
            if "torch==" not in text:
                with self.subTest(line=number):
                    self.assertIn('--index-url "${PIP_INDEX_URL}"', text)

    def test_mirror_args_have_defaults_and_come_after_the_apt_layer(self):
        # The Aliyun mirror serves plain HTTP/1.1 (pip, apt) at ~85 KB/s while others
        # do 3 to 11 MB/s, so pip gets its own ARGs. They must sit after the apt layer
        # (an earlier ARG changes its cache key) and, unlike PYPI_INDEX_URL which is
        # kept before it only so the existing apt layer stays cached, can be changed
        # per build without re-installing ~1.2 GB of apt packages.
        apt_install = first_line(lambda t: t.startswith("RUN") and "apt-get" in t and "install" in t)
        first_pip = pip_installs()[0][0]
        for name in ("PIP_INDEX_URL", "PYTORCH_INDEX_URL"):
            with self.subTest(arg=name):
                declared = [(n, t) for n, t in instructions() if re.match(rf"ARG {name}=\S+$", t)]
                self.assertEqual(len(declared), 1, f"{name} needs exactly one declaration with a default")
                self.assertGreater(declared[0][0], apt_install)
                self.assertLess(declared[0][0], first_pip)

    def test_compose_passes_the_pip_mirrors_through_with_the_same_defaults(self):
        compose = (ROOT / "config" / "docker" / "compose.yaml").read_text(encoding="utf-8")
        dockerfile = DOCKERFILE.read_text(encoding="utf-8")
        for name in ("PIP_INDEX_URL", "PYTORCH_INDEX_URL"):
            with self.subTest(arg=name):
                default = re.search(rf"^ARG {name}=(\S+)$", dockerfile, re.MULTILINE).group(1)
                self.assertIn(f"{name}: ${{{name}:-{default}}}", compose)

    def test_no_syntax_directive(self):
        # `# syntax=docker/dockerfile:1` makes BuildKit pull a frontend image
        # from Docker Hub, which the robot network cannot reach reliably. The
        # bundled frontend already supports RUN --mount=type=cache.
        head = DOCKERFILE.read_text(encoding="utf-8").splitlines()[:5]
        self.assertFalse([line for line in head if re.match(r"#\s*syntax\s*=", line)])


if __name__ == "__main__":
    unittest.main()
