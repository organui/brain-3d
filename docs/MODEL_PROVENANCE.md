# Model provenance

## Selected source

OrganUI Brain uses BodyParts3D 4.0, specifically `isa_BP3D_4.0_obj_99.zip` plus the official PART-OF and IS-A element mapping tables. The archive is the source’s 99% polygon-reduction variant, not a patient scan or a clinical reference model.

Retrieval and checksums are pinned in `scripts/model-inputs.json` and repeated in `public/models/manifest.json`. `scripts/prepare-model.ts` downloads missing inputs into ignored `.asset-cache/`, verifies each SHA-256 before reading it, and creates `public/models/brain.glb`. Raw archives and preparation intermediates are not committed.

## Geometry inspection and ownership

The PART-OF catalog was treated as a candidate list. Actual element mappings were inspected before selecting the runtime scope. The release uses:

- four cerebral lobes per hemisphere (26 source elements total);
- bilateral hippocampi (one element each);
- midbrain (six elements after aqueduct exclusion), pons (two), medulla (two), and cerebellum (two);
- paired lateral ventricles, third ventricle, cerebral aqueduct, and fourth ventricle (one element each).

That produces 19 selectable groups from 45 unique element meshes. The exact table is `docs/model-source/selected-mappings.tsv`; each element hash and triangle count is in the manifest.

Compound brain (`FMA50801`), hemisphere (`FMA61819`, `FMA67292`), and brainstem (`FMA79876`) mappings overlap their constituents and are not rendered. The aqueduct element `FJ1738` belongs to both the midbrain compound and cerebral aqueduct mappings; it is excluded from the midbrain runtime group and assigned only to the aqueduct. The conversion script refuses any remaining duplicate element ownership.

## Transformation and orientation

OBJ vertices are recentered on the selected geometry’s source bounding box and uniformly scaled by `0.02`; coordinates change from source `[x, y, z]` to display `[x, z, -y]`. No non-uniform anatomical reshaping is performed.

Source bounds are `[-69.9404, -169.677, 1464.5]` to `[68.8934, 10.3293, 1630.46]` millimeters. Inspection of paired source elements confirms the archive convention used here: left frontal element `FJ1744` has X centroid `+41.70 mm`, while right frontal `FJ1745` has X centroid `-42.97 mm`; left/right hippocampi follow the same sign. The viewer therefore places the anatomical left-lateral camera on display `+X`, anterior on display `+Z` (source `-Y`), and superior on display `+Y` (source `+Z`). Labels describe anatomical viewpoint, not the viewer’s screen side.

## Runtime output

- File: `public/models/brain.glb`
- Size: 5,865,004 bytes
- SHA-256: `1e8d62f8579c195a85cf81790cd74b7d1d158e182f418767668089e209f0c478`
- Geometry: 232,420 triangles across 19 nodes
- Conversion: OBJ faces triangulated, meshes grouped by curated source concepts, smooth normals recomputed, double-sided rough materials applied, and binary GLB emitted

## License evidence

The official archive license page states CC BY 4.0 and was last updated 2025-02-27. `docs/model-source/archive-license.html.txt` preserves the retrieved license content and `license-snapshot.json` records its URL, update date, retrieval date, license, and required credit. Some legacy OBJ headers cite CC BY-SA 2.1 Japan; the distributed attribution records this discrepancy rather than hiding it.

Application code under MIT is separately licensed and does not relicense the model. See `public/models/ATTRIBUTION.md`.

## Content limits

The display grouping follows source mappings rather than inferred sulcal borders. Surface colors are illustrative. Ventricular meshes are cavity representations, not tissue, fluid simulation, or MRI segmentation. The left-side reveal hides four source-backed lobe groups; it does not calculate or fabricate a section plane. The selected labels and mapping ownership received developer review only, not independent expert or clinical validation.
