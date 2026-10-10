```html
<div class="tf-network" aria-label="三台 RM65 的 TF 树">
  <div class="tf-branch"><span class="tf-node root">world</span><span class="tf-arrow"></span><span class="tf-node arm-l">l/world</span><span class="tf-arrow"></span><span class="tf-node">l/base_link</span><span class="tf-arrow"></span><span class="tf-node">l/link_1 ... l/link_6</span></div>
  <!-- repeat for m (arm-m) and r (arm-r) -->
</div>
```
Frame names must match `config/ros/three_robots.yaml`. `.tf-rail` + `.tf-tree-doc` are the doc-page variant.
