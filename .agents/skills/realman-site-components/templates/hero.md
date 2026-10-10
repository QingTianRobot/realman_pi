Frontmatter + imports for the home page (`website/docs/index.md`):

```md
---
layout: page
sidebar: false
aside: false
footer: false
pageClass: rm-home-page
title: <title>
description: <one sentence, Chinese>
---

<script setup>
import { withBase } from 'vitepress'
import RobotViewer from './.vitepress/theme/components/RobotViewer.vue'
</script>
```

Hero:

```html
<div class="rm-home">
  <section class="rm-hero">
    <RobotViewer />
    <div class="rm-hero-inner">
      <div class="hero-copy">
        <p class="hero-kicker">ROS 2 Humble / 三臂控制平台</p>
        <h1>RealMan RM65</h1>
        <p class="hero-lead">…一到两句，可含 <code>config/…</code> 路径。</p>
        <div class="hero-actions">
          <a class="rm-action primary" :href="withBase('/guide/getting-started')">快速开始</a>
          <a class="rm-action" :href="withBase('/architecture/overview')">系统架构</a>
        </div>
      </div>
    </div>
  </section>
  <!-- following sections go inside .rm-home -->
</div>
```
