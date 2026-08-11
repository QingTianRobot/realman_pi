---
layout: page
sidebar: false
aside: false
footer: false
pageClass: rm-home-page
title: RealMan RM65 ROS 2
description: RealMan RM65 的 ROS 2 Humble URDF、完整 TF 树和 RViz 2 Docker 环境。
---

<script setup>
import { withBase } from 'vitepress'
import RobotViewer from './.vitepress/theme/components/RobotViewer.vue'
</script>

<div class="rm-home">
  <section class="rm-hero">
    <RobotViewer />
    <div class="rm-hero-inner">
      <div class="hero-copy">
        <p class="hero-kicker">ROS 2 Humble / Robot Description</p>
        <h1>RealMan RM65</h1>
        <p class="hero-lead">面向 RM65 系列机械臂的 URDF、网格资源、完整 TF 树与可复现 RViz 2 Docker 环境。</p>
        <div class="hero-actions">
          <a class="rm-action primary" :href="withBase('/guide/getting-started')">Docker 快速开始</a>
          <a class="rm-action" :href="withBase('/models/')">查看支持型号</a>
        </div>
      </div>
    </div>
  </section>

  <section class="signal-band" aria-label="项目状态">
    <div class="signal-inner">
      <div class="signal-item"><span class="signal-value">RM65-B</span><span class="signal-label">默认型号</span></div>
      <div class="signal-item"><span class="signal-value">5</span><span class="signal-label">URDF 型号</span></div>
      <div class="signal-item"><span class="signal-value">world</span><span class="signal-label">TF 根坐标系</span></div>
    </div>
  </section>

  <section class="rm-section">
    <div class="section-inner">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Runtime path</p>
          <h2>从模型文件到 RViz 2</h2>
        </div>
        <p>同一个启动入口负责型号校验、机器人描述发布、关节状态调节和 RViz 配置加载，Docker 与本地工作空间保持一致。</p>
      </div>
      <div class="pipeline">
        <article class="pipeline-step"><span class="step-index">01</span><h3>选择型号</h3><p>通过 <code>RM65_MODEL</code> 或 launch 参数选择五种 URDF。</p></article>
        <article class="pipeline-step"><span class="step-index">02</span><h3>发布描述</h3><p><code>robot_state_publisher</code> 读取模型并发布 TF。</p></article>
        <article class="pipeline-step"><span class="step-index">03</span><h3>调节关节</h3><p>GUI 发布六个旋转关节的实时状态。</p></article>
        <article class="pipeline-step"><span class="step-index">04</span><h3>检查结果</h3><p>RViz 2 同时显示 RobotModel 与完整 TF 树。</p></article>
      </div>
    </div>
  </section>

  <section class="rm-section alt">
    <div class="section-inner">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Model matrix</p>
          <h2>一个入口，五种描述</h2>
        </div>
        <p>默认使用 RM65-B。带 <code>-V</code> 的描述还包含从末端延伸出的相机坐标系。</p>
      </div>
      <div class="model-grid">
        <article class="model-item featured"><h3>RM65-B</h3><p>默认型号，包含 world、基座和六个机械臂连杆。</p></article>
        <article class="model-item"><h3>RM65-B-V</h3><p>RM65-B 描述，并加入相机安装相关坐标系。</p></article>
        <article class="model-item"><h3>RM65-6F</h3><p>独立 URDF 与 STL 网格资源的六轴描述。</p></article>
        <article class="model-item"><h3>RM65-6FB</h3><p>6FB 型号对应的质量、关节和几何描述。</p></article>
        <article class="model-item"><h3>RM65-6FB-V</h3><p>6FB 描述，并加入相机安装相关坐标系。</p></article>
      </div>
      <a class="section-link" :href="withBase('/models/')">比较所有型号 →</a>
    </div>
  </section>

  <section class="rm-section">
    <div class="section-inner">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Transform graph</p>
          <h2>以 world 为根的完整 TF</h2>
        </div>
        <p>固定关节连接 world 与 base_link，六个旋转关节继续连接到 link_6，避免 RViz 中出现断开的坐标系。</p>
      </div>
      <div class="tf-rail" aria-label="RM65-B TF 树">
        <span class="tf-node root">world</span><span class="tf-arrow"></span>
        <span class="tf-node">base_link</span><span class="tf-arrow"></span>
        <span class="tf-node">link_1</span><span class="tf-arrow"></span>
        <span class="tf-node">link_2</span><span class="tf-arrow"></span>
        <span class="tf-node">link_3</span><span class="tf-arrow"></span>
        <span class="tf-node">link_4</span><span class="tf-arrow"></span>
        <span class="tf-node">link_5</span><span class="tf-arrow"></span>
        <span class="tf-node">link_6</span>
      </div>
      <a class="section-link" :href="withBase('/architecture/tf-tree')">查看 TF 细节 →</a>
    </div>
  </section>

  <section class="rm-final">
    <div class="section-inner">
      <div><h2>在 ROS 2 Humble 中启动 RM65-B</h2><p>从仓库根目录构建镜像，Compose 会装载模型、RViz 配置与 X11 授权。</p></div>
      <a class="rm-action" :href="withBase('/guide/getting-started')">查看运行命令</a>
    </div>
  </section>
</div>
