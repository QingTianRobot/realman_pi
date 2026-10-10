// Action-vs-state overlay chart + episode health strip. Reuses the numeric
// feature surface that previously lived in main.ts's renderFeatureInspector.

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
  // Boolean quality flags are plotted as 0/1 while the raw inspector keeps bool.
  if (typeof value === "boolean") return [value ? 1 : 0];
  if (Array.isArray(value)) return value.flatMap((item) => numericComponents(item));
  return [];
}

function componentLabels(feature: string, count: number, summary: Record<string, FeatureMetadata>, canonical: Record<string, unknown>): string[] {
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

export function initCharts(): ChartApi {
  const stateSelect = $<HTMLSelectElement>("#replay-feature-select");
  const actionSelect = $<HTMLSelectElement>("#replay-action-select");
  const componentSelect = $<HTMLSelectElement>("#replay-feature-component");
  const chartEl = $("#replay-feature-chart");
  const rawEl = $("#replay-feature-raw");
  const countEl = $("#replay-feature-count");

  let summary: Record<string, FeatureMetadata> = {};
  let canonical: Record<string, unknown> = {};

  function setFeatures(features: string[], nextSummary?: ChartSummary): void {
    summary = nextSummary?.features ?? {};
    canonical = nextSummary?.canonical ?? {};
    const stateFeatures = features.filter((feature) => !feature.startsWith("action."));
    const actionFeatures = features.filter((feature) => feature.startsWith("action."));
    stateSelect.innerHTML = stateFeatures
      .map((feature) => `<option value="${escapeHtml(feature)}">${escapeHtml(feature)}</option>`)
      .join("");
    actionSelect.innerHTML = actionFeatures.length
      ? actionFeatures.map((feature) => `<option value="${escapeHtml(feature)}">${escapeHtml(feature)}</option>`).join("")
      : '<option value="">— 无动作字段 —</option>';
    countEl.textContent = `${features.length} fields`;
    stateSelect.value = stateFeatures[0] ?? "";
    actionSelect.value = actionFeatures[0] ?? "";
    componentSelect.innerHTML = "";
    componentSelect.hidden = true;
  }

  function render(frame: ChartFrame, frames: ChartFrame[], index: number): void {
    const stateFeature = stateSelect.value;
    const actionFeature = actionSelect.value;
    const stateValues = numericComponents(frame.features?.[stateFeature]);
    const actionValues = numericComponents(frame.features?.[actionFeature]);
    // The component axis follows the state (observation) feature; the action
    // overlay shares the same index and simply omits out-of-range components.
    const count = stateValues.length;
    const labels = componentLabels(stateFeature, count, summary, canonical);

    const optionSignature = [...componentSelect.options].map((option) => `${option.value}\t${option.text}`).join("\n");
    const nextSignature = labels.map((label, i) => `${i}\t${label}`).join("\n");
    const previousIndex = Number(componentSelect.value || 0);
    if (optionSignature !== nextSignature) {
      componentSelect.innerHTML = labels
        .map((label, i) => `<option value="${i}">${escapeHtml(label)}</option>`)
        .join("");
    }
    componentSelect.hidden = count < 2;
    const componentIndex = Math.min(Math.max(0, previousIndex), Math.max(0, count - 1));
    if (count) componentSelect.value = String(componentIndex);

    const selectedComponent = labels[componentIndex];
    rawEl.textContent = JSON.stringify(
      {
        state_feature: stateFeature || null,
        action_feature: actionFeature || null,
        state_value: frame.features?.[stateFeature],
        action_value: frame.features?.[actionFeature],
        component: selectedComponent,
        component_index: componentIndex,
        state_component: stateValues[componentIndex],
        action_component: actionValues[componentIndex],
        frame_index: frame.frame_index,
        source_timestamps_ns: frame.source_timestamps_ns ?? {},
        metadata: canonical,
      },
      null,
      2,
    );

    const stateSeries = frames.map((item) => numericComponents(item.features?.[stateFeature])[componentIndex] ?? Number.NaN);
    const actionSeries = frames.map((item) => numericComponents(item.features?.[actionFeature])[componentIndex] ?? Number.NaN);
    const all = [...stateSeries, ...actionSeries].filter((value): value is number => Number.isFinite(value));
    if (!count || !all.length) {
      chartEl.innerHTML = "";
      return;
    }
    const min = Math.min(...all);
    const max = Math.max(...all);
    const span = max - min || 1;
    const width = 320;
    const height = 120;
    const pad = 8;
    const x = (i: number) => pad + (i / Math.max(1, frames.length - 1)) * (width - pad * 2);
    const y = (value: number) => height - pad - ((value - min) / span) * (height - pad * 2);
    const polyline = (series: number[]) => series
      .map((value, i) => (Number.isFinite(value) ? `${x(i).toFixed(1)},${y(value).toFixed(1)}` : ""))
      .filter(Boolean)
      .join(" ");
    const markerX = x(index);
    chartEl.innerHTML =
      `<polyline class="chart-state" points="${polyline(stateSeries)}" fill="none" stroke="#67d391" stroke-width="1.7"/>` +
      `<polyline class="chart-action" points="${polyline(actionSeries)}" fill="none" stroke="#55a6ff" stroke-width="1.5" stroke-dasharray="4 3"/>` +
      `<line x1="${markerX}" x2="${markerX}" y1="${pad}" y2="${height - pad}" stroke="#67d391" stroke-width="1"/>` +
      `<text x="${pad}" y="${height - 2}" fill="#8793a8" font-size="9">${min.toPrecision(4)} — ${max.toPrecision(4)}</text>`;
  }

  function clear(): void {
    stateSelect.innerHTML = "";
    actionSelect.innerHTML = "";
    componentSelect.innerHTML = "";
    componentSelect.hidden = true;
    countEl.textContent = "—";
    chartEl.innerHTML = "";
    rawEl.textContent = "选择一个字段查看数据";
  }

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
