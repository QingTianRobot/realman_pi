import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "zh-CN",
  title: "RM65 ROS 2",
  description: "RealMan RM65 的 ROS 2 Humble URDF、TF 与 RViz 2 Docker 环境",
  base: "/realman_pi/",
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: "https://qingtianrobot.github.io/realman_pi/",
  },
  head: [
    ["meta", { name: "theme-color", content: "#f2f4f1" }],
    ["meta", { name: "color-scheme", content: "light dark" }],
  ],
  themeConfig: {
    siteTitle: "RM65 / ROS 2",
    nav: [
      { text: "快速开始", link: "/guide/getting-started" },
      { text: "型号", link: "/models/" },
      {
        text: "架构",
        items: [
          { text: "TF 树", link: "/architecture/tf-tree" },
          { text: "仓库结构", link: "/architecture/package" },
        ],
      },
      { text: "故障排查", link: "/troubleshooting" },
    ],
    sidebar: [
      {
        text: "开始",
        items: [
          { text: "项目概览", link: "/" },
          { text: "快速开始", link: "/guide/getting-started" },
        ],
      },
      {
        text: "机器人描述",
        items: [
          { text: "支持型号", link: "/models/" },
          { text: "完整 TF 树", link: "/architecture/tf-tree" },
          { text: "仓库与 ROS 图", link: "/architecture/package" },
        ],
      },
      {
        text: "运行维护",
        items: [{ text: "故障排查", link: "/troubleshooting" }],
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
      message: "基于 ROS 2 Humble 的 RealMan RM65 描述包",
      copyright: "QingTianRobot",
    },
  },
});
