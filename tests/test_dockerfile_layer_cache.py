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

    def test_no_syntax_directive(self):
        # `# syntax=docker/dockerfile:1` makes BuildKit pull a frontend image
        # from Docker Hub, which the robot network cannot reach reliably. The
        # bundled frontend already supports RUN --mount=type=cache.
        head = DOCKERFILE.read_text(encoding="utf-8").splitlines()[:5]
        self.assertFalse([line for line in head if re.match(r"#\s*syntax\s*=", line)])


if __name__ == "__main__":
    unittest.main()
