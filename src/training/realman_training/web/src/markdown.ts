import { Marked } from "marked";
import { h } from "./dom";

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape = (text: string) => text.replace(/[&<>"']/g, (c) => ESCAPES[c]);

// Model cards and MODELS.md are written by people and tools: render GitHub-flavoured markdown, but show any raw
// HTML in them as text instead of letting it into the page.
const marked = new Marked({
  gfm: true,
  async: false,
  renderer: {
    html: ({ text }) => escape(text),
    link({ href, title, tokens }) {
      const safe = /^(https?:|mailto:|#|\.{0,2}\/)/i.test(href) ? href : "#";
      return `<a href="${escape(safe)}"${title ? ` title="${escape(title)}"` : ""} target="_blank" rel="noopener noreferrer">${this.parser.parseInline(tokens)}</a>`;
    },
  },
});

export function markdown(source: string, attrs: Record<string, unknown> = {}): HTMLElement {
  const el = h("div", { ...attrs, class: `markdown${attrs.class ? ` ${attrs.class}` : ""}` });
  el.innerHTML = marked.parse(source) as string;
  for (const table of el.querySelectorAll("table")) table.replaceWith(h("div", { class: "table-wrap" }, table.cloneNode(true)));
  return el;
}
