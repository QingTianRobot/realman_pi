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
