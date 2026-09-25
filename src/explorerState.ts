import { leftSurfaceIds, structures, type Structure } from './anatomy'

export function isolatedHidden(id: string, items: Structure[] = structures) {
  return new Set(items.filter((structure) => structure.id !== id).map((structure) => structure.id))
}

export function revealHidden() {
  return new Set(leftSurfaceIds)
}

export function tourHidden(step: { id: string; reveal?: boolean; isolate?: boolean }) {
  return step.isolate ? isolatedHidden(step.id) : step.reveal ? revealHidden() : new Set<string>()
}
