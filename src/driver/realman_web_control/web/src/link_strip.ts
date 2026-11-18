// Topbar link strip: one chip per component kind (arms, cameras, grippers) with one dot per device,
// tinted ok / warn / down. Hovering (or focusing, or tapping) a dot opens a card with that device's
// link details: USB generation and port, frame rate, serial port, controller address. Polls
// GET /api/links every 2 s while the page is visible; the hovered card follows each refresh.

type LinkItem = {
  id: string;
  short: string;
  label: string;
  tone: "ok" | "warn" | "down";
  reason: string;
  badge: string;
  details: [string, string][];
};
type LinkGroup = { kind: string; title: string; items: LinkItem[] };
type LinkSnapshot = { groups: LinkGroup[]; error?: string };

const POLL_MS = 2000;
const TONE_TEXT = { ok: "正常", warn: "注意", down: "断开" } as const;
const ICONS: Record<string, string> = {
  arms: '<path d="M5 20h8"/><path d="M9 20v-5l6-6"/><circle cx="9" cy="15" r="2"/><circle cx="15" cy="9" r="2"/><path d="M15 9l4-4"/><path d="M17 3l4 4"/>',
  cameras: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  grippers: '<path d="M8 3v7l-3 4v7"/><path d="M16 3v7l3 4v7"/><path d="M8 10h8"/>',
};

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function initLinkStrip(root: HTMLElement): void {
  const tip = document.createElement("div");
  tip.className = "link-tip";
  tip.hidden = true;
  tip.setAttribute("role", "tooltip");
  document.body.append(tip);
  let items = new Map<string, LinkItem>();
  let shown: { key: string; anchor: HTMLElement } | null = null;
  let pinned = false;
  let inFlight = false;

  function drawTip(): void {
    const item = shown && items.get(shown.key);
    if (!shown || !item || !shown.anchor.isConnected) { tip.hidden = true; return; }
    tip.dataset.tone = item.tone;
    tip.innerHTML = `<div class="link-tip-head"><strong>${escapeHtml(item.label)}</strong><span class="link-tone ${item.tone}">${TONE_TEXT[item.tone]}</span></div>`
      + (item.reason ? `<p class="link-tip-reason">${escapeHtml(item.reason)}</p>` : "")
      + `<dl>${item.details.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join("")}</dl>`;
    tip.hidden = false;
    const box = shown.anchor.getBoundingClientRect();
    const width = tip.offsetWidth;
    const left = Math.min(Math.max(8, box.left + box.width / 2 - width / 2), window.innerWidth - width - 8);
    tip.style.left = `${left}px`;
    tip.style.top = `${box.bottom + 8}px`;
  }

  function show(anchor: HTMLElement): void {
    shown = { key: anchor.dataset.key!, anchor };
    drawTip();
  }
  function hide(): void {
    if (pinned) return;
    shown = null;
    tip.hidden = true;
  }

  function render(snapshot: LinkSnapshot | null): void {
    const groups = snapshot?.groups ?? [];
    items = new Map();
    if (!groups.length) {
      delete root.dataset.layout;
      root.innerHTML = `<span class="link-group down" title="${escapeHtml(snapshot?.error ? `连接状态读取失败：${snapshot.error}` : "连接状态读取失败")}"><b>连接</b><i class="link-dot down">?</i></span>`;
      shown = null;
      tip.hidden = true;
      return;
    }
    const wasKey = shown?.key;
    const visible = groups.filter((group) => group.items.length);
    const worstOf = (group: LinkGroup) =>
      group.items.some((i) => i.tone === "down") ? "down" : group.items.some((i) => i.tone === "warn") ? "warn" : "ok";
    const dotBody = (item: LinkItem) => `${escapeHtml(item.short)}${item.badge ? `<small>${escapeHtml(item.badge)}</small>` : ""}`;
    const layout = visible.map((group) => `${group.kind}:${group.items.map((item) => item.id).join(",")}`).join("|");
    for (const group of visible) for (const item of group.items) items.set(`${group.kind}/${item.id}`, item);
    if (root.dataset.layout === layout) {
      // Same devices as last poll: update the existing buttons so hover and keyboard focus stay put.
      visible.forEach((group, index) => {
        const chip = root.children[index] as HTMLElement;
        chip.className = `link-group ${worstOf(group)}`;
        for (const item of group.items) {
          const dot = chip.querySelector<HTMLElement>(`[data-key="${CSS.escape(`${group.kind}/${item.id}`)}"]`)!;
          dot.className = `link-dot ${item.tone}`;
          dot.setAttribute("aria-label", `${item.label} ${TONE_TEXT[item.tone]}`);
          const body = dotBody(item);
          if (dot.innerHTML !== body) dot.innerHTML = body;
        }
      });
      drawTip();
      return;
    }
    root.dataset.layout = layout;
    root.innerHTML = visible.map((group) =>
      `<span class="link-group ${worstOf(group)}" aria-label="${escapeHtml(group.title)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[group.kind] ?? ""}</svg>`
      + group.items.map((item) =>
        `<button type="button" class="link-dot ${item.tone}" data-key="${escapeHtml(`${group.kind}/${item.id}`)}" aria-label="${escapeHtml(`${item.label} ${TONE_TEXT[item.tone]}`)}">${dotBody(item)}</button>`,
      ).join("")
      + "</span>",
    ).join("");
    if (wasKey) {
      const anchor = root.querySelector<HTMLElement>(`[data-key="${CSS.escape(wasKey)}"]`);
      if (anchor) show(anchor); else { shown = null; pinned = false; tip.hidden = true; }
    }
  }

  root.addEventListener("pointerover", (event) => {
    const anchor = (event.target as HTMLElement).closest<HTMLElement>(".link-dot[data-key]");
    if (anchor && !pinned) show(anchor);
  });
  root.addEventListener("pointerout", (event) => {
    const to = event.relatedTarget as Node | null;
    if (!to || !root.contains(to)) hide();
  });
  root.addEventListener("focusin", (event) => {
    const anchor = (event.target as HTMLElement).closest<HTMLElement>(".link-dot[data-key]");
    if (anchor) show(anchor);
  });
  root.addEventListener("focusout", () => { pinned = false; hide(); });
  // Touch screens have no hover: a tap pins the card until the next tap elsewhere.
  root.addEventListener("click", (event) => {
    const anchor = (event.target as HTMLElement).closest<HTMLElement>(".link-dot[data-key]");
    if (!anchor) return;
    pinned = !(pinned && shown?.key === anchor.dataset.key);
    show(anchor);
  });
  document.addEventListener("click", (event) => {
    if (pinned && !root.contains(event.target as Node)) { pinned = false; hide(); }
  });
  window.addEventListener("scroll", () => drawTip(), { passive: true });
  window.addEventListener("resize", () => drawTip());

  async function poll(): Promise<void> {
    if (inFlight || document.hidden) return;
    inFlight = true;
    try {
      const response = await fetch("/api/links", { cache: "no-store" });
      render(response.ok ? await response.json() as LinkSnapshot : null);
    } catch {
      render(null);
    } finally {
      inFlight = false;
    }
  }
  void poll();
  window.setInterval(poll, POLL_MS);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) void poll(); });
}
