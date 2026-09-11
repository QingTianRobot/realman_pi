/**
 * NodePalette.tsx — 可拖拽、可点击的节点清单
 *
 * @author pony
 * @date 2026-06-30
 * @version v1.1.0
 * @last_modified 2026-07-13
 * @changelog
 *   - v1.1.0 (2026-07-13): 增加触控和键盘可用的点击添加入口
 *
 * 启动时由父组件从 GET /api/nodes 拉取的 manifest 渲染。
 * 按节点大类(Control/Decorator/Action/Condition)分组，每个条目可拖拽到画布。
 *
 * 拖拽实现：HTML5 原生 drag。dragstart 时把 manifest 的注册名写入 dataTransfer，
 * 画布在 drop 时读取并据此创建节点（见 Canvas.tsx 的 onDrop）。
 */

import type { NodeManifest, NodeKind } from '../types';
import { KIND_COLORS } from '../theme';

/** 拖拽时使用的自定义 MIME 类型 */
export const DND_MIME = 'application/bt-node';

interface Props {
  manifests: NodeManifest[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
  onAdd: (manifest: NodeManifest) => void;
}

/** 分组顺序固定，保证面板布局稳定 */
const GROUP_ORDER: NodeKind[] = ['Control', 'Decorator', 'Action', 'Condition'];

/** 分组配色复用全局主题色，避免与画布节点配色漂移 */
const GROUP_COLORS = KIND_COLORS;

export function NodePalette({ manifests, loading, error, onReload, onAdd }: Props) {
  // 按大类分组
  const grouped: Record<NodeKind, NodeManifest[]> = {
    Control: [],
    Decorator: [],
    Action: [],
    Condition: [],
  };
  for (const m of manifests) {
    // 防御：未知 type 归入 Action，避免漏渲染
    const k = (GROUP_COLORS[m.type] ? m.type : 'Action') as NodeKind;
    grouped[k].push(m);
  }

  /** 拖拽开始：把注册名放进 dataTransfer */
  function handleDragStart(e: React.DragEvent, regName: string) {
    e.dataTransfer.setData(DND_MIME, regName);
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <aside
      className="bt-node-palette"
      style={{
        borderRight: '1px solid #e5e7eb',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <strong>节点面板</strong>
        <button onClick={onReload} disabled={loading} title="重新拉取 /api/nodes">
          刷新
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: 8 }}>
        {loading && <div style={{ color: '#6b7280' }}>加载节点中…</div>}
        {error && (
          <div style={{ color: '#dc2626', fontSize: 12 }}>
            加载失败：{error}
          </div>
        )}
        {!loading &&
          !error &&
          GROUP_ORDER.map((group) => {
            const items = grouped[group];
            if (items.length === 0) return null;
            return (
              <div key={group} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: GROUP_COLORS[group],
                    margin: '4px 2px',
                  }}
                >
                  {group}（{items.length}）
                </div>
                {items.map((m) => (
                  <button
                    key={m.registration_name}
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, m.registration_name)}
                    onClick={() => onAdd(m)}
                    aria-label={`添加 ${m.registration_name} 节点`}
                    title={m.ports
                      .map((p) => `${p.name}(${p.direction}): ${p.description}`)
                      .concat('点击添加；桌面端也可拖到画布')
                      .join('\n')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 8px',
                      marginBottom: 4,
                      background: '#fff',
                      border: `1px solid ${GROUP_COLORS[group]}55`,
                      borderLeft: `4px solid ${GROUP_COLORS[group]}`,
                      borderRadius: 6,
                      cursor: 'grab',
                      fontSize: 13,
                      color: 'inherit',
                      fontFamily: 'inherit',
                      touchAction: 'manipulation',
                    }}
                  >
                    {m.registration_name}
                    {m.ports.length > 0 && (
                      <span style={{ color: '#9ca3af', marginLeft: 4 }}>
                        · {m.ports.length} 端口
                      </span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
      </div>
    </aside>
  );
}
