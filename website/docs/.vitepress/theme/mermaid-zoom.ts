// Click-to-zoom for Mermaid diagrams. Mermaid renders client-side after mount, so decorate
// diagrams as they appear and open a full-window viewer with zoom controls on click.

const STEP = 1.25;

function naturalWidth(svg: SVGSVGElement): number {
  const box = svg.viewBox?.baseVal;
  if (box && box.width > 0) return box.width;
  return svg.getBoundingClientRect().width || 800;
}

function openViewer(source: SVGSVGElement) {
  const svg = source.cloneNode(true) as SVGSVGElement;
  svg.removeAttribute("style");
  svg.removeAttribute("height");
  const base = naturalWidth(svg);
  let scale = 1;

  const overlay = document.createElement("div");
  overlay.className = "mermaid-lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "图表查看器");

  const bar = document.createElement("div");
  bar.className = "mermaid-lightbox-bar";
  const label = document.createElement("span");
  label.className = "scale";
  const body = document.createElement("div");
  body.className = "mermaid-lightbox-body";

  const apply = () => {
    scale = Math.min(Math.max(scale, 0.25), 6);
    svg.setAttribute("width", String(Math.round(base * scale)));
    label.textContent = `${Math.round(scale * 100)}%`;
  };
  const button = (text: string, title: string, action: () => void) => {
    const el = document.createElement("button");
    el.type = "button";
    el.textContent = text;
    el.title = title;
    el.addEventListener("click", action);
    return el;
  };
  const fit = () => {
    scale = (body.clientWidth - 32) / base;
    apply();
  };
  const close = () => {
    document.removeEventListener("keydown", onKey);
    document.body.style.overflow = "";
    overlay.remove();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") close();
    else if (event.key === "+" || event.key === "=") { scale *= STEP; apply(); }
    else if (event.key === "-") { scale /= STEP; apply(); }
    else if (event.key === "0") { scale = 1; apply(); }
  };

  const spacer = document.createElement("span");
  spacer.className = "spacer";
  bar.append(
    button("−", "缩小（-）", () => { scale /= STEP; apply(); }),
    label,
    button("+", "放大（+）", () => { scale *= STEP; apply(); }),
    button("100%", "原始大小（0）", () => { scale = 1; apply(); }),
    button("适应宽度", "适应窗口宽度", fit),
    spacer,
    button("关闭 ✕", "关闭（Esc）", close),
  );
  body.append(svg);
  overlay.append(bar, body);
  document.body.append(overlay);
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", onKey);
  apply();
  // Start at natural size, but never wider than the window.
  if (base > body.clientWidth - 32) fit();
}

function decorate(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(".vp-doc .mermaid").forEach((el) => {
    // Mermaid re-renders on theme change and drops our hint, so key off the hint itself.
    if (el.querySelector(".mermaid-zoom-hint") || !el.querySelector("svg")) return;
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "放大图表");
    const hint = document.createElement("span");
    hint.className = "mermaid-zoom-hint";
    hint.textContent = "点击放大";
    el.prepend(hint);
  });
}

export function setupMermaidZoom() {
  if (typeof document === "undefined") return;
  new MutationObserver(() => decorate(document)).observe(document.body, {
    childList: true,
    subtree: true,
  });
  decorate(document);
  const open = (target: EventTarget | null) => {
    const el = (target as HTMLElement | null)?.closest<HTMLElement>(".vp-doc .mermaid");
    const svg = el?.querySelector("svg");
    if (el && svg) openViewer(svg as SVGSVGElement);
  };
  document.addEventListener("click", (event) => open(event.target));
  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && document.activeElement?.matches?.(".vp-doc .mermaid")) {
      event.preventDefault();
      open(document.activeElement);
    }
  });
}
