```html
<script setup>
import TfExplorer from './.vitepress/theme/components/TfExplorer.vue'
</script>

<TfExplorer />
```
Interactive TF tree beside a 3D URDF view (home "Transform graph" section). Frame names, parent/child links, joint type, axis, limits and origins are read from the loaded URDF and `three-robots.json` at runtime, so there is nothing to keep in sync by hand. Hovering a tree entry (or a link mesh) highlights the child in `--rm-accent`, its parent in `--vp-c-brand-1`, and draws an arrow parent -> child. Do not fork the component; extend it.
