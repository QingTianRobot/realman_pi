/**
 * Toolbar.tsx — 编辑器全局操作和后端健康状态
 *
 * @author pony
 * @date 2026-06-30
 * @version v1.1.0
 * @last_modified 2026-07-13
 * @changelog
 *   - v1.1.0 (2026-07-13): 工具栏改为可换行的响应式结构
 *
 * 集中放置全局操作按钮：
 * - 载入示例：用内置示例 XML 填充画布（无需后端）
 * - 载入到服务器：把画布转 XML 并 POST /api/tree/load
 * - 从服务器导入：GET /api/tree/export 取 XML 并还原画布
 * - Tick：POST /api/tree/tick 执行一拍并按状态上色
 * - Run：POST /api/tree/run 跑到终态并按最终状态上色
 * - 整理布局：按树层级重新排布当前画布
 * - 重置运行态：把所有节点运行态清回 IDLE
 * - 清空画布
 *
 * 同时显示后端健康状态/版本；后端未连接时给出醒目状态与"重新检测"入口。
 * 操作结果反馈改由全局 Toast 承担，这里不再内嵌消息条。
 */

interface Props {
  /** 后端版本字符串；null = 未连接 */
  health: string | null;
  /** 是否正在检测后端健康 */
  healthChecking: boolean;
  /** 任意后端请求进行中（禁用按钮，防重复点击） */
  busy: boolean;
  onLoadSample: () => void;
  onLoad: () => void;
  onExport: () => void;
  onTick: () => void;
  onRun: () => void;
  onLayout: () => void;
  onResetStatus: () => void;
  onClear: () => void;
  /** 重新检测后端健康 */
  onRecheckHealth: () => void;
}

export function Toolbar({
  health,
  healthChecking,
  busy,
  onLoadSample,
  onLoad,
  onExport,
  onTick,
  onRun,
  onLayout,
  onResetStatus,
  onClear,
  onRecheckHealth,
}: Props) {
  const connected = health !== null;

  const btnStyle: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: busy ? 'not-allowed' : 'pointer',
    fontSize: 13,
  };

  // 依赖后端的按钮：未连接时禁用，避免必然失败的请求
  const backendBtnStyle: React.CSSProperties = {
    ...btnStyle,
    cursor: busy || !connected ? 'not-allowed' : 'pointer',
    opacity: connected ? 1 : 0.5,
  };

  return (
    <header
      className="bt-toolbar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
      }}
    >
      <div
        className="bt-toolbar-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 12px',
        }}
      >
        <strong style={{ marginRight: 8 }}>🌳 BT Editor</strong>

        <button style={btnStyle} disabled={busy} onClick={onLoadSample}>
          载入示例
        </button>

        <span style={{ width: 1, height: 24, background: '#e5e7eb' }} />

        <button
          style={backendBtnStyle}
          disabled={busy || !connected}
          onClick={onLoad}
          title={connected ? '把当前画布发送到后端构建树' : '后端未连接'}
        >
          载入到服务器
        </button>
        <button
          style={backendBtnStyle}
          disabled={busy || !connected}
          onClick={onExport}
          title={connected ? '从后端取回当前树并还原到画布' : '后端未连接'}
        >
          从服务器导入
        </button>
        <button
          style={{
            ...backendBtnStyle,
            background: connected ? '#dbeafe' : '#fff',
            borderColor: connected ? '#93c5fd' : '#d1d5db',
          }}
          disabled={busy || !connected}
          onClick={onTick}
          title={connected ? '执行一拍并按运行态上色' : '后端未连接'}
        >
          ▶ Tick
        </button>
        <button
          style={{
            ...backendBtnStyle,
            background: connected ? '#e0f2fe' : '#fff',
            borderColor: connected ? '#7dd3fc' : '#d1d5db',
          }}
          disabled={busy || !connected}
          onClick={onRun}
          title={connected ? '运行到终态并回放最终节点状态' : '后端未连接'}
        >
          ▶ Run
        </button>

        <span style={{ width: 1, height: 24, background: '#e5e7eb' }} />

        <button style={btnStyle} disabled={busy} onClick={onLayout}>
          整理布局
        </button>
        <button style={btnStyle} disabled={busy} onClick={onResetStatus}>
          重置运行态
        </button>
        <button style={btnStyle} disabled={busy} onClick={onClear}>
          清空
        </button>

        {/* 右侧健康状态 */}
        <span
          className="bt-toolbar-health"
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: '#6b7280',
          }}
        >
          <span>
            后端：
            {connected ? (
              <span style={{ color: '#16a34a' }}>已连接 v{health}</span>
            ) : (
              <span style={{ color: '#dc2626' }}>未连接</span>
            )}
          </span>
          <button
            style={{ ...btnStyle, padding: '2px 8px' }}
            disabled={healthChecking}
            onClick={onRecheckHealth}
            title="重新检测后端 /api/health"
          >
            {healthChecking ? '检测中…' : '重新检测'}
          </button>
        </span>
      </div>

      {/* 后端未连接时的醒目提示条 */}
      {!connected && (
        <div
          role="status"
          style={{
            padding: '6px 12px',
            background: '#fef2f2',
            borderTop: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: 12.5,
          }}
        >
          ⚠ 后端未连接（/api/health 不可达）。可继续在本地编辑画布与载入示例，
          但「载入到服务器 / 从服务器导入 / Tick」需要后端在线。请确认 bt_server
          已在 localhost:8080 运行后点击「重新检测」。
        </div>
      )}
    </header>
  );
}
