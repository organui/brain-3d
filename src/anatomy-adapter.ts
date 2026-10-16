import { anatomyIndex, leafIds, type AnatomyNode } from '@/components/ui/anatomy-tree'
import { groups, structures } from './anatomy'

// Scene-specific mapping between the registry anatomy tree and this explorer.
// Group rows are interface groupings taken from the existing structure catalog
// (`Structure.group`); they do not claim anatomical containment.

export const groupId = (group: string) =>
  `group-${group
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`

export const anatomyTree: AnatomyNode[] = groups.map((group) => ({
  id: groupId(group),
  label: group,
  children: structures
    .filter((structure) => structure.group === group)
    .map(({ id, name }) => ({ id, label: name })),
}))

export const groupIds = anatomyTree.map(({ id }) => id)

const structureIds = new Set(structures.map(({ id }) => id))
const { nodes } = anatomyIndex(anatomyTree)

export const isStructureId = (id: string | null): id is string => !!id && structureIds.has(id)

/** Scene leaves (GLB structure IDs) represented by a tree row. */
export function sceneIdsForNode(id: string | null): string[] {
  if (!id) return []
  const node = nodes.get(id)
  return node ? leafIds(node).filter((leaf) => structureIds.has(leaf)) : []
}

/** The tree's "missing means visible" map as an explicit entry per structure. */
export function normalizeVisibility(
  visibility: Readonly<Record<string, boolean>>,
): Record<string, boolean> {
  return Object.fromEntries(structures.map(({ id }) => [id, visibility[id] !== false]))
}

/** App hidden set -> tree leaf visibility map (only hidden leaves are listed). */
export function visibilityFromHidden(hidden: ReadonlySet<string>): Record<string, boolean> {
  return Object.fromEntries(
    structures.filter(({ id }) => hidden.has(id)).map(({ id }) => [id, false]),
  )
}

/** Tree leaf visibility map -> app hidden set. Unknown IDs are ignored. */
export function hiddenFromVisibility(visibility: Readonly<Record<string, boolean>>): Set<string> {
  const normalized = normalizeVisibility(visibility)
  return new Set(structures.filter(({ id }) => !normalized[id]).map(({ id }) => id))
}

export function assertAnatomyMapping(data: readonly AnatomyNode[] = anatomyTree) {
  const leaves = data.flatMap(leafIds)
  const duplicates = leaves.filter((id, index) => leaves.indexOf(id) !== index)
  const missing = structures.filter(({ id }) => !leaves.includes(id)).map(({ id }) => id)
  const unknown = leaves.filter((id) => !structureIds.has(id))
  if (duplicates.length || missing.length || unknown.length)
    throw new Error(
      `Invalid anatomy mapping: duplicates=${duplicates.join(',')} missing=${missing.join(',')} unknown=${unknown.join(',')}`,
    )
}

assertAnatomyMapping()
