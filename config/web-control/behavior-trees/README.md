# Web Control Behavior-Tree Favorites

The :8765 page stores the behavior trees an operator pinned in `favorites.yaml`
(`realman_bt_favorites.v1`): an ordered list of file names from
`config/behavior-trees/`. Pinned trees are listed first in the start menu, in
this order, for every browser. The file is created on the first pin and is
rewritten atomically; deleting it simply clears the favorites.
