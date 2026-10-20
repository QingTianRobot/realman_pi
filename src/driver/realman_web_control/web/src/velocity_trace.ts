// Scrolling 2D chart of a three-axis velocity: measured (solid) against command (dashed),
// one colour per axis, a fixed time window and a y-axis that autoscales to the data.

export const AXIS_COLORS = ["#e5484d", "#30a46c", "#3e63dd"] as const;
export const TRACE_WINDOW_MS = 10_000;
// Break a line instead of bridging samples further apart than this.
const MAX_GAP_MS = 600;

type Sample = { t: number; measured: number[] | null; command: number[] | null };

function finiteVector(values: number[] | null | undefined) {
  return Array.isArray(values) && values.length === 3 && values.every(Number.isFinite) ? values : null;
}

// Smallest 1/2/2.5/5 x 10^n step that covers `value`.
function niceCeil(value: number) {
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  for (const step of [1, 2, 2.5, 5, 10]) if (value <= step * base + 1e-12) return step * base;
  return 10 * base;
}

function tickLabel(value: number) {
  if (value === 0) return "0";
  return String(Number(value.toPrecision(3)));
}

export class VelocityTrace {
  private samples: Sample[] = [];
  private scale: number;
  private shrinkSince = 0;
  private readonly context: CanvasRenderingContext2D | null;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly minScale: number) {
    this.context = canvas.getContext("2d");
    this.scale = minScale;
  }

  push(t: number, measured: number[] | null | undefined, command: number[] | null | undefined) {
    const sample = { t, measured: finiteVector(measured), command: finiteVector(command) };
    this.samples.push(sample);
    this.canvas.dataset.lastCommand = JSON.stringify(sample.command?.map((value) => Number(value.toFixed(4))) ?? null);
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
    for (const sample of visible) {
      for (const vector of [sample.measured, sample.command]) {
        if (vector) for (const value of vector) peak = Math.max(peak, Math.abs(value));
      }
    }
    // Symmetric about zero. Grow at once so nothing clips; shrink only after the data has
    // stayed smaller for a second so the axis does not flicker on every sample.
    const target = niceCeil(Math.max(peak * 1.1, this.minScale));
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
    const y = (value: number) => top + plotHeight / 2 - (value / this.scale) * (plotHeight / 2);

    const styles = getComputedStyle(this.canvas);
    const grid = styles.getPropertyValue("--trace-grid").trim() || "#e3e9f0";
    const axis = styles.getPropertyValue("--trace-axis").trim() || "#9fb0c4";
    const label = styles.getPropertyValue("--trace-label").trim() || "#7c8a9c";
    context.font = "9px Inter, ui-sans-serif, system-ui, sans-serif";
    context.lineWidth = 1;

    context.textAlign = "right";
    context.textBaseline = "middle";
    for (const fraction of [1, 0.5, 0, -0.5, -1]) {
      const value = this.scale * fraction;
      const py = Math.round(top + plotHeight / 2 - fraction * (plotHeight / 2)) + 0.5;
      context.strokeStyle = fraction === 0 ? axis : grid;
      context.beginPath();
      context.moveTo(left, py);
      context.lineTo(left + plotWidth, py);
      context.stroke();
      context.fillStyle = label;
      context.fillText(tickLabel(value), left - 5, py);
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

    context.save();
    context.beginPath();
    context.rect(left, top, plotWidth, plotHeight);
    context.clip();
    for (const kind of ["command", "measured"] as const) {
      context.setLineDash(kind === "command" ? [5, 4] : []);
      context.lineWidth = kind === "command" ? 1.4 : 1.8;
      context.globalAlpha = kind === "command" ? 0.85 : 1;
      for (let axisIndex = 0; axisIndex < 3; axisIndex += 1) {
        context.strokeStyle = AXIS_COLORS[axisIndex];
        context.beginPath();
        let previous: Sample | undefined;
        for (const sample of visible) {
          const vector = sample[kind];
          if (!vector) {
            previous = undefined;
            continue;
          }
          const px = x(sample.t);
          const py = y(vector[axisIndex]);
          if (previous && previous[kind] && sample.t - previous.t <= MAX_GAP_MS) context.lineTo(px, py);
          else context.moveTo(px, py);
          previous = sample;
        }
        context.stroke();
      }
    }
    context.restore();
    context.setLineDash([]);
    context.globalAlpha = 1;
  }
}
