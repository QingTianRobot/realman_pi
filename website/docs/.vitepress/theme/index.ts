import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import "./custom.css";
import { setupMermaidZoom } from "./mermaid-zoom";

export default {
  extends: DefaultTheme,
  enhanceApp() {
    // Browser only: adds click-to-zoom to Mermaid diagrams.
    setupMermaidZoom();
  },
} satisfies Theme;
