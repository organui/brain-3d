# Anatomy-tree registry integration

The Anatomy panel's structure list is the OrganUI registry component `anatomy-tree`, installed with the shadcn CLI and kept in version control. Runtime and ordinary setup (`bun install --frozen-lockfile`, `bun run dev`, `bun run build`) do not contact any registry. The integration follows the kidneys explorer (`organui/kidneys-3d`), which is the reference consumer.

## Exact installation

Installed on 2026-10-16 with:

```sh
REGISTRY_URL=http://127.0.0.1:4410 bunx shadcn@4.21.0 add http://127.0.0.1:4410/anatomy-tree.json -y
```

`organui.com` (the public registry) and `ui.shadcn.com` were blocked by the network policy of the sandbox this work was done in. The item was therefore served from a local static server (`python3 -m http.server 4410 --bind 127.0.0.1`) hosting the registry artifact built from the OrganUI monorepo `master` at commit **`5e20c41`**, plus shadcn's `colors/neutral.json` fetched from the shadcn GitHub repository. `REGISTRY_URL` points the CLI's base-color lookup at that server instead of `ui.shadcn.com`. With normal network access the equivalent command is:

```sh
bunx shadcn@4.21.0 add https://organui.com/r/anatomy-tree.json -y
```

Provenance at install time:

| Artifact                                               | SHA-256                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| Served `anatomy-tree.json` (organui `5e20c41`)         | `f519cf85a68142cb7a054f6b2472649d0dec188c5f2381d4315f12f631874a8e` |
| Embedded source (`files[0].content`)                   | `65a226acc9c873559913611b4fadee51935e955ac63dcc64a8dc5bee2d12e821` |
| Tracked installed `src/components/ui/anatomy-tree.tsx` | `39b294468f2fd06bb81b8c56f485828f941ddfc9065ea5c7c07fdf19582d1842` |

The item declares `@base-ui/react@^1.8.0`. The CLI wrote `^1.8.0` into `package.json`; it was changed back to an exact `1.8.0` pin and `bun install` re-run, so `bun.lock` (text format) resolves 1.8.0. The project uses React 19.2.8, TypeScript 7.0.2, Vite 8.3.0, Tailwind CSS 4.1.18 (`tailwindcss` + `@tailwindcss/vite`), and the kidneys `components.json` (Base UI consumer shape, `@/*` aliases).

## Installed-source differences

The only difference between the embedded source and the installed file is that the CLI removed the leading `"use client"` directive (and the blank line after it) for this non-RSC Vite target (`"rsc": false`). No behavior, markup, API, state, or class names differ.

The `@/* -> src/*` alias was configured in `tsconfig.json` and `vite.config.ts` before installing, so the CLI wrote the file directly to `src/components/ui/anatomy-tree.tsx` (kidneys had to move it). The file is listed in `.prettierignore` and is never hand-edited, so its checksum above stays stable. Re-running the install command should reproduce it byte for byte.

## API used

- `data`: the hierarchy from `src/anatomy-adapter.ts` (unique IDs);
- `selectedId` / `onSelectionChange`: the app's single controlled selection;
- `visibility` / `onVisibilityChange`: a map keyed by **leaf** IDs, missing = visible;
- `defaultExpandedIds`: all four groups start expanded, so every structure name is in the text alternative;
- `label` (`"Brain structures"`, which also produces the visible label "Search brain structures") and `className` (`registry-tree`, for scoped panel styling).

Search and expansion remain internal to the component.

## Application adapter

Scene-specific mapping lives in `src/anatomy-adapter.ts`, built from the existing `structures` catalog and `groups` list in `src/anatomy.ts`; the component itself contains no brain knowledge.

| Tree ID                      | Scene leaves (GLB `structureId`s)                                                                                                          | Meaning                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `group-cerebral-lobes`       | `left-frontal`, `right-frontal`, `left-parietal`, `right-parietal`, `left-temporal`, `right-temporal`, `left-occipital`, `right-occipital` | Interface grouping of the eight lobe surfaces                   |
| `group-deep-structures`      | `left-hippocampus`, `right-hippocampus`                                                                                                    | Interface grouping of the represented deep structures           |
| `group-brainstem-cerebellum` | `midbrain`, `pons`, `medulla`, `cerebellum`                                                                                                | Interface grouping; the cerebellum is not part of the brainstem |
| `group-ventricular-spaces`   | `left-lateral-ventricle`, `right-lateral-ventricle`, `third-ventricle`, `cerebral-aqueduct`, `fourth-ventricle`                            | Interface grouping of cavity-space surfaces                     |

Groups are the panel headings the explorer already used. They are interface groupings only and do not claim anatomical containment (for example, the hippocampi are not presented as children of a lobe, and no hemisphere or whole-brainstem node is added, because the runtime model omits those compound representations to avoid duplicate geometry). Leaf IDs are the existing structure IDs, each matching exactly one GLB node.

The adapter exports:

- `anatomyTree`, `groupIds`, `groupId` — the tree data;
- `sceneIdsForNode` — scene leaves for a leaf or group row;
- `normalizeVisibility` — the component's "missing means visible" contract as an explicit map;
- `visibilityFromHidden` / `hiddenFromVisibility` — conversion between the app's existing hidden `Set` and the tree's leaf visibility map (unknown and group keys are ignored);
- `isStructureId`;
- `assertAnatomyMapping` — runs at import and throws on missing, unknown, or duplicate leaves.

