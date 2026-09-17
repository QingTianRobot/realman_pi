/**
 * 轻量级 Toast 通知
 *
 * 用于把操作结果（成功 / 失败 / 提示）以浮层形式短暂展示在右下角，
 * 避免错误被静默吞掉或只在控制台打印。支持多条堆叠、点击关闭、自动消失。
 *
 * 设计为纯受控组件：toast 列表由上层 App 持有，本组件只负责渲染与触发关闭回调。
 */

/** 单条 toast 的类型 */
export type ToastKind = 'info' | 'success' | 'error';

/** 单条 toast 数据 */
export interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

/** 各类型的配色（背景 / 边框 / 文字 / 图标） */
const KIND_STYLE: Record<
  ToastKind,
  { bg: string; border: string; color: string; icon: string }
> = {
  info: { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8', icon: 'ℹ' },
  success: { bg: '#f0fdf4', border: '#86efac', color: '#15803d', icon: '✓' },
  error: { bg: '#fef2f2', border: '#fca5a5', color: '#b91c1c', icon: '✕' },
};

export function ToastStack({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1000,
        maxWidth: 360,
      }}
    >
      {toasts.map((t) => {
        const s = KIND_STYLE[t.kind];
        return (
          <div
            key={t.id}
            role="alert"
            onClick={() => onDismiss(t.id)}
            title="点击关闭"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '10px 12px',
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 8,
              color: s.color,
              fontSize: 13,
              lineHeight: 1.4,
              boxShadow: '0 4px 12px #0002',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontWeight: 700 }}>{s.icon}</span>
            <span style={{ flex: 1, wordBreak: 'break-word' }}>{t.text}</span>
          </div>
        );
      })}
    </div>
  );
}
