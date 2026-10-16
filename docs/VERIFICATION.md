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

## Polish pass (2026-10-03)

Changes: per-view camera framing fitted to sampled mesh vertices (the anterior overview is about 25% larger at 1440×900), selection emphasis that recedes unselected structures toward the canvas color, and row/button hover styles limited to hover-capable pointers so touch taps no longer leave a stale highlight.

Checked with Bun 1.4.2 and Playwright-driven headless Chromium (SwiftShader WebGL) on local port `4391`:

- `bun run typecheck`, `bun test` (4 tests, 12 assertions), `bun run build`, `bun run verify:model`, and `bun run format:check` passed.
- All six named views, Reveal inside, guided stop 3, search and selection were inspected at 1440×900; overview and anatomy flow at 390×844 mobile emulation.
- Direct mesh click selected **Right frontal lobe**; arrow-key rotation switched to **Custom view**; repeated zoom in/out stayed within limits; resizing to 900×700 then Reset returned to the framed **Anterior** view with 19 of 19 visible.
- No page or console errors were recorded.
- Screenshots in `docs/screenshots/` (except `deployed-preview.png` and `model-failure.png`) were regenerated in this pass. The Vercel deployment below predates these changes.

## Deployed review artifact

Verified deployment on 2026-09-25:

- URL: `https://brain-3d-beta.vercel.app/`
- Deployment: `dpl_9FMi4etT8g5TtK22AgyfDV7nUm2E`
- Commit: `02ce641`
- Framework: Vite static output
- Status: Ready
- Vercel assigned the project’s first deployment to the production target automatically; no custom domain was attached. Deployment protection remains enabled.

The artifact was built locally with `vercel build --target preview` and uploaded with `vercel deploy --prebuilt`. `vercel inspect` reported Ready, and authenticated `vercel curl` returned the expected HTML. A real-browser smoke test loaded the 5.87 MB GLB, rendered 19 of 19 structures, exercised Reveal inside (15 of 19 visible), opened Anatomy, and filtered ventricular structures. No browser errors were recorded; the known upstream `THREE.Clock` deprecation warning remained. The Vercel error-log scan returned no records, as expected for this static deployment.

## Cross-explorer consistency pass (10 October 2026)

Selection, framing and the anatomy panel now behave the same in all five OrganUI explorers (brain, heart, kidneys, liver, lungs), using the heart explorer as the reference. A selection lifts the chosen structure in its own color and ghosts the rest to 22% opacity, toned toward the canvas. Every named view is framed by `src/framing.ts`, which fits sampled surface points to the view at a shared 80% fill. The panel starts closed, opens from the header Anatomy button with focus moved into it, and Escape closes it and returns focus to that button. Checked in headless Chromium (SwiftShader WebGL) at 1440×900 and 390×844, with typecheck, tests and build passing.

## Registry anatomy tree (2026-10-16)

The hand-built anatomy list and its search box were replaced with the OrganUI registry `anatomy-tree` component. See [registry integration](REGISTRY_INTEGRATION.md) for install provenance and decisions. Checked with Bun 1.4.2 and Playwright 1.56 driving headless Chromium (SwiftShader WebGL) against the Vite dev server on local port `4437`:

- From a clean `node_modules`: `bun install --frozen-lockfile`, `bun run typecheck`, `bun test` (12 tests, 34 assertions, including the new adapter tests), `bun run build`, `bun run verify:model`, and `bun run format:check` passed. The installed component's SHA-256 matched the recorded value after formatting.
- `scripts/browser-check.cjs` (run with `PLAYWRIGHT_MODULE` pointing at a local Playwright) passed at 1440×900:
  - The panel is closed by default. Opening it moves focus into the panel. All four groups start expanded (23 rows).
  - Searching `hippo` shows Deep structures with both hippocampi.
  - Selecting a leaf in the tree updates the chip and details card, and the view label stays **Anterior**. A group-label click leaves the leaf selection unchanged.
  - Hiding Pons gives 18 of 19 and puts its group in the mixed state; the group's mixed button shows all its structures again. Hiding Ventricular spaces gives 14 of 19.
  - The details **Hide** and **Isolate** buttons are reflected in the tree. **Restore all** returns every row to visible.
  - Reset clears the tree search and restores collapsed groups, along with selection and view.
  - Keyboard: arrows, Home, End, Left, and Right navigate and collapse/expand; Enter selects a leaf (a group is ignored); Space toggles visibility.
  - Escape closes the panel and returns focus to the Anatomy button.
  - A 3D click selected **Right frontal lobe** without changing the view label. Its chip name opened the panel with that tree row selected and in view. After that lobe was hidden, the same click selected **Left frontal lobe** behind it, so hidden structures are not pickable.
  - Reveal inside gives 15 of 19 with Cerebral lobes mixed and the hippocampus row scrolled into view. The guided tour stays in sync with the tree, and Finish restores 19 of 19 in Anterior.
