/**
 * PropertyPanel.tsx — 选中节点的实例名和端口编辑器
 *
 * @author pony
 * @date 2026-06-30
 * @version v1.1.0
 * @last_modified 2026-07-13
 * @changelog
 *   - v1.1.0 (2026-07-13): 接入窄屏纵向工作区布局
 *
 * 选中某个节点后，展示并允许编辑：
 * - 实例名(name 属性)
 * - 每个端口的值：可填字面量，也可用 "{黑板key}" 做端口重映射
 *
 * 端口列表来自该节点的 manifest（拖入时已写入 data.portManifests）。
 * 编辑通过回调 onChange 把更新后的 portValues / instanceName 提交给上层。
 */

import type { BtNode, PortManifest } from '../types';

interface Props {
  node: BtNode | null;
  onChangeInstanceName: (id: string, name: string) => void;
  onChangePortValue: (id: string, port: string, value: string) => void;
  onDelete: (id: string) => void;
}

/** 根据 PortManifest.type_name 推断该端口适合的输入控件类型。 */
type Widget = 'enum' | 'bool' | 'int' | 'float' | 'text';
export function inferWidget(port: PortManifest): Widget {
  if (port.enum_values && port.enum_values.length > 0) return 'enum';
  const t = port.type_name;
  if (t === 'bool') return 'bool';
  // 整数族:int / long / short / unsigned ... 都匹配 "int"/"long"/"short" 子串
  if (/\b(int|long|short)\b/.test(t)) return 'int';
  // 浮点族
  if (/\b(double|float)\b/.test(t)) return 'float';
  return 'text';  // string 或未识别类型 → 自由文本
}

/** 单个端口编辑行 */
function PortRow({
  port,
  value,
  onChange,
}: {
  port: PortManifest;
  value: string;
  onChange: (v: string) => void;
}) {
  // 是否处于黑板重映射模式（值形如 "{key}"）
  const isRemap = /^\{.*\}$/.test(value);
  const widget = inferWidget(port);

  // 重映射切换:任何类型化控件旁都给一个 🔗 按钮,一键切换 free-text {key} 模式
  const toggleRemap = () => onChange(isRemap ? (port.default_value || '') : '{key}');

  // 共享的标签 + 描述 + 状态标记
  const header = (
    <>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>
        {port.name}
        <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: 4 }}>
          ({port.direction})
        </span>
        {isRemap && (
          <span style={{ color: '#a855f7', marginLeft: 4 }}>· 黑板重映射</span>
        )}
        {widget === 'enum' && !isRemap && (
          <span style={{ color: '#0ea5e9', marginLeft: 4 }}>· 枚举</span>
        )}
        {widget === 'bool' && !isRemap && (
          <span style={{ color: '#16a34a', marginLeft: 4 }}>· 布尔</span>
        )}
        {(widget === 'int' || widget === 'float') && !isRemap && (
          <span style={{ color: '#f59e0b', marginLeft: 4 }}>
            · {widget === 'int' ? '整数' : '数字'}
          </span>
        )}
      </label>
      {port.description && (
        <div style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0' }}>
          {port.description}
        </div>
      )}
    </>
  );

  // 重映射模式:统一回退到 free-text 输入(紫色边框),所有类型都通过这个口子改 {key}
  if (isRemap) {
    return (
      <div style={{ marginBottom: 10 }}>
        {header}
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={value}
            placeholder="{blackboard_key}"
            onChange={(e) => onChange(e.target.value)}
            style={{
              flex: 1,
              padding: '4px 6px',
              border: '1px solid #a855f7',
              borderRadius: 4,
              fontSize: 13,
            }}
          />
          <button
            type="button"
            onClick={toggleRemap}
            title="退出重映射,改回字面量"
            style={{
              padding: '4px 8px', border: '1px solid #d1d5db',
              borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 12,
            }}
          >× 字面量</button>
        </div>
      </div>
    );
  }

  // 重映射切换按钮(枚举除外:枚举的下拉里已有专门入口)
  const remapBtn = widget === 'enum' ? null : (
    <button
      type="button"
      onClick={toggleRemap}
      title="改用黑板键引用 {key}"
      style={{
        padding: '4px 8px', border: '1px solid #d1d5db',
        borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 12,
        color: '#a855f7',
      }}
    >{'{ }'}</button>
  );

  // ─── 枚举:下拉框(已有逻辑,保留) ───────────────────────────────────
  if (widget === 'enum') {
    return (
      <div style={{ marginBottom: 10 }}>
        {header}
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === '__remap__') onChange('{key}');
            else onChange(e.target.value);
          }}
          style={{
            width: '100%', padding: '4px 6px', border: '1px solid #d1d5db',
            borderRadius: 4, fontSize: 13, background: 'white',
          }}
        >
          {port.enum_values!.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
          <option value="__remap__">{'{ 黑板重映射 }'}</option>
        </select>
      </div>
    );
  }

  // ─── 布尔:复选框 ──────────────────────────────────────────────────
  if (widget === 'bool') {
    const checked = value === 'true' || value === '1';
    return (
      <div style={{ marginBottom: 10 }}>
        {header}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            />
            <span style={{ color: checked ? '#16a34a' : '#9ca3af' }}>
              {checked ? 'true' : 'false'}
            </span>
          </label>
          <span style={{ flex: 1 }} />
          {remapBtn}
        </div>
      </div>
    );
  }

  // ─── 数字:number input,整数 step=1,浮点 step=any ─────────────────
  if (widget === 'int' || widget === 'float') {
    return (
      <div style={{ marginBottom: 10 }}>
        {header}
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="number"
            step={widget === 'int' ? '1' : 'any'}
            value={value}
            placeholder={port.default_value ? `默认: ${port.default_value}` : ''}
            onChange={(e) => onChange(e.target.value)}
            style={{
              flex: 1, padding: '4px 6px', border: '1px solid #d1d5db',
              borderRadius: 4, fontSize: 13,
            }}
          />
          {remapBtn}
        </div>
      </div>
    );
  }

  // ─── 默认:自由文本(string 或未识别类型) ──────────────────────────
  return (
    <div style={{ marginBottom: 10 }}>
      {header}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          value={value}
          placeholder={
            port.default_value ? `默认: ${port.default_value}` : '字面量或 {黑板key}'
          }
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1, padding: '4px 6px', border: '1px solid #d1d5db',
            borderRadius: 4, fontSize: 13,
          }}
        />
        {remapBtn}
      </div>
    </div>
  );
}

