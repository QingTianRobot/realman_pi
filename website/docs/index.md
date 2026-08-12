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
        <p class="hero-lead">根据 <code>config/ros/three_robots.yaml</code> 实时构建三台 RM65 的 URDF 场景、完整 TF 树与可复现 RViz 2 Docker 环境。</p>
        <div class="hero-actions">
          <a class="rm-action primary" :href="withBase('/guide/getting-started')">Docker 快速开始</a>
          <a class="rm-action" :href="withBase('/models/')">查看支持型号</a>
        </div>
      </div>
    </div>
  </section>

  <section class="signal-band" aria-label="项目状态">
    <div class="signal-inner">
      <div class="signal-item"><span class="signal-value">3</span><span class="signal-label">机械臂数量</span></div>
      <div class="signal-item"><span class="signal-value">l / m / r</span><span class="signal-label">命名空间</span></div>
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
        <p>同一个 YAML 配置同时驱动 ROS 2 启动文件和这个网页预览。修改位置、朝向或型号后推送，GitHub Pages 会在构建时重新同步模型。</p>
      </div>
      <div class="pipeline">
        <article class="pipeline-step"><span class="step-index">01</span><h3>读取配置</h3><p><code>config/ros/three_robots.yaml</code> 定义三台机械臂的模型和世界变换。</p></article>
        <article class="pipeline-step"><span class="step-index">02</span><h3>建立命名空间</h3><p><code>l</code>、<code>m</code>、<code>r</code> 分别隔离三组 ROS 话题和 TF。</p></article>
        <article class="pipeline-step"><span class="step-index">03</span><h3>发布完整 TF</h3><p>每台机器人从 <code>world</code> 连接到自己的 <code>link_6</code>。</p></article>
        <article class="pipeline-step"><span class="step-index">04</span><h3>同步网页</h3><p>构建脚本复制当前 URDF 与网格，网页展示推送后的真实配置。</p></article>
      </div>
    </div>
  </section>

  <section class="rm-section alt">
    <div class="section-inner">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Model matrix</p>
          <h2>三臂场景，型号可配</h2>
        </div>
        <p>当前三台机械臂默认使用 RM65-B。每个命名空间都可以在同一个配置文件中切换支持的 URDF 型号。</p>
      </div>
      <div class="model-grid">
        <article class="model-item featured"><h3>l / m / r</h3><p>三台 RM65-B 使用独立命名空间和 TF 前缀，分别受配置中的世界变换控制。</p></article>
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
          <h2>以 world 为根的三组 TF</h2>
        </div>
        <p>静态变换把三台机械臂接入同一个 <code>world</code>。每条分支再由固定关节和六个旋转关节延伸到对应的 <code>link_6</code>。</p>
      </div>
      <div class="tf-network" aria-label="三台 RM65 的 TF 树">
        <div class="tf-branch"><span class="tf-node root">world</span><span class="tf-arrow"></span><span class="tf-node arm-l">l/world</span><span class="tf-arrow"></span><span class="tf-node">l/base_link</span><span class="tf-arrow"></span><span class="tf-node">l/link_1 ... l/link_6</span></div>
        <div class="tf-branch"><span class="tf-node root">world</span><span class="tf-arrow"></span><span class="tf-node arm-m">m/world</span><span class="tf-arrow"></span><span class="tf-node">m/base_link</span><span class="tf-arrow"></span><span class="tf-node">m/link_1 ... m/link_6</span></div>
        <div class="tf-branch"><span class="tf-node root">world</span><span class="tf-arrow"></span><span class="tf-node arm-r">r/world</span><span class="tf-arrow"></span><span class="tf-node">r/base_link</span><span class="tf-arrow"></span><span class="tf-node">r/link_1 ... r/link_6</span></div>
      </div>
      <a class="section-link" :href="withBase('/architecture/tf-tree')">查看 TF 细节 →</a>
    </div>
  </section>

  <section class="rm-final">
    <div class="section-inner">
      <div><h2>在 ROS 2 Humble 中启动三臂场景</h2><p>从仓库根目录构建镜像，Compose 会根据同一份配置加载三台模型、RViz 配置与 X11 授权。</p></div>
      <a class="rm-action" :href="withBase('/guide/getting-started')">查看运行命令</a>
    </div>
  </section>
</div>
