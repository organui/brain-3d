# PR cleanup validation — 2026-10-10

The upper consistency PR was merged into the existing lower PR branch after GitHub app write access was restored. The initial HTTP 403 blockage was resolved; these checks were performed before the final lower-PR squash merge. Branches are preserved.

## Reproduced and fixed

In desktop Chromium (1440×900, SwiftShader), select **Left lateral ventricle** from Anatomy, close the panel, then click its projected geometry behind a 22%-opaque ghost. The original stacked branch selected **Left temporal lobe**. The local fix selects **Left lateral ventricle** at the same point.

The picking policy prefers the nearest visible solid mesh, falling back to the nearest ghost when no solid mesh is hit. Hidden meshes and hidden ancestors are excluded. Regression tests cover these cases. No scene geometry, asset attribution, framing, or licensing was changed.

## Validation

- Frozen Bun 1.4.2 installation: passed.
- Unit tests after fix: 7 passed; zero failed.
- Typecheck and production build: passed.
- Model mappings and runtime checksum: passed before the event-handler-only fix.
- Chromium desktop 1440×900 and mobile viewport 390×844: actual model renders; no page errors or horizontal overflow; panel receives focus; Escape closes it and returns focus to Anatomy; zoom/reset and named-view selection pass; rendering remains demand-driven after resize.
- The reproduced transparency click passes after the fix on desktop.
- Physical devices, Safari/Firefox, and manual screen readers: not tested.
- Publishing and final merge: compare the fetched remote tree with these validated contents, recheck exact-head statuses, and verify the post-merge main tree. The PR timeline records the resulting merge state.

Detailed browser output, screenshots, and the browser harness are saved in the cloud environment under `/workspace/organui-cleanup/evidence` and `/workspace/organui-cleanup/tooling`. Local copies of this repository's screenshots are in `.verification/cleanup` (not committed).
