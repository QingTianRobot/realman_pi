import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import "./custom.css";
import { setupMermaidZoom } from "./mermaid-zoom";
import { vReveal } from "./reveal";
import Layout from "./Layout.vue";
import ArchitectureMap from "./components/ArchitectureMap.vue";
import LimitExplorer from "./components/LimitExplorer.vue";
import ModeExplorer from "./components/ModeExplorer.vue";
import Card from "./components/Card.vue";
import Cards from "./components/Cards.vue";
import DocFigure from "./components/DocFigure.vue";
import Glance from "./components/Glance.vue";
import Steps from "./components/Steps.vue";
import TfExplorer from "./components/TfExplorer.vue";
import UrdfFigure from "./components/UrdfFigure.vue";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // Browser only: adds click-to-zoom to Mermaid diagrams.
    setupMermaidZoom();
    app.directive("reveal", vReveal);
    // Blocks usable directly from Markdown (see the realman-site-components skill).
    app.component("ArchitectureMap", ArchitectureMap);
    app.component("LimitExplorer", LimitExplorer);
    app.component("ModeExplorer", ModeExplorer);
    app.component("Card", Card);
    app.component("Cards", Cards);
    app.component("DocFigure", DocFigure);
    app.component("Glance", Glance);
    app.component("Steps", Steps);
    app.component("TfExplorer", TfExplorer);
    app.component("UrdfFigure", UrdfFigure);
  },
} satisfies Theme;
