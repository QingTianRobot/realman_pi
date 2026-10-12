// Story of the hand-eye explainer: one timeline, six chapters. Everything the player shows is a pure function
// of the playhead time t (seconds), so the page player, the scrubber and the offline video export stay identical.

export type Chapter = {
  id: string;
  kicker: string;
  title: string;
  start: number;
  end: number;
  // Caption lines; the latest line whose `at` (seconds into the chapter) has passed is shown.
  captions: { at: number; text: string }[];
  // Monospace lines for the formula card.
  formulas: string[];
};

export const CHAPTERS: Chapter[] = [
  {
    id: "problem",
    kicker: "01 问题",
    title: "三个基座，彼此在哪里？",
    start: 0,
    end: 12,
    captions: [
      { at: 0, text: "三条机械臂各自在自己的基座坐标系里工作。" },
      { at: 4.5, text: "但三个基座在桌面上相距多远、朝向如何，没有人量过。" },
      { at: 8.5, text: "标定要求出的，就是基座之间的相对位姿。" },
    ],
    formulas: ["T_base_l_base_m = ?", "T_base_l_base_r = ?"],
  },
  {
    id: "eye-in-hand",
    kicker: "02 眼在手上",
    title: "相机装在末端，板放在桌面",
    start: 12,
    end: 26,
    captions: [
      { at: 0, text: "每条臂的 link_6 上固定一台相机，三台相机都对着同一块 ChArUco 板。" },
      { at: 5, text: "板不动，所以它在世界里只有一个位姿。" },
      { at: 9.5, text: "相机相对 link_6 的安装位姿没人知道，这就是“手眼”。" },
    ],
    formulas: ["T_tool_camera = ?   (手眼 X)", "T_base_board = 常量"],
  },
  {
    id: "sampling",
    kicker: "03 采样",
    title: "三臂同时采样，换很多个姿态",
    start: 26,
    end: 52,
    captions: [
      { at: 0, text: "每次采样，三路相机必须同时看到板，整批才有效。" },
      { at: 6, text: "TF 给出末端位姿 T_base_tool；PnP 从图像角点解出 T_camera_board。" },
      { at: 14, text: "改变末端平移和各轴旋转；同一姿态重复采集不会增加信息。" },
      { at: 21, text: "凑够最少样本数后，才允许求解。" },
    ],
    formulas: ["T_base_tool        ← TF", "T_camera_board     ← solvePnP"],
  },
  {
    id: "solve",
    kicker: "04 求解",
    title: "什么样的 X，能让所有样本说同一件事",
    start: 52,
    end: 72,
    captions: [
      { at: 0, text: "先随便猜一个 X，用每个样本推算“板在基座系里的位置”，30 个结果各不相同。" },
      { at: 7, text: "调整 X，这些推算结果逐渐靠拢：板只有一块，它们本该重合。" },
      { at: 14, text: "重合时的 X 就是手眼求解要找的 T_tool_camera。" },
    ],
    formulas: ["T_base_tool_i · X · T_camera_board_i", "对所有样本 i 应当是同一个矩阵"],
  },
  {
    id: "closure",
    kicker: "05 闭合",
    title: "有了 X，三臂各自算出板的位置",
    start: 72,
    end: 86,
    captions: [
      { at: 0, text: "沿着 基座 → 末端 → 相机 → 板 把变换乘起来。" },
      { at: 6, text: "三臂各算一遍，结果都落在同一块板上；最终取所有样本的均值。" },
    ],
    formulas: ["T_base_board =", "  T_base_tool · T_tool_camera · T_camera_board"],
  },
  {
    id: "relative",
    kicker: "06 相对基座",
    title: "用同一块板，把三个基座连起来",
    start: 86,
    end: 104,
    captions: [
      { at: 0, text: "从 l 基座走到板，再从板走到 m 基座。" },
      { at: 6, text: "同样的方法得到 l 与 r 的关系。" },
      { at: 12, text: "求解成功后写回 three_robots.yaml，并保留 .bak，下次 bringup 生效。" },
    ],
    formulas: ["T_base_l_base_m =", "  T_base_l_board · inverse(T_base_m_board)"],
  },
];

export const DURATION = CHAPTERS[CHAPTERS.length - 1].end;

export const chapterAt = (t: number): number => {
  for (let index = CHAPTERS.length - 1; index >= 0; index -= 1) {
    if (t >= CHAPTERS[index].start) return index;
  }
  return 0;
};

export const captionAt = (t: number): string => {
  const chapter = CHAPTERS[chapterAt(t)];
  const local = t - chapter.start;
  let text = chapter.captions[0].text;
  for (const caption of chapter.captions) if (local >= caption.at) text = caption.text;
  return text;
};

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const smooth = (value: number) => {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
