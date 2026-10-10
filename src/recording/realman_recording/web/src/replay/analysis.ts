// Dataset-level analysis sidebar, following LeRobot Studio's "Analysis" tab:
// overview (episode/frame/fps/format), duration distribution, task distribution.
// Computed from the `/api/lerobot` episode list the sidebar already fetches, so
// there is no extra backend round-trip.

import type { EpisodeMeta } from "./sidebar";

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

function formatDuration(seconds: number): string {
  if (seconds >= 60) return `${(seconds / 60).toFixed(1)} 分`;
  return `${seconds.toFixed(1)} 秒`;
}

function row(label: string, value: string): string {
  return `<div class="analysis-row"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`;
}

export function renderAnalysis(episodes: EpisodeMeta[]): void {
  const overviewEl = $("#analysis-overview");
  const durationEl = $("#analysis-duration");
  const tasksEl = $("#analysis-tasks");
  if (!overviewEl || !durationEl || !tasksEl) return;

  if (!episodes.length) {
    overviewEl.innerHTML = '<div class="empty">暂无数据</div>';
    durationEl.innerHTML = '<div class="empty">暂无数据</div>';
    tasksEl.innerHTML = '<div class="empty">暂无数据</div>';
    return;
  }

  const count = episodes.length;
  const totalFrames = episodes.reduce((sum, episode) => sum + (episode.frames || 0), 0);
  const fps = episodes.find((episode) => (episode.fps ?? 0) > 0)?.fps ?? 0;
  const durations = episodes
    .filter((episode) => (episode.fps ?? 0) > 0)
    .map((episode) => (episode.frames || 0) / (episode.fps || 1));

  overviewEl.innerHTML =
    row("Episode 数", String(count)) +
    row("总帧数", totalFrames.toLocaleString()) +
    row("FPS", fps ? String(fps) : "—") +
    row("格式", "LeRobot v3");

  if (durations.length) {
    const total = durations.reduce((a, b) => a + b, 0);
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const avg = total / durations.length;
    const lengths = episodes.map((episode) => episode.frames || 0);
    const lengthMin = Math.min(...lengths);
    const lengthMax = Math.max(...lengths);
    const lengthAvg = totalFrames / count;
    const avgPosition = lengthMax > lengthMin ? ((lengthAvg - lengthMin) / (lengthMax - lengthMin)) * 100 : 50;
    durationEl.innerHTML =
      row("总时长", formatDuration(total)) +
      row("最短", formatDuration(min)) +
      row("平均", formatDuration(avg)) +
      row("最长", formatDuration(max)) +
      `<div class="analysis-length"><div class="analysis-length-track"><div class="analysis-length-fill" style="left:${avgPosition.toFixed(1)}%"></div></div>` +
      `<div class="analysis-length-labels"><span>${lengthMin} 帧</span><span>平均 ${lengthAvg.toFixed(0)}</span><span>${lengthMax} 帧</span></div></div>`;
  } else {
    durationEl.innerHTML = '<div class="empty">暂无数据</div>';
  }

  const taskCounts = new Map<string, number>();
  for (const episode of episodes) {
    const task = episode.task || "未标注";
    taskCounts.set(task, (taskCounts.get(task) || 0) + 1);
  }
  tasksEl.innerHTML = [...taskCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([task, n]) => {
      const percentage = ((n / count) * 100).toFixed(1);
      return (
        `<div class="analysis-task"><div class="analysis-task-head"><span>${escapeHtml(task)}</span><b>${n} · ${percentage}%</b></div>` +
        `<div class="analysis-task-bar"><div style="width:${percentage}%"></div></div></div>`
      );
    })
    .join("");
}
