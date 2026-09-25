# Verification evidence

Verified locally on 2026-09-25 with Bun 1.4.2 and the Codex in-app Chromium browser.

## Automated checks

| Check | Result |
| --- | --- |
| `bun run typecheck` | Pass |
| `bun test` | Pass: 4 tests, 12 assertions |
| `bun run build` | Pass: Vite 8.3 production build |
| `bun run verify:model` | Pass: 19 mapped nodes, 232,420 triangles, 5,865,004 bytes, runtime SHA-256 matched |
| `bun run format:check` | Pass |
| Fresh local clone | Pass: frozen offline lockfile install, production build, tests, and model verification without sibling paths |

The state tests verify that isolation leaves exactly one intended structure visible, reveal hides only four left cerebral-lobe surface groups, deep anatomy remains visible during reveal, every guided-tour selection remains visible, and structure/FMA identifiers are unique.

## Browser checks

The local Vite server ran on the project-specific port `4317`; no sibling services were stopped.

Desktop viewport: 1440×900.

- Page loaded to meaningful content with one WebGL canvas and no Vite error overlay.
- Initial anatomy panel was collapsed and the scene reported 19 of 19 structures visible.
- Direct click on the rendered mesh selected **Right frontal lobe**; list selection of **Left hippocampus** updated the same detail card.
- Search for `hippocampus`, hide/show, isolate (1 of 19 visible), and restore (19 of 19) all produced the expected states.
- Named **Superior** view updated the menu and camera; arrow-key rotation changed the menu label to **Custom view**; `+` zoom worked; reset returned to **Anterior**.
- Reveal inside hid exactly the four left surface groups (15 of 19 visible), selected the left hippocampus, and changed to the anatomical left-lateral view.
- The five guided stops advanced through ordinary, reveal, posterior, and isolated states. The final stop showed 1 of 19; Finish tour restored 19 of 19 and the Anterior view.
- The About dialog, anatomy text alternative, attribution link, keyboard focus targets, and live status text were present in the accessibility snapshot.

Mobile viewport emulation: 390×844.

- Initial scene, toolbar, footer, and header fit without horizontal overflow (`scrollWidth = clientWidth = 390`).
- Anatomy opened into the document flow; search and Cerebellum selection exposed details and actions at readable widths.
- This was browser viewport emulation, not a physical touch-device test.

Recovery:

- The runtime GLB was temporarily moved out of the served path. The viewer displayed a clear alert, kept anatomy text available, and exposed **Retry model**.
- After restoring the exact verified file and activating Retry, one canvas returned and no console error remained.
- WebGL context-loss fallback was code-reviewed but not deliberately forced. A missing/invalid GLB recovery was exercised end-to-end.

Console: no errors were recorded during the normal desktop, interaction, recovery, or mobile checks. React Three Fiber emitted the upstream Three.js `THREE.Clock` deprecation warning twice on the first development load; it did not affect rendering or interaction.

## Visual evidence

- `docs/screenshots/desktop.png` — initial desktop overview
- `docs/screenshots/anatomy.png` — anatomy panel, search, selection, and superior camera
- `docs/screenshots/reveal.png` — supported left-surface reveal
- `docs/screenshots/guided-reveal.png` — guided tour reveal step
- `docs/screenshots/mobile.png` — 390×844 overview
- `docs/screenshots/mobile-anatomy.png` — mobile anatomy flow
- `docs/screenshots/model-failure.png` — missing-model recovery state

## Remaining review limits

Independent expert anatomical review, assistive-technology screen-reader sessions, physical mobile hardware, browser engines other than Chromium, sustained GPU/performance profiling, and forced WebGL context loss were not tested. The 5.87 MB model and 793 kB minified Three.js chunk are acceptable for this local demonstration but remain the main download/performance cost.

## Deployed review artifact

Verified deployment on 2026-09-25:

- URL: `https://brain-3d-beta.vercel.app/`
- Deployment: `dpl_9FMi4etT8g5TtK22AgyfDV7nUm2E`
- Commit: `02ce641`
- Framework: Vite static output
- Status: Ready
- Vercel assigned the project’s first deployment to the production target automatically; no custom domain was attached. Deployment protection remains enabled.

The artifact was built locally with `vercel build --target preview` and uploaded with `vercel deploy --prebuilt`. `vercel inspect` reported Ready, and authenticated `vercel curl` returned the expected HTML. A real-browser smoke test loaded the 5.87 MB GLB, rendered 19 of 19 structures, exercised Reveal inside (15 of 19 visible), opened Anatomy, and filtered ventricular structures. No browser errors were recorded; the known upstream `THREE.Clock` deprecation warning remained. The Vercel error-log scan returned no records, as expected for this static deployment.
