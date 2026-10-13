// Raw-session preview: a modal that plays the still-unconverted recording's JPEG
// frames plus its manifest metadata, so a 待转换 session can be reviewed before
// deciding whether to delete it or batch-convert it. It has no dependency on the
// LeRobot replay (parquet/mp4) machinery, which does not exist for pending data.

type RawSession = {
  session_id: string;
  session_number?: number;
  task?: string;
  state?: string;
  duration_s?: number | null;
  summary?: Record<string, unknown>;
  cameras: Record<string, string[]>;
};

const $ = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;

export function initRawViewer(deps: { notify: (message: string, error?: boolean) => void }) {
  const modal = $<HTMLElement>("#raw-modal");
  const titleEl = $<HTMLElement>("#raw-title");
  const metaEl = $<HTMLElement>("#raw-meta");
  const tabsEl = $<HTMLElement>("#raw-camera-tabs");
  const stageImg = $<HTMLImageElement>("#raw-frame");
  const emptyEl = $<HTMLElement>("#raw-empty");
  const counterEl = $<HTMLElement>("#raw-counter");
  const playBtn = $<HTMLButtonElement>("#raw-play");

  let sessionId = "";
  let cameras: string[] = [];
  let frames: Record<string, string[]> = {};
  let activeCamera = "";
  let index = 0;
  let playing = false;
  let timer: number | undefined;

  function stopPlay(): void {
    playing = false;
    if (timer !== undefined) window.clearInterval(timer);
    timer = undefined;
    playBtn.textContent = "▶ 播放";
  }

  function frameCount(): number {
    return frames[activeCamera]?.length ?? 0;
  }

  function renderTabs(): void {
    tabsEl.innerHTML = cameras
      .map(
        (camera) =>
          `<button class="raw-camera-tab${camera === activeCamera ? " active" : ""}" type="button" data-camera="${camera}">${camera}<small>${frames[camera]?.length ?? 0} 帧</small></button>`,
      )
      .join("");
  }

  function renderFrame(): void {
    const list = frames[activeCamera];
    if (!list || list.length === 0) {
      stageImg.style.display = "none";
      emptyEl.style.display = "grid";
      emptyEl.textContent = "该相机没有可预览的帧";
      counterEl.textContent = "— / —";
      return;
    }
    emptyEl.style.display = "none";
    stageImg.style.display = "block";
    const filename = list[index];
    stageImg.src = `/api/lerobot/${encodeURIComponent(sessionId)}/raw/image/${encodeURIComponent(activeCamera)}/${encodeURIComponent(filename)}`;
    counterEl.textContent = `${index + 1} / ${list.length}`;
  }

  function selectCamera(cameraId: string): void {
    activeCamera = cameraId;
    index = 0;
    stopPlay();
    renderTabs();
    renderFrame();
  }

  function step(delta: number): void {
    const count = frameCount();
    if (!count) return;
    index = (index + delta + count) % count;
    renderFrame();
  }

  function togglePlay(): void {
    if (!frameCount()) return;
    if (playing) {
      stopPlay();
      return;
    }
    playing = true;
    playBtn.textContent = "⏸ 暂停";
    const fps = 10; // light cadence for the raw JPEG preview over the tunnel
    timer = window.setInterval(() => {
      step(1);
      if (index === 0) stopPlay(); // wrap around once, then stop
    }, 1000 / fps);
  }

  function close(): void {
    stopPlay();
    modal.hidden = true;
  }

  async function open(id: string): Promise<void> {
    stopPlay();
    let data: RawSession;
    try {
      const response = await fetch(`/api/lerobot/${encodeURIComponent(id)}/raw`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = (await response.json()) as RawSession;
    } catch (error) {
      deps.notify(`无法预览该待转换数据：${error instanceof Error ? error.message : "未知错误"}`, true);
      return;
    }
    sessionId = data.session_id ?? id;
    frames = data.cameras ?? {};
    cameras = Object.keys(frames);
    const number = data.session_number !== undefined ? String(data.session_number).padStart(6, "0") : id;
    titleEl.textContent = data.task ? `${number} · ${data.task}` : number;
    const totalFrames = cameras.reduce((sum, camera) => sum + (frames[camera]?.length ?? 0), 0);
    const duration = data.duration_s != null ? `${data.duration_s.toFixed(1)} s` : "—";
    metaEl.textContent = `${cameras.length} 路相机 · 共 ${totalFrames} 帧 · 时长 ${duration} · 状态 ${data.state || "—"}`;
    activeCamera = cameras[0] ?? "";
    index = 0;
    renderTabs();
    renderFrame();
    modal.hidden = false;
  }

  modal.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const cameraTab = target.closest<HTMLElement>("[data-camera]");
    if (cameraTab) {
      selectCamera(cameraTab.dataset.camera ?? "");
      return;
    }
    if (target.closest("[data-action='raw-close']")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;
    if (event.key === "Escape") close();
    else if (event.key === "ArrowLeft") step(-1);
    else if (event.key === "ArrowRight") step(1);
    else if (event.key === " ") {
      event.preventDefault();
      togglePlay();
    }
  });
  $<HTMLButtonElement>("#raw-close").addEventListener("click", close);
  $<HTMLButtonElement>("#raw-prev").addEventListener("click", () => step(-1));
  $<HTMLButtonElement>("#raw-next").addEventListener("click", () => step(1));
  playBtn.addEventListener("click", togglePlay);

  return { open, close };
}
