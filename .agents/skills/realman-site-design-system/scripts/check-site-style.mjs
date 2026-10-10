#!/usr/bin/env node
// Style-conformance gate for the RM65 VitePress site. Run from website/:
//   node ../.agents/skills/realman-site-design-system/scripts/check-site-style.mjs
// Exits 1 on any violation so it can run in CI or before declaring a page done.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(here, "..", "tokens.json"), "utf8"));
const root = resolve(process.cwd(), process.cwd().endsWith("website") ? ".." : ".");
const docs = join(root, "website/docs");
const cssPath = join(docs, ".vitepress/theme/custom.css");
const configPath = join(root, "config/website/vitepress.config.mts");
const problems = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);

const css = readFileSync(cssPath, "utf8");
const config = readFileSync(configPath, "utf8");

// 1. Tokens: the :root and .dark blocks must equal tokens.json.
function block(selector) {
  const m = css.match(new RegExp(`^${selector.replace(".", "\\.")}\\s*\\{([\\s\\S]*?)^\\}`, "m"));
  const out = {};
  if (m) for (const [, k, v] of m[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)) out[k] = v.trim();
  return out;
}
for (const [name, selector] of [["light", ":root"], ["dark", ".dark"]]) {
  const actual = block(selector);
  for (const [k, v] of Object.entries(tokens[name])) {
    if (actual[k] !== v) fail("custom.css", `${selector} ${k} is "${actual[k]}", expected "${v}"`);
  }
  for (const k of Object.keys(actual)) {
    if (!(k in tokens[name])) fail("custom.css", `${selector} defines unregistered token ${k}; add it to tokens.json`);
  }
}

// 2. Breakpoints and literal colours stay inside the registered set.
for (const [, w] of css.matchAll(/@media \(max-width: (\d+px)\)/g)) {
  if (!tokens.breakpoints.includes(w)) fail("custom.css", `unregistered breakpoint ${w}`);
}
const rootBlockEnd = css.indexOf("*,\n*::before");
for (const [, hex] of css.slice(rootBlockEnd).matchAll(/(#[0-9a-fA-F]{3,8})\b/g)) {
  if (!tokens.allowedLiteralColors.includes(hex.toLowerCase())) fail("custom.css", `literal colour ${hex} outside token blocks; use a var(--...)`);
}

// 3. Site config invariants.
const sc = tokens.siteConfig;
if (!config.includes(`lang: "${sc.lang}"`)) fail("vitepress.config.mts", `lang must be ${sc.lang}`);
if (!config.includes(`base: "${sc.base}"`)) fail("vitepress.config.mts", `base must be ${sc.base}`);
if (!config.includes(sc.themeColor)) fail("vitepress.config.mts", `theme-color must be ${sc.themeColor}`);
if (!config.includes(sc.mermaidFont)) fail("vitepress.config.mts", "mermaid font stack changed (CJK labels will overflow)");
if (!config.includes("cleanUrls: true")) fail("vitepress.config.mts", "cleanUrls must stay true");

// 4. Pages and components: no raw colours, no <style> blocks, every class used exists in the theme.
const defined = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
const vitepressNative = /^(vp-|VP|custom-block|tip|warning|danger|info|details|language-|mermaid|dark|light)/;
function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (f === "node_modules" || f === "cache" || f === "dist") return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
for (const file of walk(docs).filter((f) => /\.(md|vue)$/.test(f))) {
  const rel = relative(root, file);
  const text = readFileSync(file, "utf8");
  const isComponent = file.endsWith(".vue");
  if (!isComponent && /<style[\s>]/.test(text)) fail(rel, "<style> block in a page; add styles to custom.css instead");
  if (!isComponent) {
    const prose = text.replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`/g, "");
    for (const [, hex] of prose.matchAll(/(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\b(?![\w-])/g)) {
      if (/style=|color/.test(prose.slice(Math.max(0, prose.indexOf(hex) - 40), prose.indexOf(hex)))) fail(rel, `raw colour ${hex} in markup`);
    }
    if (/style="[^"]*(color|background|font)/.test(prose)) fail(rel, "inline colour/background/font style; use a theme class");
  }
  for (const [, cls] of text.matchAll(/(?<![:\w-])class="([^"]+)"/g)) {
    for (const c of cls.split(/\s+/).filter((c) => c && !c.includes("{") && !c.includes("$"))) {
      if (!defined.has(c) && !vitepressNative.test(c) && !tokens.markerClasses.includes(c)) fail(rel, `class "${c}" is not defined in custom.css`);
    }
  }
}

if (problems.length) {
  console.error(`site style check FAILED (${problems.length})`);
  for (const p of problems) console.error(" - " + p);
  process.exit(1);
}
console.log("site style check passed");
