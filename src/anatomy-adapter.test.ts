import { describe, expect, test } from 'bun:test'
import { structures } from './anatomy'
import {
  anatomyTree,
  assertAnatomyMapping,
  groupIds,
  hiddenFromVisibility,
  normalizeVisibility,
  sceneIdsForNode,
  visibilityFromHidden,
} from './anatomy-adapter'

describe('anatomy tree adapter', () => {
  test('uses interface group rows over every structure exactly once', () => {
    expect(groupIds).toEqual([
      'group-cerebral-lobes',
      'group-deep-structures',
      'group-brainstem-cerebellum',
      'group-ventricular-spaces',
    ])
    expect(anatomyTree.flatMap((group) => group.children!.map(({ id }) => id)).sort()).toEqual(
      structures.map(({ id }) => id).sort(),
    )
  })

  test('marks groups as non-selectable and colours leaves like their meshes', () => {
    for (const group of anatomyTree) {
      expect(group.selectable).toBe(false)
      expect(group.color).toBeUndefined()
      for (const leaf of group.children!) {
        expect(leaf.selectable).toBeUndefined()
        expect(leaf.color).toBe(structures.find(({ id }) => id === leaf.id)!.color)
        expect(leaf.color).toMatch(/^#[0-9a-f]{6}$/)
      }
    }
  })

  test('maps groups to their scene leaves and leaves to themselves', () => {
    expect(sceneIdsForNode('group-deep-structures')).toEqual([
      'left-hippocampus',
      'right-hippocampus',
    ])
    expect(sceneIdsForNode('group-cerebral-lobes')).toHaveLength(8)
    expect(sceneIdsForNode('pons')).toEqual(['pons'])
    expect(sceneIdsForNode('not-a-node')).toEqual([])
    expect(sceneIdsForNode(null)).toEqual([])
  })

  test('treats omitted visibility as visible', () => {
    const normalized = normalizeVisibility({ pons: false })
    expect(normalized.pons).toBe(false)
    expect(normalized.cerebellum).toBe(true)
    expect(Object.keys(normalized)).toHaveLength(structures.length)
  })

  test('round-trips the app hidden set through tree visibility', () => {
    const hidden = new Set(['pons', 'left-hippocampus'])
    const visibility = visibilityFromHidden(hidden)
    expect(visibility).toEqual({ 'left-hippocampus': false, pons: false })
    expect(hiddenFromVisibility(visibility)).toEqual(hidden)
    expect(hiddenFromVisibility({ pons: true, 'group-deep-structures': false })).toEqual(new Set())
  })

  test('rejects missing, unknown, and duplicate leaves', () => {
    const [first, ...rest] = anatomyTree
    const withoutFirstLeaf = [{ ...first, children: first.children!.slice(1) }, ...rest]
    expect(() => assertAnatomyMapping(withoutFirstLeaf)).toThrow(/missing=left-frontal/)
    expect(() => assertAnatomyMapping([...anatomyTree, { id: 'cortex', label: 'Cortex' }])).toThrow(
      /unknown=cortex/,
    )
    expect(() => assertAnatomyMapping([...anatomyTree, { id: 'pons', label: 'Pons' }])).toThrow(
      /duplicates=pons/,
    )
    expect(() => assertAnatomyMapping()).not.toThrow()
  })
})
