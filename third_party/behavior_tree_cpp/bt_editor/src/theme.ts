/**
 * 共享视觉常量
 *
 * 把"节点大类配色""运行态配色/文案"集中到一处，避免在 BtNodeView / NodePalette /
 * Legend 等组件里各写一份导致漂移。所有需要展示颜色或运行态文案的组件都从这里取。
 */

import type { NodeKind, RunStatus } from './types';

/** 各节点大类的主题色（左边框 + 顶部标签底色 + 面板分组色） */
export const KIND_COLORS: Record<NodeKind, string> = {
  Control: '#3b82f6', // 蓝
  Decorator: '#a855f7', // 紫
  Action: '#10b981', // 绿
  Condition: '#f59e0b', // 橙
};

/** 运行态对应的节点背景色（IDLE 灰 / RUNNING 黄 / SUCCESS 绿 / FAILURE 红） */
export const STATUS_BG: Record<RunStatus, string> = {
  IDLE: '#f3f4f6',
  RUNNING: '#fde68a',
  SUCCESS: '#bbf7d0',
  FAILURE: '#fecaca',
};

/** 运行态的中文说明，用于图例(Legend)展示 */
export const STATUS_LABELS: Record<RunStatus, string> = {
  IDLE: '未执行',
  RUNNING: '运行中',
  SUCCESS: '成功',
  FAILURE: '失败',
};

/** 图例固定展示顺序 */
export const STATUS_ORDER: RunStatus[] = ['IDLE', 'RUNNING', 'SUCCESS', 'FAILURE'];