- At 390×844 mobile emulation, search, selection, hide/show (mixed group) and Escape focus return worked, with no horizontal overflow (`scrollWidth = clientWidth = 390`).
- No console or page errors were recorded. The upstream `THREE.Clock` deprecation warning still appears in development.
- Tailwind preflight regression check: computed styles of every element outside the anatomy list were compared with `origin/main` (overview, guided tour, About dialog; both viewports). The only differences were zero-width border-style values and the panel height change caused by the tree.
- `anatomy.png`, `reveal.png`, `guided-reveal.png`, and `mobile-anatomy.png` were regenerated. `desktop.png`, `mobile.png`, and `model-failure.png` show the panel closed and were not regenerated. `deployed-preview.png` predates the tree.
- Not tested: screen-reader sessions (no assistive-technology testing was done), physical touch devices, and browsers other than Chromium. The Vercel deployment above predates this change.

## Registry anatomy tree update: colours, non-selectable groups, built-in reveal (2026-10-16)

Reinstalled `anatomy-tree` from organui PR #12 (commit `d6b36d0`, unmerged, served locally; see [registry integration](REGISTRY_INTEGRATION.md)). Leaves now carry their mesh colour, group rows are `selectable: false`, and the app's own scroll-to-selection effect was removed in favour of the component's reveal. Checked with Bun 1.4.2 and Playwright 1.56 driving headless Chromium (SwiftShader WebGL) against the production build (`bun run preview`) on local port `4471`:

- From a clean `node_modules`: `bun install --frozen-lockfile`, `bun run typecheck`, `bun test` (13 tests, 99 assertions), `bun run build`, `bun run verify:model`, and `bun run format:check` passed. `package.json` and `bun.lock` are unchanged (`@base-ui/react` stays pinned at 1.8.0).
- `scripts/browser-check.cjs` passed at 1440×900 and 390×844, including the earlier checks above (with group Enter now expanding/collapsing) and:
  - All 19 leaf rows show a visible swatch whose computed colour equals the structure colour the mesh uses; group rows have none. The chip dot for the selected structure has the same colour.
  - Clicking a group label (desktop and mobile) or pressing Enter on it collapses and expands the group, the row has no `aria-selected`, and the selection is unchanged.
  - With all four groups collapsed and the panel open, a 3D click selected **Right frontal lobe**: Cerebral lobes expanded, the other three groups stayed collapsed, and the row was selected and in view, with the view label still **Anterior**.
  - With Cerebral lobes collapsed and the panel closed, a 3D click selected the same lobe; opening the panel from the chip showed the group expanded and the row selected and in view.
  - On mobile, with Ventricular spaces collapsed and the row list scrolled to the top, the tour's last stop expanded the group and scrolled the list to **Right lateral ventricle**.
  - Reveal inside scrolls the desktop row list to the hippocampus. Search, hide/show of leaves and groups (mixed state), Reset clearing search and expansion, and Escape focus return all passed. No horizontal overflow on mobile (`390 = 390`). No console or page errors.
- `anatomy.png`, `reveal.png`, `guided-reveal.png`, and `mobile-anatomy.png` were regenerated and reviewed.
- Not tested: screen readers, physical touch devices, browsers other than Chromium, and the install against organui.com (blocked here; to be re-verified after PR #12 merges).
