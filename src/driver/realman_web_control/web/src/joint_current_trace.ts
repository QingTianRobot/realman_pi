// Scrolling 2D chart of one arm's six joint currents, each drawn as |current| / its guard limit
// (policy_task.current_guard.limits_ma), so one dashed line at 100 % is every joint's threshold.

import { TRACE_WINDOW_MS } from "./velocity_trace";

export const JOINT_COLORS = ["#e5484d", "#f76b15", "#30a46c", "#12a594", "#3e63dd", "#8e4ec6"] as const;
// Break a line instead of bridging samples further apart than this.
const MAX_GAP_MS = 600;
// The axis never shows less than this, so the threshold line is always in view.
const MIN_SCALE_PERCENT = 150;
const LIMIT_COLOR = "#e5484d";

type Sample = { t: number; percent: number[] | null };

export class JointCurrentTrace {
  private samples: Sample[] = [];
  private scale = MIN_SCALE_PERCENT;
  private shrinkSince = 0;
  private readonly context: CanvasRenderingContext2D | null;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly limitsMa: readonly number[]) {
    this.context = canvas.getContext("2d");
  }

  // `currentsMa` are the driver's signed readings; null records a gap.
  push(t: number, currentsMa: number[] | null) {
    const valid = Array.isArray(currentsMa) && currentsMa.length === 6 && currentsMa.every(Number.isFinite);
    const percent = valid ? currentsMa.map((value, joint) => (Math.abs(value) / this.limitsMa[joint]) * 100) : null;
    this.samples.push({ t, percent });
    this.canvas.dataset.lastPercent = JSON.stringify(percent?.map((value) => Math.round(value)) ?? null);
    const cutoff = t - TRACE_WINDOW_MS - MAX_GAP_MS;
    while (this.samples.length && this.samples[0].t < cutoff) this.samples.shift();
  }

  draw(now: number) {
    const context = this.context;
    const { clientWidth: width, clientHeight: height } = this.canvas;
    if (!context || !width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (this.canvas.width !== Math.round(width * ratio) || this.canvas.height !== Math.round(height * ratio)) {
      this.canvas.width = Math.round(width * ratio);
      this.canvas.height = Math.round(height * ratio);
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const start = now - TRACE_WINDOW_MS;
    const visible = this.samples.filter((sample) => sample.t >= start - MAX_GAP_MS);
    let peak = 0;
    for (const sample of visible) if (sample.percent) peak = Math.max(peak, ...sample.percent);
    // Grow at once so a spike never clips; shrink only after a second of smaller data.
    const target = Math.max(MIN_SCALE_PERCENT, Math.ceil((peak * 1.1) / 50) * 50);
    if (target > this.scale) {
      this.scale = target;
      this.shrinkSince = 0;
    } else if (target < this.scale) {
      this.shrinkSince ||= now;
      if (now - this.shrinkSince > 1000) {
        this.scale = target;
        this.shrinkSince = 0;
      }
    } else {
      this.shrinkSince = 0;
    }
    this.canvas.dataset.yMax = String(this.scale);
    this.canvas.dataset.samples = String(visible.length);

    const left = 38;
    const right = 8;
    const top = 8;
    const bottom = 18;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const x = (t: number) => left + ((t - start) / TRACE_WINDOW_MS) * plotWidth;
    const y = (percent: number) => top + plotHeight - (percent / this.scale) * plotHeight;

    const styles = getComputedStyle(this.canvas);
    const grid = styles.getPropertyValue("--trace-grid").trim() || "#e3e9f0";
    const axis = styles.getPropertyValue("--trace-axis").trim() || "#9fb0c4";
    const label = styles.getPropertyValue("--trace-label").trim() || "#7c8a9c";
    context.font = "9px Inter, ui-sans-serif, system-ui, sans-serif";
    context.lineWidth = 1;

    context.textAlign = "right";
    context.textBaseline = "middle";
    const step = this.scale <= 200 ? 50 : this.scale <= 500 ? 100 : 250;
    for (let percent = 0; percent <= this.scale + 1e-9; percent += step) {
      const py = Math.round(y(percent)) + 0.5;
      context.strokeStyle = percent === 0 ? axis : grid;
      context.beginPath();
      context.moveTo(left, py);
      context.lineTo(left + plotWidth, py);
      context.stroke();
      context.fillStyle = label;
      context.fillText(`${percent}%`, left - 5, py);
    }
    context.textAlign = "center";
    context.textBaseline = "top";
    for (let seconds = -10; seconds <= 0; seconds += 2) {
      const px = Math.round(left + ((seconds * 1000 + TRACE_WINDOW_MS) / TRACE_WINDOW_MS) * plotWidth) + 0.5;
      context.strokeStyle = grid;
      context.beginPath();
      context.moveTo(px, top);
      context.lineTo(px, top + plotHeight);
      context.stroke();
      context.fillStyle = label;
      context.fillText(seconds === 0 ? "0 s" : `${seconds}`, px, top + plotHeight + 4);
    }

    // The guard's threshold, on top of the grid and under the data.
    const limitY = Math.round(y(100)) + 0.5;
    context.strokeStyle = LIMIT_COLOR;
    context.lineWidth = 1.4;
    context.setLineDash([5, 4]);
    context.beginPath();
    context.moveTo(left, limitY);
    context.lineTo(left + plotWidth, limitY);
    context.stroke();
    context.setLineDash([]);

    context.save();
    context.beginPath();
    context.rect(left, top, plotWidth, plotHeight);
    context.clip();
    context.lineWidth = 1.6;
    for (let joint = 0; joint < 6; joint += 1) {
      context.strokeStyle = JOINT_COLORS[joint];
      context.beginPath();
      let previous: Sample | undefined;
      for (const sample of visible) {
        if (!sample.percent) {
          previous = undefined;
          continue;
        }
        const px = x(sample.t);
        const py = y(sample.percent[joint]);
        if (previous && sample.t - previous.t <= MAX_GAP_MS) context.lineTo(px, py);
        else context.moveTo(px, py);
        previous = sample;
      }
      context.stroke();
    }
    context.restore();
  }
}
