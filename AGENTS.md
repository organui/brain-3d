# OrganUI Brain development

Read `docs/BUILD_BRIEF.md` before implementation.

- Work in this standalone repository. Keep sibling organ repositories, brand drafts, and the OrganUI monorepo unchanged and independently runnable.
- Use Bun for dependency installation and scripts; commit the text lockfile.
- Favor a small, working application. Introduce shared abstractions only when demonstrated reuse supports them.
- Match the current Heart explorer's warm neutral canvas, compact camera controls, restrained typography, and collapsed anatomy panel. Read sibling screenshots and source for context without introducing sibling runtime dependencies.
- Use real anatomy assets with checked redistribution terms. Record source versions, transformations, checksums, mappings, and attribution separately from the code license.
- Inspect source geometry and relationships before defining hemispheres, lobes, or internal groups. Resolve compound structures and overlapping representations; never invent a segmentation or anatomy absent from the source.
- Preserve anatomical left/right orientation and relative positioning. Do not infer patient laterality from screen position.
- Clearly distinguish outer anatomy, internal tissue, and cavity representations. Do not present surface clipping as MRI or a validated anatomical cross-section.
- Document the scope of content review. Do not claim clinical validation, neural activity, functional localization, or physiological simulation without appropriate evidence.
- Support ordinary interface controls for anatomy information, keyboard operation, reduced motion, loading feedback, unavailable models, and WebGL failure.
- Before delivery, run applicable type checks, a production build, model checks, and meaningful interaction checks. Inspect the actual rendered model and interface in a browser on desktop and mobile layouts.
- Other tasks may run concurrently. Use a free local port, never stop sibling services, and keep verification artifacts in this repository.
- Keep the README's status, commands, screenshots, review notes, and verification limits accurate.
