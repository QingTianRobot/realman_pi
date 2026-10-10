// LeRobot Studio-style chart panel: one feature is selected, and every one of its
// dimensions (joints / ee axes / sync sources) is plotted on a single aggregate
// chart with a per-dimension colour. A per-joint filter toggles dimensions, and a
// "split" view renders one mini-chart per dimension instead of overlaying them.

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

// Per-dimension colour: a stable, high-contrast palette cycled across the axes of
// a feature, matching the existing green/blue/amber recording accent set.
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

const WIDTH = 320;
const HEIGHT = 160;
const PAD = 8;

export function initCharts(): ChartApi {
  const featureSelect = $<HTMLSelectElement>("#replay-feature-select");
  const jointFilterEl = $("#replay-joint-filter");
  const legendEl = $("#replay-chart-legend");
  const chartEl = $("#replay-feature-chart");
  const splitEl = $("#replay-split-charts");
  const splitToggle = $<HTMLButtonElement>("#replay-split-toggle");
  const rawEl = $("#replay-feature-raw");
  const countEl = $("#replay-feature-count");

  let summary: Record<string, FeatureMetadata> = {};
  let canonical: Record<string, unknown> = {};
  let selectedFeature = "";
  let renderedFeature = "";
  let dimensions: string[] = [];
  let selected = new Set<number>();
  let splitMode = false;
  let cachedKey = "";
  let cachedMarker: SVGLineElement | null = null;

  function setFeatures(features: string[], nextSummary?: ChartSummary): void {
    summary = nextSummary?.features ?? {};
    canonical = nextSummary?.canonical ?? {};
    cachedKey = "";
    cachedMarker = null;
    // Group the flat feature list into 动作 / 质量 / 状态 optgroups so the
    // dropdown stays readable instead of a long unlabelled list.
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
    countEl.textContent = `${features.length} fields`;
    jointFilterEl.innerHTML = "";
    legendEl.innerHTML = "";
    chartEl.innerHTML = "";
    splitEl.innerHTML = "";
    rawEl.textContent = "选择一个字段查看数据";
  }

  function renderJointFilter(labels: string[]): void {
    if (selectedFeature === renderedFeature) {
      // Same feature: only the selected count may have changed via chip toggles.
      const count = jointFilterEl.querySelector(".joint-count");
      if (count) count.textContent = `已选 ${selected.size}/${labels.length}`;
      return;
    }
    renderedFeature = selectedFeature;
    dimensions = labels;
    selected = new Set(labels.map((_, index) => index));

    // Group dimensions by arm (l/m/r) so an 18-joint feature collapses into
    // three labelled groups instead of a wall of flat chips. Features without a
    // single-letter arm prefix (e.g. sync sources) share one "维度" group.
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
      `<details class="joint-details"><summary>维度筛选 · <b class="joint-count">已选 ${labels.length}/${labels.length}</b></summary>` +
      `<div class="joint-filter-toolbar"><button type="button" data-joint="all">全选</button><button type="button" data-joint="none">全不选</button></div>` +
      groupHtml +
      `</details>`;

    jointFilterEl.querySelectorAll<HTMLInputElement>("input[data-dim]").forEach((input) => {
      input.addEventListener("change", () => {
        const index = Number(input.dataset.dim);
        if (input.checked) selected.add(index);
        else selected.delete(index);
        cachedKey = "";
        cachedMarker = null;
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
        cachedKey = "";
        cachedMarker = null;
        const count = jointFilterEl.querySelector(".joint-count");
        if (count) count.textContent = `已选 ${selected.size}/${labels.length}`;
      });
    });
  }

  function renderAggregate(frames: ChartFrame[], index: number): void {
    const series = dimensions
      .map((_, dim) => ({ dim, values: frames.map((item) => numericComponents(item.features?.[selectedFeature])[dim] ?? Number.NaN) }))
      .filter((entry) => selected.has(entry.dim));
    if (!series.length) {
      chartEl.innerHTML = "";
      legendEl.innerHTML = "";
      return;
    }
    const all = series.flatMap((entry) => entry.values).filter((value) => Number.isFinite(value));
    if (!all.length) {
      chartEl.innerHTML = "";
      return;
    }
    const min = Math.min(...all);
    const max = Math.max(...all);
    const span = max - min || 1;
    const x = (i: number) => PAD + (i / Math.max(1, frames.length - 1)) * (WIDTH - PAD * 2);
    const y = (value: number) => HEIGHT - PAD - ((value - min) / span) * (HEIGHT - PAD * 2);
    const polyline = (values: number[], color: string) =>
      `<polyline points="${values
        .map((value, i) => (Number.isFinite(value) ? `${x(i).toFixed(1)},${y(value).toFixed(1)}` : ""))
        .filter(Boolean)
        .join(" ")}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
    chartEl.innerHTML =
      series.map((entry) => polyline(entry.values, colorFor(entry.dim))).join("") +
      `<line class="chart-marker" x1="0" x2="0" y1="${PAD}" y2="${HEIGHT - PAD}" stroke="#8793a8" stroke-width="1"/>` +
      `<text x="${PAD}" y="${HEIGHT - 2}" fill="#8793a8" font-size="9">${min.toPrecision(4)} — ${max.toPrecision(4)}</text>`;
    cachedMarker = chartEl.querySelector<SVGLineElement>("line.chart-marker");

    legendEl.innerHTML = series
      .map((entry) => `<span class="legend-chip"><i style="background:${colorFor(entry.dim)}"></i>${escapeHtml(dimensions[entry.dim])}</span>`)
      .join("");

    const markerX = PAD + (index / Math.max(1, frames.length - 1)) * (WIDTH - PAD * 2);
    if (cachedMarker) {
      cachedMarker.setAttribute("x1", markerX.toFixed(1));
      cachedMarker.setAttribute("x2", markerX.toFixed(1));
    }
  }

  function renderSplit(frames: ChartFrame[], index: number): void {
    const rows = dimensions
      .map((_, dim) => ({ dim, values: frames.map((item) => numericComponents(item.features?.[selectedFeature])[dim] ?? Number.NaN) }))
      .filter((entry) => selected.has(entry.dim));
    splitEl.innerHTML = rows.length
      ? rows.map((entry) => {
          const values = entry.values;
          const finite = values.filter((value) => Number.isFinite(value));
          const min = finite.length ? Math.min(...finite) : 0;
          const max = finite.length ? Math.max(...finite) : 1;
          const span = max - min || 1;
          const x = (i: number) => PAD + (i / Math.max(1, values.length - 1)) * (WIDTH - PAD * 2);
          const y = (value: number) => 48 - PAD - ((value - min) / span) * (48 - PAD * 2);
          const polyline = values
            .map((value, i) => (Number.isFinite(value) ? `${x(i).toFixed(1)},${y(value).toFixed(1)}` : ""))
            .filter(Boolean)
            .join(" ");
          const markerX = PAD + (index / Math.max(1, values.length - 1)) * (WIDTH - PAD * 2);
          return (
            `<div class="split-mini"><div class="split-mini-head"><span style="--chip:${colorFor(entry.dim)}">${escapeHtml(dimensions[entry.dim])}</span><b>${max.toPrecision(3)}</b></div>` +
            `<svg viewBox="0 0 ${WIDTH} 48" preserveAspectRatio="none"><polyline points="${polyline}" fill="none" stroke="${colorFor(entry.dim)}" stroke-width="1.5"/><line x1="${markerX.toFixed(1)}" x2="${markerX.toFixed(1)}" y1="${PAD}" y2="${40}" stroke="#8793a8" stroke-width="1"/></svg></div>`
          );
        }).join("")
      : '<div class="empty">未选择任何维度</div>';
    legendEl.innerHTML = "";
  }

  function render(frame: ChartFrame, frames: ChartFrame[], index: number): void {
    selectedFeature = featureSelect.value;
    if (!selectedFeature) return;
    const values = numericComponents(frame.features?.[selectedFeature]);
    const labels = componentLabels(selectedFeature, values.length, summary, canonical);
    renderJointFilter(labels);

    rawEl.textContent = JSON.stringify(
      { feature: selectedFeature, value: frame.features?.[selectedFeature], frame_index: frame.frame_index, dimensions: labels },
      null,
      2,
    );

    if (splitMode) {
      chartEl.innerHTML = "";
      renderSplit(frames, index);
      return;
    }
    splitEl.innerHTML = "";
    renderAggregate(frames, index);
  }

  function clear(): void {
    cachedKey = "";
    cachedMarker = null;
    selectedFeature = "";
    renderedFeature = "";
    dimensions = [];
    selected = new Set();
    featureSelect.innerHTML = "";
    jointFilterEl.innerHTML = "";
    legendEl.innerHTML = "";
    chartEl.innerHTML = "";
    splitEl.innerHTML = "";
    countEl.textContent = "—";
    rawEl.textContent = "选择一个字段查看数据";
    splitToggle.classList.remove("active");
    splitMode = false;
  }

  splitToggle.addEventListener("click", () => {
    splitMode = !splitMode;
    splitToggle.classList.toggle("active", splitMode);
    cachedKey = "";
    cachedMarker = null;
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
