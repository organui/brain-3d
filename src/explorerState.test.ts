import { describe, expect, test } from 'bun:test'
import { leftSurfaceIds, structures, tour } from './anatomy'
import { isolatedHidden, revealHidden, tourHidden } from './explorerState'

describe('visibility actions', () => {
  test('isolate leaves exactly one requested structure visible', () => {
    const hidden = isolatedHidden('right-lateral-ventricle')
    expect(hidden.size).toBe(structures.length - 1)
    expect(hidden.has('right-lateral-ventricle')).toBe(false)
  })

  test('reveal removes only the left cerebral surface and keeps deep anatomy visible', () => {
    const hidden = revealHidden()
    expect([...hidden].sort()).toEqual([...leftSurfaceIds].sort())
    expect(hidden.has('left-hippocampus')).toBe(false)
    expect(hidden.has('left-lateral-ventricle')).toBe(false)
  })

  test('every tour state has its selected structure visible', () => {
    for (const step of tour) expect(tourHidden(step).has(step.id)).toBe(false)
  })
})

describe('catalog integrity', () => {
  test('has unique ids and FMA identifiers', () => {
    expect(new Set(structures.map((structure) => structure.id)).size).toBe(structures.length)
    expect(new Set(structures.map((structure) => structure.fma)).size).toBe(structures.length)
  })
})
