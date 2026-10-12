Blocks usable directly from Markdown (registered globally in `theme/index.ts`; styles in `custom.css`).

```md
<Glance :items="[{ label: '机械臂', value: 'l / m / r' }, { label: '入口', value: './rm65 up' }]" />

<Cards>
<Card kicker="Driver" title="驱动与运动" href="/development/realman-driver-scaffold">一句话说明。</Card>
</Cards>

<Steps>

1. 第一步。
2. 第二步。

</Steps>

<DocFigure
  src="/screenshots/web-control-overview.png"
  alt="说明"
  caption="标题"
  :marks="[{ x: 33, y: 40, label: '编号 1 的说明' }]"
/>

<UrdfFigure model="arm-gripper" controls animate caption="拖动滑块" />
<ArchitectureMap />
<ModeExplorer />
<LimitExplorer />
<TfExplorer />
<HandEyeExplainer />
```
Rules: blank lines around Markdown inside `<Steps>`; no inline colors; do not put backticks in component attribute strings (they are not parsed as Markdown); numbers shown by explorers come from `docs-data.json`, which `website/scripts/sync-three-robots.mjs` copies from the YAML configs and `control.xml` at build time. New blocks follow "Adding a genuinely new block" above (CSS in `custom.css`, template here, e2e assertion).

Hand-eye explainer: scene is a pure function of the playhead time (`apply(t)`), so the page player, scrubber and the offline mp4 export draw identical frames. Chapters, captions and formulas live in `theme/handeye/timeline.ts`; geometry (arms, board, ghost boards, camera view) in `scene.ts`; the small IK solver in `kinematics.ts`. Board size, sample gate, solver method and limits come from `docs-data.json` (`calibration`), the l -> m / l -> r poses from `three-robots.json`. Keep the "示意动画 · 非真实标定数据" badge: sample poses and the camera mount are illustrative. The mp4 is rendered by driving `window.__handEye.seek(t)` with Playwright and is not committed.
