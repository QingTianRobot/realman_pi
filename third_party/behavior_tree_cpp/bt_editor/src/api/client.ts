/**
 * API 客户端
 *
 * 封装与 bt_server 的所有 HTTP 交互。开发期由 Vite proxy 把 /api 代理到
 * http://localhost:8080，因此这里统一使用相对路径 /api/xxx。
 */

import type {
  NodeManifest,
  LoadResult,
  ExportResult,
  TickResult,
  RunResult,
  ValidateResult,
  FormatResult,
  HealthResult,
} from '../types';

/** 统一的 JSON 请求封装：检查 HTTP 状态码并解析 JSON */
async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!resp.ok) {
    // 非 2xx 直接抛错，交由调用方捕获并提示
    throw new Error(`HTTP ${resp.status} ${resp.statusText} @ ${url}`);
  }
  return (await resp.json()) as T;
}

/** GET /api/nodes —— 拉取所有已注册节点的 manifest */
export async function fetchNodes(): Promise<NodeManifest[]> {
  return requestJson<NodeManifest[]>('/api/nodes');
}

/** POST /api/tree/load —— 把 XML 发给后端构建树 */
export async function loadTree(xml: string): Promise<LoadResult> {
  return requestJson<LoadResult>('/api/tree/load', {
    method: 'POST',
    body: JSON.stringify({ xml }),
  });
}

/** POST /api/tree/validate —— 只校验 XML，不替换后端当前树 */
export async function validateTree(xml: string): Promise<ValidateResult> {
  return requestJson<ValidateResult>('/api/tree/validate', {
    method: 'POST',
    body: JSON.stringify({ xml }),
  });
}

/** POST /api/tree/format —— 只格式化 XML，不替换后端当前树 */
export async function formatTree(xml: string): Promise<FormatResult> {
  return requestJson<FormatResult>('/api/tree/format', {
    method: 'POST',
    body: JSON.stringify({ xml }),
  });
}

/** GET /api/tree/export —— 从后端取当前树的 XML */
export async function exportTree(): Promise<ExportResult> {
  return requestJson<ExportResult>('/api/tree/export');
}

/** POST /api/tree/tick —— 执行一拍并取回每个节点的运行态 */
export async function tickTree(): Promise<TickResult> {
  return requestJson<TickResult>('/api/tree/tick', { method: 'POST' });
}

/** POST /api/tree/run —— 跑到终态并返回状态变化序列 */
export async function runTree(): Promise<RunResult> {
  return requestJson<RunResult>('/api/tree/run', { method: 'POST' });
}

/** GET /api/health —— 健康检查，返回后端版本 */
export async function checkHealth(): Promise<HealthResult> {
  return requestJson<HealthResult>('/api/health');
}
