import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

// withMermaid renders ```mermaid fences client-side and follows the light/dark theme.
export default withMermaid(defineConfig({
  lang: "zh-CN",
  title: "RM65 ROS 2",
  description: "三台 RealMan RM65 机械臂的 ROS 2 Humble 控制平台：驱动、遥操作、行为树、夹爪、相机标定与策略桥接",
  // GitHub Pages hosts this repository as a project site rather than at the domain root.
  base: "/realman_pi/",
  // Mermaid sizes boxes by measuring text in its own font. Its default (trebuchet/verdana) has no CJK glyphs,
  // so Chinese labels fall back to a wider font after measuring and spill out of their boxes and the SVG.
  // Pin one CJK-capable stack for both measuring and rendering, and wrap long sequence messages.
  mermaid: {
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", system-ui, sans-serif',
    themeVariables: {
      fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", system-ui, sans-serif',
    },
    flowchart: { htmlLabels: true, padding: 16, nodeSpacing: 40, rankSpacing: 50 },
    sequence: { wrap: true, width: 180, actorMargin: 60, messageMargin: 40, noteMargin: 12 },
  },
  // Stable extension-free URLs keep links consistent between local preview and Pages.
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: "https://qingtianrobot.github.io/realman_pi/",
  },
  vite: {
    // Generated model assets stay ignored; sync-three-robots.mjs rebuilds them from root config/ before each run.
    publicDir: resolve(repositoryDirectory, "website/docs/.vitepress/cache/public"),
    // The dev server cannot load these CommonJS deps of the Mermaid plugin unless they are pre-bundled.
    optimizeDeps: { include: ["mermaid", "fastdom"] },
  },
  head: [
    // Keep browser chrome and native controls aligned with the site theme.
    ["meta", { name: "theme-color", content: "#f2f4f1" }],
    ["meta", { name: "color-scheme", content: "light dark" }],
  ],
  themeConfig: {
    // Navigation separates operator guides, architecture, the developer manual and lookup tables.
    siteTitle: "RM65 / ROS 2",
    nav: [
      { text: "快速开始", link: "/guide/getting-started" },
      { text: "架构", link: "/architecture/overview" },
      { text: "开发者手册", link: "/development/" },
      { text: "参考", link: "/reference/ros-interfaces" },
      { text: "故障排查", link: "/troubleshooting" },
    ],
    sidebar: [
      {
        text: "开始",
        items: [
          { text: "项目概览", link: "/" },
          { text: "快速开始", link: "/guide/getting-started" },
          { text: "相机", link: "/guide/cameras" },
          { text: "远程 RViz", link: "/guide/remote-rviz" },
          { text: "故障排查", link: "/troubleshooting" },
        ],
      },
      {
        text: "架构",
        items: [
          { text: "系统架构总览", link: "/architecture/overview" },
          { text: "仓库结构", link: "/architecture/package" },
          { text: "完整 TF 树", link: "/architecture/tf-tree" },
          { text: "支持型号", link: "/models/" },
        ],
      },
      {
        text: "开发者手册",
        items: [
          { text: "手册入口", link: "/development/" },
          { text: "测试与验证", link: "/development/testing" },
          { text: "功能文档同步", link: "/development/documentation-workflow" },
        ],
      },
      {
        text: "运行与部署",
        items: [
          { text: "启动入口索引", link: "/development/startup-entries" },
          { text: "系统 Bringup", link: "/development/system-bringup" },
          { text: "生产运维手册", link: "/development/production-operations" },
        ],
      },
      {
        text: "驱动与运动",
        items: [
          { text: "驱动与运动控制", link: "/development/realman-driver-scaffold" },
          { text: "Action 开发与测试", link: "/development/realman-action-development" },
          { text: "Python 驱动查询", link: "/development/realman-python-driver" },
        ],
      },
      {
        text: "控制与输入",
        items: [
          { text: "行为树控制权与 Mock", link: "/development/behavior-tree-control" },
          { text: "行为树机械臂移动 Demo", link: "/development/behavior-tree-motion" },
          { text: "Pika 遥操作", link: "/development/pika-teleop" },
          { text: "Web 控制与 URDF 影子", link: "/development/realman-web-control" },
          { text: "Xbox 手柄输入", link: "/development/xbox-controller" },
          { text: "笛卡尔速度跟随测试", link: "/development/velocity-follow-test" },
        ],
      },
      {
        text: "末端、感知与策略",
        items: [
          { text: "Changingtek 夹爪控制", link: "/development/gripper-control" },
          { text: "三臂 ChArUco 手眼标定", link: "/development/camera-calibration" },
          { text: "三臂配置驱动可视化", link: "/development/three-arm-visualization" },
          { text: "VLA 策略桥接节点", link: "/development/policy-bridge" },
        ],
      },
      {
        text: "参考",
        items: [
          { text: "ROS 2 接口总表", link: "/reference/ros-interfaces" },
          { text: "配置文件总表", link: "/reference/configuration" },
          { text: "CLI 与环境变量", link: "/reference/cli-and-env" },
        ],
      },
    ],
    search: {
      provider: "local",
      options: {
        translations: {
          button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
          modal: {
            noResultsText: "没有找到相关内容",
            resetButtonTitle: "清除查询",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
          },
        },
      },
    },
    outline: { level: [2, 3], label: "本页内容" },
    docFooter: { prev: "上一页", next: "下一页" },
    lastUpdated: { text: "最后更新" },
    editLink: {
      pattern: "https://github.com/QingTianRobot/realman_pi/edit/main/website/docs/:path",
      text: "在 GitHub 上编辑此页",
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/QingTianRobot/realman_pi" },
    ],
    footer: {
      message: "基于 ROS 2 Humble 的 RealMan RM65 三臂控制平台",
      copyright: "QingTianRobot",
    },
  },
}));
