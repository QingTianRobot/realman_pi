// Synchronized multi-camera replay: one <video> per exported camera, positioned
// by `video.currentTime = frameIndex / fps`. AV1 (Chrome/Firefox/Edge) only; no
// fallback or transcoding in this phase.

export type VideoContext = {
  sessionId: string;
  fps: number;
  frameCount: number;
  cameraIds: string[];
};

export type VideoCallbacks = {
  getSession(): VideoContext | null;
  onFrameChange(frameIndex: number): void;
};

export type VideoApi = {
  load(): void;
  clear(): void;
  toggle(): void;
  step(delta: number): void;
  setSpeed(rate: number): void;
  isPlaying(): boolean;
};

const $ = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export function initVideo(callbacks: VideoCallbacks): VideoApi {
  const camerasEl = $("#replay-cameras");
  const cameraCount = $("#replay-camera-count");
  const playBtn = $<HTMLButtonElement>("#replay-play");
  const prevBtn = $<HTMLButtonElement>("#replay-prev");
  const nextBtn = $<HTMLButtonElement>("#replay-next");
  const slider = $<HTMLInputElement>("#replay-slider");
  const speed = $<HTMLSelectElement>("#replay-speed");

  let videos: HTMLVideoElement[] = [];
  let context: VideoContext | null = null;
  let currentIndex = 0;
  let playing = false;
  let raf = 0;

  function clampIndex(index: number): number {
    if (!context || context.frameCount <= 0) return 0;
    return Math.min(context.frameCount - 1, Math.max(0, index));
  }

  function seekTo(index: number): void {
    if (!context) return;
    currentIndex = clampIndex(index);
    const time = currentIndex / context.fps;
    for (const video of videos) {
      try {
        video.currentTime = time;
      } catch {
        /* metadata may not be loaded yet; the next seek will retry */
      }
    }
    slider.value = String(currentIndex);
  }

  function masterTime(): number {
    return videos.length ? videos[0].currentTime : 0;
  }

  function renderLoop(): void {
    if (!playing || !context) return;
    const index = clampIndex(Math.round(masterTime() * context.fps));
    currentIndex = index;
    slider.value = String(index);
    callbacks.onFrameChange(index);
    if (index >= context.frameCount - 1) {
      pause();
      callbacks.onFrameChange(context.frameCount - 1);
      return;
    }
    raf = requestAnimationFrame(renderLoop);
  }

  function play(): void {
    if (!context || !videos.length) return;
    playing = true;
    playBtn.textContent = "⏸ 暂停";
    const rate = Number(speed.value || 1);
    for (const video of videos) {
      video.playbackRate = rate;
      void video.play().catch(() => {
        /* autoplay policy can block; the user can press play again */
      });
    }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(renderLoop);
  }

  function pause(): void {
    playing = false;
    playBtn.textContent = "▶ 播放";
    for (const video of videos) video.pause();
    cancelAnimationFrame(raf);
  }

  function toggle(): void {
    if (playing) pause();
    else play();
  }

  function step(delta: number): void {
    if (!context) return;
    pause();
    const next = clampIndex(currentIndex + delta);
    seekTo(next);
    callbacks.onFrameChange(next);
  }

  function setSpeed(rate: number): void {
    for (const video of videos) video.playbackRate = rate;
  }

  function load(): void {
    const next = callbacks.getSession();
    if (!next) return;
    clear();
    context = next;
    if (!next.cameraIds.length) {
      camerasEl.innerHTML = '<div class="empty">该 Episode 无相机字段</div>';
      cameraCount.textContent = "该 Episode 无相机字段";
    } else {
      cameraCount.textContent = `${next.cameraIds.length} 路 · 同步视频`;
      for (const cameraId of next.cameraIds) {
        const card = document.createElement("div");
        card.className = "camera-card";
        card.dataset.camera = cameraId;
        card.innerHTML =
          `<video muted playsinline preload="auto" src="/api/lerobot/${encodeURIComponent(next.sessionId)}/video/${encodeURIComponent(cameraId)}"></video>` +
          `<span class="camera-label">${escapeHtml(cameraId)}</span>`;
        const video = card.querySelector("video");
        if (video) videos.push(video);
        camerasEl.append(card);
      }
    }
    slider.max = String(Math.max(0, next.frameCount - 1));
    seekTo(0);
    playBtn.style.display = "";
  }

  function clear(): void {
    pause();
    context = null;
    videos = [];
    currentIndex = 0;
    camerasEl.innerHTML = '<div class="empty">选择一个 Episode 开始回放</div>';
    cameraCount.textContent = "选择 Episode 后显示";
    slider.max = "0";
    slider.value = "0";
    playBtn.style.display = "none";
    playBtn.textContent = "▶ 播放";
  }

  playBtn.addEventListener("click", toggle);
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));
  slider.addEventListener("input", () => {
    if (!context) return;
    pause();
    const index = clampIndex(Number(slider.value));
    seekTo(index);
    callbacks.onFrameChange(index);
  });
  speed.addEventListener("change", () => setSpeed(Number(speed.value || 1)));
  document.addEventListener("keydown", (event) => {
    if (!context) return;
    if ((event.target as HTMLElement | null)?.matches("input,select,textarea")) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    else if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
    else if (event.key === " ") { event.preventDefault(); toggle(); }
  });

  return { load, clear, toggle, step, setSpeed, isPlaying: () => playing };
}