export function PropertyPanel({
  node,
  onChangeInstanceName,
  onChangePortValue,
  onDelete,
}: Props) {
  return (
    <aside
      className="bt-property-panel"
      style={{
        borderLeft: '1px solid #e5e7eb',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>
        <strong>属性面板</strong>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: 12 }}>
        {!node && (
          <div style={{ color: '#9ca3af', fontSize: 13 }}>
            在画布上选中一个节点以编辑其属性。
          </div>
        )}

        {node && (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>注册名</div>
              <div style={{ fontWeight: 700 }}>{node.data.registrationName}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                类型：{node.data.kind}
              </div>
            </div>

            {/* 实例名编辑 */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>
                实例名 (name)
              </label>
              <input
                type="text"
                value={node.data.instanceName}
                placeholder="可选，XML name 属性"
                onChange={(e) =>
                  onChangeInstanceName(node.id, e.target.value)
                }
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '4px 6px',
                  border: '1px solid #d1d5db',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              />
            </div>

            {/* 端口编辑 */}
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              端口
            </div>
            {node.data.portManifests.length === 0 && (
              <div style={{ fontSize: 12, color: '#9ca3af' }}>该节点无端口。</div>
            )}
            {node.data.portManifests.map((port) => (
              <PortRow
                key={port.name}
                port={port}
                value={node.data.portValues[port.name] ?? ''}
                onChange={(v) => onChangePortValue(node.id, port.name, v)}
              />
            ))}

            {/* 当前运行态 */}
            <div style={{ marginTop: 14, fontSize: 12, color: '#6b7280' }}>
              运行态：<strong>{node.data.runStatus}</strong>
            </div>

            <button
              onClick={() => onDelete(node.id)}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '6px 8px',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              删除该节点
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
