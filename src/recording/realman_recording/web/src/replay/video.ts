// Synchronized multi-camera replay. Every camera of the selected session plays
// side by side in the replay workspace, driven by one timeline:
//   - "video":  a converted LeRobot episode, one <video> per camera (AV1 mp4),
//               positioned by `video.currentTime = frameIndex / fps`;
//   - "frames": a pending (待转换) raw session, one <img> per camera showing the
//               session's own JPEGs, picked per frame by the server's timeline.
// Raw playback is load-driven per camera: a tile only requests its next JPEG once
// the previous one has arrived, so a slow link drops frames instead of queueing.

export type VideoContext = {
  kind: "video" | "frames";
  sessionId: string;
  fps: number;
  frameCount: number;
  cameraIds: string[];
  /** frames mode: the JPEG filename each camera shows at a frame index. */
  frameImage?(frameIndex: number, cameraId: string): string | null;
  /** frames mode: total JPEGs recorded per camera, shown on the tile. */
  cameraFrameCounts?: Record<string, number>;
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
// Raw tiles are downscaled server-side; three tiles side by side never need more.
const RAW_THUMB_WIDTH = 640;
const MIN_TILE_WIDTH = 260;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

// Two <img> per tile, swapped like a double buffer: `loader` fetches AND decodes the
// next JPEG off-screen, then replaces the visible element in the DOM. Changing the
// visible element's src instead let Chrome paint the tile empty for one frame while
// decoding (measured: 12-20 dark flashes per tile per 10 s on SJDrealman).
type RawTile = { img: HTMLImageElement; loader: HTMLImageElement; cameraId: string; shown: string; pending: string; loading: boolean };

function tileImage(cameraId: string): HTMLImageElement {
  const image = new Image();
  image.alt = `${cameraId} 原始帧`;
  return image;
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
  let tiles: RawTile[] = [];
  let context: VideoContext | null = null;
  let currentIndex = 0;
  let playing = false;
  let looping = false;
  let raf = 0;
  // frames mode clock: playback position = anchorIndex + elapsed * fps * rate.
  let anchorIndex = 0;
  let anchorTime = 0;

  function rate(): number {
    return Number(speed.value || 1) || 1;
  }

  function clampIndex(index: number): number {
    if (!context || context.frameCount <= 0) return 0;
    return Math.min(context.frameCount - 1, Math.max(0, index));
  }

  function rawUrl(cameraId: string, filename: string): string {
    if (!context) return "";
    return `/api/lerobot/${encodeURIComponent(context.sessionId)}/raw/image/${encodeURIComponent(cameraId)}/${encodeURIComponent(filename)}?w=${RAW_THUMB_WIDTH}`;
  }

  function requestTile(tile: RawTile): void {
    if (tile.loading || !tile.pending || tile.pending === tile.shown) return;
    tile.loading = true;
    tile.shown = tile.pending;
    tile.loader.src = rawUrl(tile.cameraId, tile.pending);
  }

  function showRawFrame(index: number): void {
    if (!context?.frameImage) return;
    for (const tile of tiles) {
      tile.pending = context.frameImage(index, tile.cameraId) ?? "";
      requestTile(tile);
    }
  }

  function seekTo(index: number): void {
    if (!context) return;
    currentIndex = clampIndex(index);
    slider.value = String(currentIndex);
    if (context.kind === "frames") {
      showRawFrame(currentIndex);
      return;
    }
    const time = currentIndex / context.fps;
    for (const video of videos) {
      try {
        video.currentTime = time;
      } catch {
        /* metadata may not be loaded yet; the next seek will retry */
      }
    }
  }

  function playheadIndex(): number {
    if (!context) return 0;
    if (context.kind === "frames") {
      const elapsed = (performance.now() - anchorTime) / 1000;
      return clampIndex(anchorIndex + Math.floor(elapsed * context.fps * rate()));
    }
    return clampIndex(Math.round((videos[0]?.currentTime ?? 0) * context.fps));
  }

  function restartFromZero(): void {
    currentIndex = 0;
    slider.value = "0";
    anchorIndex = 0;
    anchorTime = performance.now();
    if (context?.kind === "frames") showRawFrame(0);
    for (const video of videos) {
      try { video.currentTime = 0; } catch { /* ignore */ }
    }
    callbacks.onFrameChange(0);
  }

  function renderLoop(): void {
    if (!playing || !context) return;
    const index = playheadIndex();
    // requestAnimationFrame fires at ~60 Hz while frames change at ~15 Hz: only
    // propagate a change, re-rendering charts for the same index is wasted work.
    if (index !== currentIndex) {
      currentIndex = index;
      slider.value = String(index);
      if (context.kind === "frames") showRawFrame(index);
      callbacks.onFrameChange(index);
    }
    if (index >= context.frameCount - 1) {
      if (looping) restartFromZero();
      else {
        pause();
        return;
      }
    }
    raf = requestAnimationFrame(renderLoop);
  }

  function play(): void {
    if (!context || (context.kind === "video" && !videos.length)) return;
    if (currentIndex >= context.frameCount - 1) seekTo(0);
    playing = true;
    playBtn.textContent = "⏸ 暂停";
    playBtn.classList.add("primary");
    anchorIndex = currentIndex;
    anchorTime = performance.now();
    for (const video of videos) {
      video.playbackRate = rate();
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

  function setSpeed(next: number): void {
    for (const video of videos) video.playbackRate = next;
    // Re-anchor so a speed change mid-play continues from the current frame.
    anchorIndex = currentIndex;
    anchorTime = performance.now();
  }

  // All cameras in one row whenever each tile can stay at least MIN_TILE_WIDTH
  // wide, so the curves below stay on screen; a narrow panel stacks them instead.
  function layoutTiles(): void {
    const count = camerasEl.querySelectorAll(".camera-card").length;
    const box = camerasEl.getBoundingClientRect();
    if (!count || !box.width) return;
    const gap = 10, padding = 24;
    const fit = Math.floor((box.width - padding + gap) / (MIN_TILE_WIDTH + gap));
    const columns = Math.max(1, Math.min(count, fit));
    camerasEl.style.setProperty("--replay-columns", String(columns));
    camerasEl.dataset.cameraLayout = `${columns}x${Math.ceil(count / columns)}`;
  }
  new ResizeObserver(layoutTiles).observe(camerasEl);

  function buildTile(cameraId: string, inner: string, meta: string): HTMLElement {
    const card = document.createElement("div");
    card.className = "camera-card";
    card.dataset.camera = cameraId;
    card.innerHTML = `${inner}<span class="camera-label">${escapeHtml(cameraId)}</span>${meta ? `<span class="camera-meta">${escapeHtml(meta)}</span>` : ""}`;
    return card;
  }

  function load(): void {
    const next = callbacks.getSession();
    if (!next) return;
    clear();
    context = next;
    camerasEl.dataset.kind = next.kind;
    if (!next.cameraIds.length) {
      camerasEl.innerHTML = `<div class="empty">${next.kind === "frames" ? "该 session 没有相机帧" : "该 Episode 无相机字段"}</div>`;
      cameraCount.textContent = "无相机";
    } else {
      camerasEl.innerHTML = "";
      cameraCount.textContent = next.kind === "frames"
        ? `${next.cameraIds.length} 路 · 原始 JPEG 同步回放`
        : `${next.cameraIds.length} 路 · 同步视频`;
      for (const cameraId of next.cameraIds) {
        if (next.kind === "frames") {
          const total = next.cameraFrameCounts?.[cameraId];
          const card = buildTile(cameraId, "", total ? `${total} 帧` : "");
          const img = tileImage(cameraId);
          card.prepend(img);
          const tile: RawTile = { img, loader: tileImage(cameraId), cameraId, shown: "", pending: "", loading: false };
          const onLoad = (event: Event) => {
            const loaded = event.currentTarget as HTMLImageElement;
            if (loaded !== tile.loader) return;
            // decode() resolves once the bitmap is ready to paint, so the swap is atomic.
            void loaded.decode().catch(() => undefined).then(() => {
              if (loaded !== tile.loader || !tiles.includes(tile)) return;
              tile.img.replaceWith(loaded);
              tile.loader = tile.img;
              tile.img = loaded;
              tile.loading = false;
              requestTile(tile);
            });
          };
          const onError = (event: Event) => {
            if (event.currentTarget !== tile.loader) return;
            tile.loading = false;
            requestTile(tile);
          };
          for (const element of [tile.img, tile.loader]) {
            element.addEventListener("load", onLoad);
            element.addEventListener("error", onError);
          }
          tiles.push(tile);
          camerasEl.append(card);
        } else {
          const card = buildTile(
            cameraId,
            `<video muted playsinline preload="auto" src="/api/lerobot/${encodeURIComponent(next.sessionId)}/video/${encodeURIComponent(cameraId)}"></video>`,
            "",
          );
          const video = card.querySelector("video");
          if (video) videos.push(video);
          camerasEl.append(card);
        }
      }
    }
    slider.max = String(Math.max(0, next.frameCount - 1));
    seekTo(0);
    layoutTiles();
    playBtn.disabled = false;
  }

  function clear(): void {
    pause();
    context = null;
    videos = [];
    tiles = [];
    currentIndex = 0;
    delete camerasEl.dataset.kind;
    camerasEl.innerHTML = '<div class="empty">从左侧选择一个已转换 Episode 或待转换 session 开始回放</div>';
    cameraCount.textContent = "未选择";
    slider.max = "0";
    slider.value = "0";
    playBtn.disabled = true;
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
  speed.addEventListener("change", () => setSpeed(rate()));
  const loopBtn = $<HTMLButtonElement>("#replay-loop");
  loopBtn?.addEventListener("click", () => {
    looping = !looping;
    loopBtn.classList.toggle("active", looping);
    loopBtn.setAttribute("aria-pressed", String(looping));
  });
  document.addEventListener("keydown", (event) => {
    if (!context) return;
    if ((event.target as HTMLElement | null)?.matches("input,select,textarea")) return;
    if ((event.target as HTMLElement | null)?.closest("dialog[open]")) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    else if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
    else if (event.key === " ") { event.preventDefault(); toggle(); }
  });

  return { load, clear, toggle, step, setSpeed, isPlaying: () => playing };
}
