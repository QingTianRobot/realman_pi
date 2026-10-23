import { svg } from "./dom";

const W = 600;
const H = 180;
const PAD = { left: 52, right: 10, top: 18, bottom: 22 };

function short(n: number): string {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return Math.abs(n) >= 1 ? n.toFixed(2) : n.toPrecision(2);
}

export function lineChart(xs: (number | null)[], ys: (number | null)[], opts: { label: string; id?: string }): SVGSVGElement {
  const chart = svg("svg", { class: "chart", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": opts.label, id: opts.id });
  const points = xs.map((x, i) => [x, ys[i]] as const)
    .filter((p): p is readonly [number, number] => p[0] !== null && p[1] !== null && Number.isFinite(p[1]));
  chart.append(svg("text", { x: PAD.left, y: 12 }, opts.label));
  if (!points.length) {
    chart.append(svg("text", { x: W / 2, y: H / 2, "text-anchor": "middle" }, "暂无数据"));
    return chart;
  }
  const x0 = points[0][0];
  const x1 = points[points.length - 1][0] === x0 ? x0 + 1 : points[points.length - 1][0];
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const [, y] of points) {
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  if (y0 === y1) {
    y0 -= 1e-6;
    y1 += 1e-6;
  }
  const sx = (x: number) => PAD.left + ((x - x0) / (x1 - x0)) * (W - PAD.left - PAD.right);
  const sy = (y: number) => PAD.top + (1 - (y - y0) / (y1 - y0)) * (H - PAD.top - PAD.bottom);
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join("");
  chart.append(
    svg("line", { class: "axis", x1: PAD.left, y1: H - PAD.bottom, x2: W - PAD.right, y2: H - PAD.bottom }),
    svg("line", { class: "axis", x1: PAD.left, y1: PAD.top, x2: PAD.left, y2: H - PAD.bottom }),
    svg("text", { x: PAD.left - 6, y: PAD.top + 4, "text-anchor": "end" }, short(y1)),
    svg("text", { x: PAD.left - 6, y: H - PAD.bottom, "text-anchor": "end" }, short(y0)),
    svg("text", { x: PAD.left, y: H - 6 }, short(x0)),
    svg("text", { x: W - PAD.right, y: H - 6, "text-anchor": "end" }, short(x1)),
    svg("path", { class: "line", d }),
  );
  return chart;
}

export function sparkline(trace: number[] | undefined): SVGSVGElement {
  const chart = svg("svg", { class: "spark", viewBox: "0 0 120 26", "aria-hidden": "true" });
  chart.append(svg("line", { x1: 0, y1: 13, x2: 120, y2: 13 }));
  if (trace && trace.length > 1) {
    const step = 120 / (trace.length - 1);
    const points = trace.map((v, i) => `${(i * step).toFixed(1)},${(24 - v * 22).toFixed(1)}`).join(" ");
    chart.append(svg("polyline", { points }));
  }
  return chart;
}

/** Stacked bars of a histogram: one series per key, bins given by their edges (n + 1 for n bins). */
export function histogram(edges: number[], counts: Record<string, number[]>, opts: { label: string; unit: string; id?: string }): SVGSVGElement {
  const chart = svg("svg", { class: "chart hist", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": opts.label, id: opts.id });
  chart.append(svg("text", { x: PAD.left, y: 12 }, opts.label));
  const series = Object.keys(counts);
  const bins = Math.max(0, edges.length - 1);
  if (!bins || !series.length) {
    chart.append(svg("text", { x: W / 2, y: H / 2, "text-anchor": "middle" }, "暂无数据"));
    return chart;
  }
  const totals = Array.from({ length: bins }, (_, i) => series.reduce((sum, key) => sum + (counts[key][i] ?? 0), 0));
  const top = Math.max(1, ...totals);
  const width = (W - PAD.left - PAD.right) / bins;
  const sy = (n: number) => (n / top) * (H - PAD.top - PAD.bottom);
  for (let i = 0; i < bins; i++) {
    let base = H - PAD.bottom;
    series.forEach((key, s) => {
      const n = counts[key][i] ?? 0;
      if (!n) return;
      const height = sy(n);
      base -= height;
      chart.append(svg("rect", { class: `s${s % 4}`, x: (PAD.left + i * width + 1).toFixed(1), y: base.toFixed(1),
        width: Math.max(1, width - 2).toFixed(1), height: height.toFixed(1) },
      svg("title", {}, `${edges[i]}–${edges[i + 1]} ${opts.unit} · ${key}：${n} 条`)));
    });
    if (totals[i]) chart.append(svg("text", { x: (PAD.left + (i + 0.5) * width).toFixed(1), y: (H - PAD.bottom - sy(totals[i]) - 3).toFixed(1),
      "text-anchor": "middle" }, String(totals[i])));
  }
  const step = Math.ceil(bins / 8);
  chart.append(svg("line", { class: "axis", x1: PAD.left, y1: H - PAD.bottom, x2: W - PAD.right, y2: H - PAD.bottom }));
  edges.forEach((edge, i) => {
    if (i % step === 0 || i === bins) chart.append(svg("text", { x: (PAD.left + i * width).toFixed(1), y: H - 6, "text-anchor": "middle" }, `${edge}`));
  });
  chart.append(svg("text", { x: PAD.left - 6, y: H - PAD.bottom, "text-anchor": "end" }, opts.unit));
  return chart;
}

/** One row per dimension on a shared scale: the q01–q99 band, mean ± std as a thicker bar, the mean as a tick. */
export function rangeRows(labels: string[], stats: { mean: number[]; std: number[]; q01: number[]; q99: number[] }, opts: { label: string; id?: string }): SVGSVGElement {
  const row = 22;
  const left = 46;
  const right = 10;
  const height = 26 + labels.length * row + 16;
  const chart = svg("svg", { class: "ranges", viewBox: `0 0 ${W} ${height}`, role: "img", "aria-label": opts.label, id: opts.id });
  const lo = Math.min(...stats.q01, ...stats.mean.map((m, i) => m - stats.std[i]));
  const hi = Math.max(...stats.q99, ...stats.mean.map((m, i) => m + stats.std[i]));
  const span = hi - lo || 1;
  const sx = (v: number) => left + ((v - lo) / span) * (W - left - right);
  chart.append(svg("text", { x: left, y: 12 }, opts.label));
  if (lo < 0 && hi > 0) chart.append(svg("line", { class: "zero", x1: sx(0), y1: 18, x2: sx(0), y2: height - 16 }));
  labels.forEach((name, i) => {
    const y = 26 + i * row + row / 2;
    const m = stats.mean[i];
    const s = stats.std[i];
    chart.append(
      svg("text", { x: left - 8, y: y + 4, "text-anchor": "end" }, name),
      svg("line", { class: "band", x1: sx(stats.q01[i]), y1: y, x2: sx(stats.q99[i]), y2: y }),
      svg("rect", { class: "std", x: sx(m - s).toFixed(1), y: y - 4, width: Math.max(1, sx(m + s) - sx(m - s)).toFixed(1), height: 8, rx: 2 }),
      svg("line", { class: "mean", x1: sx(m), y1: y - 7, x2: sx(m), y2: y + 7 },
        svg("title", {}, `${name}：mean ${m.toFixed(3)} · std ${s.toFixed(3)} · q01 ${stats.q01[i].toFixed(3)} · q99 ${stats.q99[i].toFixed(3)}`)));
  });
  chart.append(svg("text", { x: left, y: height - 2 }, short(lo)), svg("text", { x: W - right, y: height - 2, "text-anchor": "end" }, short(hi)));
  return chart;
}
