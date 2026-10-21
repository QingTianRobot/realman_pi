# Training console (src/training/realman_training) for server5090: aiohttp web UI on :8780 + the realman-train jobs.
# The docker CLI and compose plugin are bind-mounted from the host (compose service realman_training) so they match
# the daemon; nvidia-smi comes from the NVIDIA runtime. The package keeps its repo-relative path because
# realman_training.config locates the repo root from its own file.
FROM python:3.12-slim

ARG PIP_INDEX_URL=https://pypi.org/simple
ARG APT_MIRROR=
RUN if [ -n "$APT_MIRROR" ]; then sed -i "s|deb.debian.org|$APT_MIRROR|g" /etc/apt/sources.list.d/debian.sources; fi \
 && apt-get update \
 && apt-get install -y --no-install-recommends openssh-client git ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir --index-url "$PIP_INDEX_URL" "aiohttp>=3.9" numpy pyarrow pyyaml

COPY src/training/realman_training /opt/realman_pi/src/training/realman_training
ENV PYTHONPATH=/opt/realman_pi/src/training/realman_training \
    PYTHONUNBUFFERED=1
WORKDIR /opt/realman_pi

EXPOSE 8780
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8780/api/health', timeout=4)"
CMD ["python", "-m", "realman_training", "web"]
