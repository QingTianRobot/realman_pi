/**
 * 自定义节点组件 BtNodeView
 *
 * React Flow 用它渲染画布上每一个行为树节点。职责：
 * - 根据节点大类（Control/Decorator/Action/Condition）显示分类标签与配色
 * - 根据运行态 runStatus 给节点描边/背景上色
 * - 按照父子连线约束渲染连接桩(Handle)：
 *     · 非根节点都有顶部目标桩（作为子节点被连入）
 *     · 叶子节点(Action/Condition)无底部源桩（不能有子节点）
 *     · 装饰/控制节点有底部源桩（可连出子节点；装饰单子约束在连线校验里做）
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { BtNodeData } from '../types';
import { isLeafKind } from '../types';
import { KIND_COLORS, STATUS_BG } from '../theme';

function BtNodeViewImpl({ id, data, selected }: NodeProps<BtNodeData>) {
  const accent = KIND_COLORS[data.kind];
  const leaf = isLeafKind(data.kind);

  return (
    <div
      data-testid="bt-node"
      data-node-id={id}
      data-registration={data.registrationName}
      data-status={data.runStatus}
      style={{
        minWidth: 150,
        borderRadius: 8,
        border: `2px solid ${selected ? '#111827' : accent}`,
        background: STATUS_BG[data.runStatus],
        boxShadow: selected ? '0 0 0 2px #11182733' : '0 1px 3px #0002',
        fontSize: 12,
        overflow: 'hidden',
      }}
    >
      {/* 顶部目标桩：作为子节点被父节点连入 */}
      <Handle type="target" position={Position.Top} style={{ background: accent }} />

      {/* 分类标签条 */}
      <div
        style={{
          background: accent,
          color: '#fff',
          padding: '2px 8px',
          fontWeight: 600,
          letterSpacing: 0.3,
        }}
      >
        {data.kind}
      </div>

      {/* 主体：注册名 + 实例名 */}
      <div style={{ padding: '6px 8px' }}>
        <div style={{ fontWeight: 600, color: '#111827' }}>
          {data.registrationName}
        </div>
        {data.instanceName && (
          <div style={{ color: '#6b7280', marginTop: 2 }}>
            “{data.instanceName}”
          </div>
        )}
      </div>

      {/* 底部源桩：仅非叶子节点可连出子节点 */}
      {!leaf && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: accent }}
        />
      )}
    </div>
  );
}

// memo 化避免无关重渲染
export const BtNodeView = memo(BtNodeViewImpl);
