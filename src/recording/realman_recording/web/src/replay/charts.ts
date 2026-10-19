// LeRobot Studio-style chart panel, rendered with the same charting library
// LeRobot Studio uses (uPlot). One feature is selected and every dimension is
// plotted as a colour-coded series. uPlot provides the y-axis ticks, gridlines
// and drag-to-zoom, so the aggregate chart needs no hand-rolled SVG. A per-joint
// filter toggles dimensions, and a "split" view renders one mini-chart per
// dimension (hand-rolled SVG, since uPlot is overkill for 48px strips).

import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

export type HealthMeta = {
  valid_frames?: number;
  invalid_frames?: number;
  max_sync_error_ns?: number;
};

type ReplayFeatureValue = number | boolean | ReplayFeatureValue[];

export type ChartFrame = {
  frame_index: number;
  timestamp_ns: number;
  state: number[];
  action: number[];
  features?: Record<string, ReplayFeatureValue>;
  source_timestamps_ns?: Record<string, string>;
};

export type FeatureMetadata = { dtype?: string; shape?: number[]; names?: unknown };
export type ChartSummary = {
  features?: Record<string, FeatureMetadata>;
  canonical?: Record<string, unknown>;
};

export type ChartApi = {
  setFeatures(features: string[], summary?: ChartSummary): void;
  render(frame: ChartFrame, frames: ChartFrame[], index: number): void;
  clear(): void;
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

function numericComponents(value: ReplayFeatureValue | undefined): number[] {
  if (typeof value === "number" && Number.isFinite(value)) return [value];
  if (typeof value === "boolean") return [value ? 1 : 0];
  if (Array.isArray(value)) return value.flatMap((item) => numericComponents(item));
  return [];
}

const PALETTE = [
  "#67d391", "#55a6ff", "#f4bb63", "#ff717c", "#b18cff", "#4ec9d8",
  "#e8c547", "#ff9e64", "#7ee787", "#79c0ff", "#f97583", "#d2a8ff",
  "#56d4dd", "#e3b341", "#ffa657", "#a5d6ff", "#6ee7b7", "#c084fc",
];

function colorFor(index: number): string {
  return PALETTE[index % PALETTE.length] ?? "#67d391";
}

function shortName(feature: string): string {
  return feature.replace(/^(observation|action|quality)\./, "");
}

// Dimension labels for a feature, mirroring the exporter's canonical metadata so
// joints/axes are named instead of bare indices.
function componentLabels(
  feature: string,
  count: number,
  summary: Record<string, FeatureMetadata>,
  canonical: Record<string, unknown>,
): string[] {
  const featureNames = summary[feature]?.names;
  if (Array.isArray(featureNames) && featureNames.length === count
    && featureNames.every((name) => typeof name === "string" && name.length > 0)) {
    return featureNames as string[];
  }
  const syncSourceIds = Array.isArray(canonical.quality_sync_source_ids)
    ? canonical.quality_sync_source_ids.filter((source): source is string => typeof source === "string")
    : [];
  if (feature === "quality.sync_error_ns" && syncSourceIds.length === count) return syncSourceIds;
  const jointNames = Array.isArray(canonical.joint_names)
    ? canonical.joint_names.filter((name): name is string => typeof name === "string")
    : [];
  const baseFrames = Array.isArray(canonical.base_frames)
    ? canonical.base_frames.filter((name): name is string => typeof name === "string")
    : [];
  const arms = baseFrames.map((frameName) => frameName.split("/")[0]);
  const jointFeature = ["observation.joint_position", "observation.joint_velocity", "observation.joint_effort"].includes(feature);
  if (jointFeature && jointNames.length && arms.length * jointNames.length === count) {
    return arms.flatMap((arm) => jointNames.map((joint) => `${arm}.${joint}`));
  }
  const positionAxes = ["x", "y", "z"];
  const rotationAxes = ["qx", "qy", "qz", "qw"];
  const linearAxes = ["vx", "vy", "vz"];
  const angularAxes = ["wx", "wy", "wz"];
  const velocityAxes = ["vx", "vy", "vz", "wx", "wy", "wz"];
  const command = canonical.cartesian_command as { frames?: unknown } | undefined;
  const commandFrames = Array.isArray(command?.frames)
    ? command.frames.filter((name): name is string => typeof name === "string")
    : [];
  const axes = feature === "observation.ee_position" ? positionAxes
    : feature === "observation.ee_rotation" ? rotationAxes
    : feature === "observation.ee_linear_velocity" ? linearAxes
    : feature === "observation.ee_angular_velocity" ? angularAxes
    : feature === "action.command_action" || feature === "action.executed_action" ? velocityAxes
      : [];
  const frameNames = feature === "action.command_action" ? commandFrames : baseFrames;
  if (axes.length && frameNames.length * axes.length === count) {
    return frameNames.flatMap((frameName) => axes.map((axis) => `${frameName.split("/")[0]}.${axis}`));
  }
  return Array.from({ length: count }, (_, index) => `${feature.split(".").at(-1)}[${index}]`);
}

const PAD = 10;
const SPLIT_HEIGHT = 48;

export function initCharts(): ChartApi {
  const featureSelect = $<HTMLSelectElement>("#replay-feature-select");
  const jointFilterEl = $("#replay-joint-filter");
  const legendEl = $("#replay-chart-legend");
  const chartEl = $("#replay-feature-chart");
  const splitEl = $("#replay-split-charts");
  const splitToggle = $<HTMLButtonElement>("#replay-split-toggle");
  const resetZoomBtn = $<HTMLButtonElement>("#replay-zoom-reset");
  const rawEl = $("#replay-feature-raw");
  const countEl = $("#replay-feature-count");

  let summary: Record<string, FeatureMetadata> = {};
  let canonical: Record<string, unknown> = {};
  let selectedFeature = "";
  let renderedFeature = "";
  let dimensions: string[] = [];
  let selected = new Set<number>();
  let splitMode = false;
  let lastFrames: ChartFrame[] = [];
  let lastIndex = 0;
  let plot: uPlot | null = null;
  let lastSeriesSignature = "";
  let markerIndex = -1;

  function setFeatures(features: string[], nextSummary?: ChartSummary): void {
    summary = nextSummary?.features ?? {};
    canonical = nextSummary?.canonical ?? {};
    const groups: Array<[string, string[]]> = [
      ["动作", features.filter((feature) => feature.startsWith("action."))],
      ["质量", features.filter((feature) => feature.startsWith("quality."))],
      ["状态", features.filter((feature) => !feature.startsWith("action.") && !feature.startsWith("quality."))],
    ];
    featureSelect.innerHTML = groups
      .filter(([, list]) => list.length)
      .map(([label, list]) =>
        `<optgroup label="${label}">${list.map((feature) => `<option value="${escapeHtml(feature)}">${escapeHtml(shortName(feature))}</option>`).join("")}</optgroup>`)
      .join("");
    selectedFeature = featureSelect.querySelector("option")?.value ?? "";
    renderedFeature = "";
    dimensions = [];
    selected = new Set();
    lastSeriesSignature = "";
    countEl.textContent = `${features.length} fields`;
    jointFilterEl.innerHTML = "";
    legendEl.innerHTML = "";
    chartEl.innerHTML = "";
    splitEl.innerHTML = "";
    rawEl.textContent = "选择一个字段查看数据";
  }

  function renderJointFilter(labels: string[]): void {
    if (selectedFeature === renderedFeature) {
      const count = jointFilterEl.querySelector(".joint-count");
      if (count) count.textContent = `已选 ${selected.size}/${labels.length}`;
      return;
    }
    renderedFeature = selectedFeature;
    dimensions = labels;
    selected = new Set(labels.map((_, index) => index));

    const groups = new Map<string, number[]>();
    labels.forEach((label, index) => {
      const key = /^([a-z])\./.exec(label)?.[1] ?? "维度";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(index);
    });
    const groupHtml = ["l", "m", "r", "维度"]
      .filter((key) => groups.has(key))
      .map((key) => {
        const chips = groups.get(key)!.map((index) =>
          `<label class="joint-chip"><input type="checkbox" data-dim="${index}" checked><span style="--chip:${colorFor(index)}">${escapeHtml(labels[index])}</span></label>`)
          .join("");
        return `<div class="joint-group"><span class="joint-group-label">${key === "维度" ? "其他" : key}</span><div class="joint-group-chips">${chips}</div></div>`;
      })
      .join("");

    jointFilterEl.innerHTML =
      `<button class="joint-dropdown-trigger" type="button">维度筛选 · <b class="joint-count">已选 ${labels.length}/${labels.length}</b><span class="joint-caret">▾</span></button>` +
      `<div class="joint-dropdown-menu">` +
      `<div class="joint-filter-toolbar"><button type="button" data-joint="all">全选</button><button type="button" data-joint="none">全不选</button></div>` +
      groupHtml +
      `</div>`;

    jointFilterEl.querySelector<HTMLButtonElement>(".joint-dropdown-trigger")?.addEventListener("click", (event) => {
      event.stopPropagation();
      jointFilterEl.classList.toggle("open");
    });

    jointFilterEl.querySelectorAll<HTMLInputElement>("input[data-dim]").forEach((input) => {
      input.addEventListener("change", () => {
        const index = Number(input.dataset.dim);
        if (input.checked) selected.add(index);
        else selected.delete(index);
        lastSeriesSignature = "";
        renderChart();
        const count = jointFilterEl.querySelector(".joint-count");
        if (count) count.textContent = `已选 ${selected.size}/${labels.length}`;
      });
    });
    jointFilterEl.querySelectorAll<HTMLButtonElement>("button[data-joint]").forEach((button) => {
      button.addEventListener("click", () => {
        const all = button.dataset.joint === "all";
        selected = new Set(all ? labels.map((_, index) => index) : []);
        jointFilterEl.querySelectorAll<HTMLInputElement>("input[data-dim]").forEach((input) => {
          input.checked = all;
        });
        lastSeriesSignature = "";
        renderChart();
        const count = jointFilterEl.querySelector(".joint-count");
        if (count) count.textContent = `已选 ${selected.size}/${labels.length}`;
      });
    });
  }

  function selectedDimensions(): number[] {
    return dimensions.map((_, dim) => dim).filter((dim) => selected.has(dim));
  }

  function renderAggregate(): void {
    const dims = selectedDimensions();
    const signature = `${selectedFeature}\u0000${dims.join(",")}\u0000${lastFrames.length}\u0000${lastFrames[0]?.frame_index ?? 0}`;
    if (!dims.length) {
      if (plot) { plot.destroy(); plot = null; lastSeriesSignature = ""; }
      chartEl.innerHTML = "";
      legendEl.innerHTML = "";
      return;
    }
    if (!plot || signature !== lastSeriesSignature) {
      if (plot) { plot.destroy(); plot = null; }
      lastSeriesSignature = signature;
      const series: uPlot.Series[] = [
        { label: "帧" },
        ...dims.map((dim) => ({ label: dimensions[dim], stroke: colorFor(dim), width: 1.5 })),
      ];
      const xs = lastFrames.map((_, i) => i);
      const data: uPlot.AlignedData = [
        xs,
        ...dims.map((dim) => lastFrames.map((frame) => numericComponents(frame.features?.[selectedFeature])[dim] ?? Number.NaN)),
      ];
      chartEl.innerHTML = "";
      plot = new uPlot(
        {
          width: chartEl.clientWidth || 800,
          height: chartEl.clientHeight || 240,
          series,
          axes: [
            {
              stroke: "#263246",
              grid: { stroke: "#263246", width: 1 },
              ticks: { stroke: "#263246", width: 1 },
              font: "10px ui-monospace,Menlo,monospace",
              size: 24,
            },
            {
              stroke: "#263246",
              grid: { stroke: "#263246", width: 1 },
              ticks: { stroke: "#263246", width: 1 },
              font: "10px ui-monospace,Menlo,monospace",
              size: 56,
            },
          ],
          scales: { x: { time: false } },
          cursor: { drag: { x: true, y: true, setScale: true }, points: { show: false } },
          legend: { show: false },
          padding: [8, 10, 8, 10],
          hooks: {
            draw: [(u) => {
              if (markerIndex < 0) return;
              const x = u.valToPos(markerIndex, "x");
              if (x < u.bbox.left || x > u.bbox.left + u.bbox.width) return;
              u.ctx.save();
              u.ctx.strokeStyle = "#8793a8";
              u.ctx.lineWidth = 1;
              u.ctx.beginPath();
              u.ctx.moveTo(x, u.bbox.top);
              u.ctx.lineTo(x, u.bbox.top + u.bbox.height);
              u.ctx.stroke();
              u.ctx.restore();
            }],
          },
        },
        data,
        chartEl,
      );
    }
    markerIndex = lastIndex;
    plot.redraw(false, false);
    legendEl.innerHTML = dims
      .map((dim) => `<span class="legend-chip"><i style="background:${colorFor(dim)}"></i>${escapeHtml(dimensions[dim])}</span>`)
      .join("");
  }

  function renderSplit(): void {
    const dims = selectedDimensions();
    splitEl.innerHTML = dims.length
      ? dims.map((dim) => {
          const values = lastFrames.map((frame) => numericComponents(frame.features?.[selectedFeature])[dim] ?? Number.NaN);
          const finite = values.filter((value) => Number.isFinite(value));
          const min = finite.length ? Math.min(...finite) : 0;
          const max = finite.length ? Math.max(...finite) : 1;
          const span = max - min || 1;
          const width = Math.max(320, splitEl.clientWidth || 320);
          const x = (i: number) => PAD + (i / Math.max(1, values.length - 1)) * (width - PAD * 2);
          const y = (value: number) => SPLIT_HEIGHT - PAD - ((value - min) / span) * (SPLIT_HEIGHT - PAD * 2);
          const polyline = values
            .map((value, i) => (Number.isFinite(value) ? `${x(i).toFixed(1)},${y(value).toFixed(1)}` : ""))
            .filter(Boolean)
            .join(" ");
          const markerX = x(Math.max(0, Math.min(values.length - 1, lastIndex)));
          return (
            `<div class="split-mini"><div class="split-mini-head"><span style="--chip:${colorFor(dim)}">${escapeHtml(dimensions[dim])}</span><b>${max.toPrecision(3)}</b></div>` +
            `<svg viewBox="0 0 ${width} ${SPLIT_HEIGHT}" preserveAspectRatio="none"><polyline points="${polyline}" fill="none" stroke="${colorFor(dim)}" stroke-width="1.5" vector-effect="non-scaling-stroke"/><line x1="${markerX.toFixed(1)}" x2="${markerX.toFixed(1)}" y1="${PAD}" y2="${SPLIT_HEIGHT - PAD}" stroke="#8793a8" stroke-width="1"/></svg></div>`
          );
        }).join("")
      : '<div class="empty">未选择任何维度</div>';
    legendEl.innerHTML = "";
  }

  function resetZoom(): void {
    if (plot) { plot.destroy(); plot = null; }
    lastSeriesSignature = "";
    renderAggregate();
  }

  function renderChart(): void {
    if (!selectedFeature || !lastFrames.length) return;
    if (splitMode) {
      if (plot) { plot.destroy(); plot = null; lastSeriesSignature = ""; }
      chartEl.innerHTML = "";
      renderSplit();
    } else {
      splitEl.innerHTML = "";
      renderAggregate();
    }
    resetZoomBtn.style.display = splitMode ? "none" : "";
  }

  function render(frame: ChartFrame, frames: ChartFrame[], index: number): void {
    selectedFeature = featureSelect.value;
    if (!selectedFeature) return;
    lastFrames = frames;
    lastIndex = index;
    const values = numericComponents(frame.features?.[selectedFeature]);
    const labels = componentLabels(selectedFeature, values.length, summary, canonical);
    renderJointFilter(labels);

    rawEl.textContent = JSON.stringify(
      { feature: selectedFeature, value: frame.features?.[selectedFeature], frame_index: frame.frame_index, dimensions: labels },
      null,
      2,
    );

    renderChart();
  }

  function clear(): void {
    if (plot) { plot.destroy(); plot = null; }
    selectedFeature = "";
    renderedFeature = "";
    dimensions = [];
    selected = new Set();
    lastFrames = [];
    lastIndex = 0;
    lastSeriesSignature = "";
    markerIndex = -1;
    featureSelect.innerHTML = "";
    jointFilterEl.innerHTML = "";
    legendEl.innerHTML = "";
    chartEl.innerHTML = "";
    splitEl.innerHTML = "";
    countEl.textContent = "—";
    rawEl.textContent = "选择一个字段查看数据";
    splitToggle.classList.remove("active");
    splitMode = false;
    resetZoomBtn.style.display = "none";
  }

  splitToggle.addEventListener("click", () => {
    splitMode = !splitMode;
    splitToggle.classList.toggle("active", splitMode);
    renderChart();
  });
  resetZoomBtn.addEventListener("click", resetZoom);
  chartEl.addEventListener("dblclick", () => {
    if (!splitMode) resetZoom();
  });
  document.addEventListener("click", (event) => {
    if (!jointFilterEl.contains(event.target as Node)) jointFilterEl.classList.remove("open");
  });

  return { setFeatures, render, clear };
}

export function renderHealth(meta?: HealthMeta): void {
  const el = $("#replay-health");
  if (!el) return;
  if (!meta) {
    el.innerHTML = '<div class="empty">选择 Episode 后显示健康统计</div>';
    return;
  }
  const valid = meta.valid_frames ?? 0;
  const invalid = meta.invalid_frames ?? 0;
  const syncNs = meta.max_sync_error_ns;
  const syncText = syncNs == null
    ? "—"
    : syncNs < 1e6
      ? `${(syncNs / 1e3).toFixed(1)} µs`
      : `${(syncNs / 1e6).toFixed(2)} ms`;
  el.innerHTML =
    `<div class="health-stat"><span>有效帧</span><b>${valid}</b></div>` +
    `<div class="health-stat"><span>无效帧</span><b>${invalid}</b></div>` +
    `<div class="health-stat"><span>最大同步误差</span><b>${syncText}</b></div>`;
}
