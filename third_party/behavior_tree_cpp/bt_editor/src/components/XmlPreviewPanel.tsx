/**
 * XmlPreviewPanel.tsx — XML 实时预览、复制、校验和格式化入口
 *
 * @author pony
 * @date 2026-06-30
 * @version v1.1.0
 * @last_modified 2026-07-13
 * @changelog
 *   - v1.1.0 (2026-07-13): 预览工具条支持窄屏换行
 */
interface Props {
  xml: string;
  error: string | null;
  busy: boolean;
  connected: boolean;
  lastRunSummary: string | null;
  onCopy: () => void;
  onValidate: () => void;
  onFormat: () => void;
}

export function XmlPreviewPanel({
  xml,
  error,
  busy,
  connected,
  lastRunSummary,
  onCopy,
  onValidate,
  onFormat,
}: Props) {
  const disabled = busy || !connected || Boolean(error);
  return (
    <section
      className="bt-xml-preview"
      style={{
        borderTop: '1px solid #e5e7eb',
        background: '#0f172a',
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="bt-xml-toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 12px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <strong>XML 脚本预览</strong>
        <span style={{ fontSize: 12, color: error ? '#fca5a5' : '#94a3b8' }}>
          {error ?? '按当前画布结构实时生成'}
        </span>
        {lastRunSummary && (
          <span style={{ marginLeft: 8, fontSize: 12, color: '#93c5fd' }}>
            {lastRunSummary}
          </span>
        )}
        <span className="bt-xml-spacer" style={{ flex: 1 }} />
        <button type="button" disabled={Boolean(error)} onClick={onCopy}>
          复制
        </button>
        <button type="button" disabled={disabled} onClick={onValidate}>
          后端校验
        </button>
        <button type="button" disabled={disabled} onClick={onFormat}>
          后端格式化
        </button>
      </div>
      <textarea
        readOnly
        value={error ? '' : xml}
        placeholder={error ?? '暂无 XML'}
        style={{
          flex: 1,
          resize: 'none',
          border: 0,
          outline: 'none',
          padding: 12,
          background: '#111827',
          color: '#d1fae5',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 12,
          lineHeight: 1.45,
        }}
      />
    </section>
  );
}
