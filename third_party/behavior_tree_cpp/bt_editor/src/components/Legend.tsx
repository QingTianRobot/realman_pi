/**
 * 运行态图例 Legend
 *
 * Tick 之后节点会按运行态上色，但颜色含义对新用户不直观。本组件在画布角落
 * 展示一个小图例，把每种运行态颜色与中文含义对应起来，降低理解成本。
 *
 * 作为 React Flow 的 Panel 子元素放在画布右上角；纯展示组件，无内部状态。
 */

import { STATUS_BG, STATUS_LABELS, STATUS_ORDER } from '../theme';

export function Legend() {
  return (
    <div
      style={{
        background: '#ffffffee',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '8px 10px',
        boxShadow: '0 1px 4px #0001',
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#374151' }}>
        运行态图例
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {STATUS_ORDER.map((status) => (
          <div
            key={status}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: STATUS_BG[status],
                border: '1px solid #d1d5db',
                flexShrink: 0,
              }}
            />
            <span style={{ color: '#4b5563' }}>
              {status} · {STATUS_LABELS[status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
