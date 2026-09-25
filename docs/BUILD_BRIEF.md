# OrganUI Brain: first-release build brief

## Purpose

Build the fourth standalone OrganUI anatomy explorer, following Heart, Liver, and Lungs. Deliver a useful, polished React application developers can run and adapt. Brain exploration should demonstrate navigation between outer regions and deeper structures supported by the selected anatomy model.

- Repository: `organui/brain-3d`.
- Public title: **OrganUI Brain**.
- Location: a sibling of `organui`, `heart-3d`, `liver-3d`, and `lungs-3d` under the OrganUI project folder.
- Deliverable: a working, locally verified explorer with model provenance, screenshots, and reproducible setup.
- Technology direction: Bun, TypeScript, React, Vite, and Three.js; React Three Fiber is appropriate. Check current compatibility, and learn from the sibling implementations.

This repository must run from its own checkout. The monorepo, registry, package architecture, and final brand are still being discussed. Do not extract packages, migrate sibling repositories, or adopt an unapproved brand proposal as part of this work.

## Model inspection before interaction design

Start with the BodyParts3D archive as a candidate, and inspect its actual meshes and compound mappings before deciding the selectable groups. Use another appropriate primary source if it provides a better, redistributable model with sufficient provenance.

Source references checked on 25 September 2026:

- [Official archive downloads](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html)
- [PART-OF structure catalog](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_parts_list_e.txt)
- [PART-OF compound-to-element mappings](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_element_parts.txt)
- [PART-OF inclusion relationships](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_inclusion_relation_list.txt)
- [Official archive license](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)

The catalog lists the brain, cerebral hemispheres, bilateral frontal/temporal/parietal/occipital lobes, cerebellum, pons, hippocampi, and ventricular structures. These are candidate concepts, not verified independent meshes. Inspect the applicable PART-OF and IS-A tables and mesh geometry. Inventory identifiers, element mappings, hierarchy, orientation, bounds, and missing or overlapping representations before constructing the application data model.

The archive license page currently states CC BY 4.0 and a last-update date of 27 February 2025. Apply terms for the exact source downloaded; older BodyParts3D/Anatomography services and model headers may show different notices. Resolve and document source-specific differences rather than copying a sibling's license assumption. For each runtime asset, preserve its source/version, source URL, license and credit, checksum, conversion steps, and modifications. Keep raw archives and intermediate exports in ignored `.asset-cache/`; include practical runtime assets or a documented reproducible retrieval method.

Render the selected geometry early. Preserve anatomical alignment and verify left/right, anterior/posterior, and superior/inferior orientation. Avoid drawing a compound parent and all its constituent meshes on top of one another. Clearly label illustrative colors. Keep cavities distinct from tissue.

## First-release experience

1. A carefully framed overview with the brain as the visual focus and useful loading feedback.
2. Rotation, zoom, reset, and compact named camera views, including useful lateral, anterior/posterior, and superior/inferior views where supported. Show Custom view after manual camera changes, following the Heart interface.
3. A searchable, initially collapsed anatomy panel with synchronized scene/list selection and clear hierarchy or grouping. Let users distinguish hemispheres and major regions where the actual source supports this.
4. Selected structure names and concise, sourced anatomical explanations. Keep scope truthful and avoid simplistic unsupported claims that each region has a single exclusive cognitive function.
5. Hide, isolate, and restore actions that remain predictable across selections, camera changes, and reset.
6. One useful way to reveal supported deeper anatomy: for example hiding one hemisphere or reducing a surface's opacity. Choose the method after geometry inspection. Make visible structures selectable and preserve their relative alignment. A full slicing system is not required; do not fabricate cut surfaces or present a surface cut as MRI.
7. A short guided tour through actual represented structures, with reliable return to the default view.
8. Mobile layouts, keyboard-operable interface controls, reduced-motion behavior, and text-based access to anatomy information.
9. Honest recovery states for missing assets or unavailable WebGL, with attribution and content-review status available in the interface.

Prioritize a coherent model and a dependable small interaction set. Adjust any feature whose required anatomy is missing; document the evidence and completed scope. Avoid padding the hierarchy with unselectable or invented structures.

## Visual direction

Match the updated Heart application: warm neutral full-height canvas, restrained typography, simple OrganUI wordmark, compact toolbar, collapsed anatomy controls, generous space, and a model that dominates the scene. Inspect the actual current Heart source and screenshots before designing. Liver and Lungs provide additional implementation examples. The separate brand folder contains unapproved explorations and should not override this established organ-series style.

Use subtle, consistent region colors and legible selection. Inspect opacity, picking, occlusion, camera framing, and highlighting from multiple views. The brain's folded surfaces and internal parts must remain readable without an oversized dashboard.

An eventual demo sequence could show the whole brain, select a supported region, isolate it, reveal a deeper structure, and restore the overview. Only working interactions should appear in preview material.

## Boundaries

This is an educational interface demonstration. Disease diagnosis, tumor segmentation, patient-specific scans, MRI/DICOM viewing, surgical planning, neural activity, tractography, and physiological simulation are outside the first release. Do not imply independent anatomical review has happened. Record developer checks, source limitations, and outstanding expert review separately.

## Verification and delivery

- Verify that a fresh checkout installs and builds with documented Bun commands, independently of sibling repositories.
- Verify model loading, geometry-to-label mappings, left/right orientation, and source attribution. Record model size and any consequential performance limitations.
- Test actual camera controls, scene/list selection, search, hiding, isolation, reveal behavior, guided exploration, and reset, including combinations that could leave an empty or unusable scene.
- Inspect desktop and mobile layouts in a real browser. Check keyboard focus, loading/failure states, console errors, and visual rendering. State honestly when checks use mobile viewport emulation rather than physical devices.
- Run appropriate type checks, build, model checks, and meaningful tests for interaction/state behavior. Avoid tests that merely mirror implementation details.
- Update README with real setup commands, completed features, screenshots, attribution, and limitations; write model provenance and verification evidence under `docs/`.
- Use a free local port and leave other projects' services running. Preserve all sibling work.
- Build and verify locally. Public deployment, DNS changes, and social publication are separate steps. Initialization alone is not a completed viewer.
