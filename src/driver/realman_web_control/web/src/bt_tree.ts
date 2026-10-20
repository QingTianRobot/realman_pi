// Read-only behavior-tree view fed by /api/bt/runtime (the executor's per-tick snapshot).

export type BtStatus = "IDLE" | "RUNNING" | "SUCCESS" | "FAILURE" | "SKIPPED";
export type BtRuntimeNode = {
  path: string;
  name: string;
  registration_name: string;
  kind: string;
  status: BtStatus;
  failure_reason: string;
};
export type BtRuntime =
  | { available: false }
  | {
    available: true;
    tree_id: string;
    sequence: number;
    timestamp_ms: number;
    root_status: BtStatus;
    failure_reason: string;
    nodes: BtRuntimeNode[];
  };
export type BtTreeNode = BtRuntimeNode & { children: BtTreeNode[] };

export function buildBtTree(nodes: BtRuntimeNode[]): BtTreeNode | undefined {
  const byPath = new Map<string, BtTreeNode>();
  let root: BtTreeNode | undefined;
  for (const node of nodes) {
    const entry = { ...node, children: [] };
    byPath.set(node.path, entry);
    const slash = node.path.lastIndexOf("/");
    if (slash < 0) root ??= entry;
    else byPath.get(node.path.slice(0, slash))?.children.push(entry);
  }
  return root;
}

// The control tree routes inputs through a fallback whose every child is guarded by
// an InputModeGuard; only the branch for the active mode matters to an operator.
export function findInputRouter(root: BtTreeNode): BtTreeNode | undefined {
  const stack = [root];
  while (stack.length) {
    const node = stack.pop()!;
    if (node.kind === "Control" && /Fallback$/.test(node.registration_name) && node.children.length > 1 &&
        node.children.every((child) => child.children[0]?.registration_name === "InputModeGuard")) {
      return node;
    }
    stack.push(...node.children);
  }
  return undefined;
}

export function activeRouterBranch(router: BtTreeNode, activeMode?: string): BtTreeNode | undefined {
  return router.children.find((child) => activeMode && child.name === `${activeMode}_branch`)
    ?? router.children.find((child) => child.children[0]?.status === "SUCCESS" && child.status !== "IDLE")
    ?? router.children.find((child) => child.status === "RUNNING");
}

export function ancestors(root: BtTreeNode, path: string): BtTreeNode[] {
  const chain: BtTreeNode[] = [];
  let node: BtTreeNode | undefined = root;
  while (node && node.path !== path) {
    chain.push(node);
    node = node.children.find((child) => path === child.path || path.startsWith(`${child.path}/`));
  }
  return chain;
}

const KIND_ICONS: Record<string, string> = { Control: "◆", Decorator: "◇", Action: "▶", Condition: "?", SubTree: "▣" };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}

export function statusPill(status: string) {
  return `<span class="bt-status bt-${status.toLowerCase()}">${escapeHtml(status)}</span>`;
}

function nodeLabel(node: BtRuntimeNode) {
  const named = node.name && node.name !== node.registration_name;
  return `<span class="bt-name">${escapeHtml(named ? node.name : node.registration_name)}</span>${named ? `<span class="bt-type">${escapeHtml(node.registration_name)}</span>` : ""}`;
}

/**
 * Render `node` and its descendants. A node with children starts collapsed while IDLE
 * (nothing to see) or `muted` (an input branch the router is not using, whose guard
 * FAILURE is normal routing, not an error); `toggled` remembers the operator's choice.
 */
export function renderBtNode(node: BtTreeNode, toggled: Map<string, boolean>, muted: ReadonlySet<string> = new Set()): string {
  const hasChildren = node.children.length > 0;
  const isMuted = muted.has(node.path);
  const collapsed = hasChildren && (toggled.get(node.path) ?? (node.status === "IDLE" || isMuted));
  return `<li class="bt-node bt-kind-${node.kind.toLowerCase()}${isMuted ? " bt-muted" : ""}" data-path="${escapeHtml(node.path)}" data-status="${node.status}">
    <div class="bt-row">${hasChildren
      ? `<button type="button" class="bt-caret" data-bt-toggle="${escapeHtml(node.path)}" aria-expanded="${!collapsed}" aria-label="${collapsed ? "展开" : "折叠"}">${collapsed ? "▸" : "▾"}</button>`
      : `<span class="bt-caret-spacer"></span>`}<span class="bt-icon" title="${escapeHtml(node.kind)}">${KIND_ICONS[node.kind] ?? "•"}</span>${nodeLabel(node)}${statusPill(node.status)}</div>
    ${node.failure_reason ? `<div class="bt-reason">${escapeHtml(node.failure_reason)}</div>` : ""}
    ${hasChildren && !collapsed ? `<ul class="bt-children">${node.children.map((child) => renderBtNode(child, toggled, muted)).join("")}</ul>` : ""}
  </li>`;
}

export function renderBreadcrumb(chain: BtTreeNode[]) {
  return chain.map((node) => `<span class="bt-crumb">${nodeLabel(node)}${statusPill(node.status)}</span>`).join(`<span class="bt-crumb-sep">›</span>`);
}