`src/anatomy-adapter.test.ts` covers group IDs and completeness, group-to-leaf mapping, the missing-means-visible rule, hidden-set round-tripping, and each rejection case.

## Decisions

- **State ownership.** The app keeps its existing state: `hidden: Set<string>` and a single `selected` structure ID. The tree's `visibility` is derived from `hidden` (`visibilityFromHidden`) and its changes are written back (`hiddenFromVisibility`). Isolate, Hide/Show structure, Reveal inside, the tour, Restore all, and Reset all write the same `hidden` set, so the tree's leaf and parent (`true` / `false` / `"mixed"`) states always match the scene.
- **Group selection: leaves only.** The explorer's emphasis model (`emphasis()` in `src/anatomy.ts`, used by `Viewer.tsx`) highlights exactly one selected structure at 0.35 emissive and ghosts the rest; it has no multi-structure selection, details card, or chip for a group. Rather than add one, group rows are limited to expand/collapse and visibility toggling. Activating a group's label (click or Enter) is ignored, and the current leaf selection stays as it was. Leaf rows, 3D picks, and tour steps all set the same controlled `selected` ID.
- **Reset** increments a `key` on `<AnatomyTree>`, remounting it to clear its internal search text and restore the default expansion, along with selection, visibility, tour, and camera. Tour steps and 3D picks do not clear the tree's search (the old list did); if a search hides the selected row, the chip and details card still show the selection.
- **Selected row in view.** After a 3D pick, tour step, or Reveal inside, the app scrolls the tree's own row list so the selected row is visible. It does this by querying the rendered `[role="treeitem"][aria-selected="true"]` rather than changing the component. A row inside a collapsed group is not rendered and cannot be scrolled to.
- **Picking.** Hidden structures are not pickable: `pickVisibleMesh` (`src/picking.ts`) discards intersections with objects that are invisible or have an invisible ancestor. The browser check hid a picked lobe and confirmed the same click then selected the structure behind it. Hidden structures stay selectable from the tree, and the details card offers **Show structure**.
- **Removed:** the hand-built grouped list, its search box and `query` state, its scroll-fade measurement, and their CSS. The tree's search matches labels only, so searching by FMA identifier or BodyParts3D source name (which the old box supported) is no longer available. FMA IDs and source names remain in the details card. The per-row colour dots of the old list are gone too. The chip and the 3D selection still use the structure colour.

## Theme and Tailwind setup

`src/styles.css` starts with `@import 'tailwindcss' source('.')`. The `source('.')` limits utility scanning to `src/`, so text in `docs/` does not generate stray utilities. It then defines shadcn token variables (`--background`, `--foreground`, `--muted`, `--muted-foreground`, `--accent`, `--border`, `--input`, `--ring`, `--radius`) using the explorer's existing warm neutral colours, and maps them with `@theme inline`. The app's previous `--muted` text colour was renamed `--muted-ink` (as in kidneys) because shadcn uses `--muted` as a surface colour.

Preflight is kept so the registry component renders as designed. As in kidneys, the app's element-level resets moved into `@layer base`, which comes after preflight, so the component's utility classes still win over them. App class rules stay unlayered. Preflight also removed several browser defaults the app relied on, so the base layer restores them: `html` line-height `normal`, h1–h3 size and weight, inline `svg`, the default button padding (outside the tree), and `margin: auto` for the modal About dialog. A computed-style diff of every element outside the anatomy list was run against `origin/main` (overview, guided tour, and About dialog, at 1440×900 and 390×844). After these restorations the only differences were zero-width border-style values and the panel height change caused by the tree itself. `.registry-tree` rules adjust the tree to the panel: transparent container, line-height 1.5, an internally scrolling row list (capped at 46svh on phones), and pill-shaped visibility buttons.

## Friction and registry observations

1. There is no way to make branch rows non-selectable. Clicking a group label or pressing Enter on it calls `onSelectionChange(groupId)`; this consumer ignores it, so the click visibly does nothing. A prop such as `selectableBranches={false}` would make the leaves-only decision explicit to users and assistive technology.
2. Search and expansion are internal. Resetting them needs a remount, and an app cannot expand a collapsed group to show a row selected in 3D.
3. Search matches `label` only. Consumers with secondary identifiers (FMA IDs here) cannot make them searchable without putting them in the visible label.
4. The `+`/`−` disclosure glyphs and the visible/hidden/mixed buttons are text-only, with no slot for an icon or a per-leaf colour swatch.
5. The CLI rewrote the exact `@base-ui/react` pin to `^1.8.0` in `package.json`; it was re-pinned by hand.

None of these blocked the integration, and the component was not forked.

## Accessibility scope

The tree supplies `role="tree"`/`treeitem` semantics, `aria-selected`, `aria-checked` (including `mixed`), `aria-level`/`setsize`/`posinset`, roving focus, and arrow, Home, End, Enter, and Space keys. These were exercised with Playwright in headless Chromium. **No screen-reader testing was done.**
