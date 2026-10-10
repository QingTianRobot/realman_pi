---
layout: page
sidebar: false
aside: false
footer: false
pageClass: rm-home-page
title: RealMan RM65 ROS 2
description: 三台 RealMan RM65 机械臂的 ROS 2 Humble 控制平台：驱动、遥操作、行为树、夹爪、相机标定与策略桥接。
---

<script setup>
import { withBase } from 'vitepress'
import RobotViewer from './.vitepress/theme/components/RobotViewer.vue'
import TfExplorer from './.vitepress/theme/components/TfExplorer.vue'
</script>

<div class="rm-home">
  <section class="rm-hero">
    <RobotViewer />
    <div class="rm-hero-inner">
      <div class="hero-copy">
        <p class="hero-kicker">ROS 2 Humble / 三臂控制平台</p>
        <h1>RealMan RM65</h1>
        <p class="hero-lead">三台 RM65 机械臂的驱动、键盘 / Pika / 策略遥操作、行为树编排、夹爪、相机标定，运行在同一个可复现的 Docker 环境里。右侧场景由 <code>config/ros/three_robots.yaml</code> 实时构建。</p>
        <div class="hero-actions">
          <a class="rm-action primary" :href="withBase('/guide/getting-started')">快速开始</a>
          <a class="rm-action" :href="withBase('/architecture/overview')">系统架构</a>
        </div>
      </div>
    </div>
  </section>

  <section class="signal-band" aria-label="项目状态">
    <div class="signal-inner">
      <div class="signal-item"><span class="signal-value">3</span><span class="signal-label">机械臂数量</span></div>
      <div class="signal-item"><span class="signal-value">l / m / r</span><span class="signal-label">命名空间</span></div>
      <div class="signal-item"><span class="signal-value">7</span><span class="signal-label">输入模式</span></div>
    </div>
  </section>

  <section class="rm-section">
    <div class="section-inner">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Capabilities</p>
          <h2>控制平台包含什么</h2>
        </div>
        <p>每一项都有独立的契约页面：接口、配置来源、安全边界和验证方式。</p>
      </div>
      <div class="model-grid">
        <article class="model-item featured"><h3>驱动与运动</h3><p>三臂 SDK 驱动、可取消的 MoveJ/MoveL、连续轨迹、笛卡尔速度与位姿 session；每臂唯一运动 owner、watchdog 和坐标 motion gate。</p><a class="section-link" :href="withBase('/development/realman-driver-scaffold')">驱动与运动控制 →</a></article>
        <article class="model-item"><h3>遥操作输入</h3><p>Web 键盘、Pika 位置 / 速度 / Mixed、Xbox 手柄；统一由输入模式路由选择控制权。</p><a class="section-link" :href="withBase('/development/pika-teleop')">Pika 遥操作 →</a></article>
        <article class="model-item"><h3>行为树编排</h3><p>常驻输入路由器与分阶段 MoveJ 任务树，只读运行监视器，终态归档。</p><a class="section-link" :href="withBase('/development/behavior-tree-control')">行为树控制权 →</a></article>
        <article class="model-item"><h3>夹爪</h3><p>Changingtek Modbus RTU 多串口并行驱动，键盘与 Pika 连续目标。</p><a class="section-link" :href="withBase('/development/gripper-control')">夹爪控制 →</a></article>
        <article class="model-item"><h3>相机与标定</h3><p>三路 Orbbec 腕部相机 + 全局 D435，ChArUco 手眼标定与相对位姿求解。</p><a class="section-link" :href="withBase('/development/camera-calibration')">手眼标定 →</a></article>
        <article class="model-item"><h3>VLA 策略桥</h3><p>OpenPI WebSocket 与 ROS 2 的纯协议转换，滚动时域与模式门控。</p><a class="section-link" :href="withBase('/development/policy-bridge')">策略桥接 →</a></article>
      </div>
    </div>
  </section>

  <section class="rm-section alt">
    <div class="section-inner">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Control path</p>
          <h2>从输入到硬件，越靠近硬件越有否决权</h2>
        </div>
        <p>输入只表达意图；路由决定谁拥有控制权；驱动保证每臂只有一个运动 owner，并在命令断流时独立停机。</p>
      </div>
      <div class="pipeline">
        <article class="pipeline-step"><span class="step-index">01</span><h3>输入</h3><p>Web、键盘、Pika、策略把意图变成 ROS 消息，不直接连 SDK。</p></article>
        <article class="pipeline-step"><span class="step-index">02</span><h3>路由</h3><p>行为树输入模式选择当前控制源，并建立对应的 Action session。</p></article>
        <article class="pipeline-step"><span class="step-index">03</span><h3>运动</h3><p>驱动做限速、限加速度、watchdog、取消与坐标 gate。</p></article>
        <article class="pipeline-step"><span class="step-index">04</span><h3>硬件</h3><p>RealMan SDK 与夹爪串口；断线原地重连，失败保持安全状态。</p></article>
      </div>
      <a class="section-link" :href="withBase('/architecture/overview')">阅读系统架构总览 →</a>
    </div>
  </section>

  <section class="rm-section">
    <div class="section-inner">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Transform graph</p>
          <h2>三臂场景与以 world 为根的 TF</h2>
        </div>
        <p>布局来自标定结果 <code>config/ros/three_robots.yaml</code>；静态变换把三台机械臂接入同一个 <code>world</code>，每条分支再由六个旋转关节延伸到对应的 <code>link_6</code>。</p>
      </div>
      <TfExplorer />
      <a class="section-link" :href="withBase('/architecture/tf-tree')">查看 TF 细节 →</a>
      <a class="section-link" :href="withBase('/models/')">支持的 RM65 型号 →</a>
    </div>
  </section>

  <section class="rm-final">
    <div class="section-inner">
      <div><h2>在工控机上执行 ./rm65 up</h2><p>一条命令启动 ROS 2 相机、三臂驱动和 Web 控制台；行为树与遥操作输入按需另行启动，默认 dry-run。</p></div>
      <a class="rm-action" :href="withBase('/guide/getting-started')">查看启动步骤</a>
    </div>
  </section>
</div>
