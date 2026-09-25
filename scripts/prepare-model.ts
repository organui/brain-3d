import { mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { unzipSync, strFromU8 } from 'fflate'
import { Document, NodeIO } from '@gltf-transform/core'
import { BufferGeometry, Float32BufferAttribute, Color } from 'three'
import inputs from './model-inputs.json'
import { structures } from '../src/anatomy'

const sha = (data: Uint8Array) => createHash('sha256').update(data).digest('hex')
await mkdir('.asset-cache', { recursive: true })
await mkdir('public/models', { recursive: true })
for (const input of inputs) {
  const file = Bun.file(`.asset-cache/${input.file}`)
  if (!(await file.exists())) {
    console.log(`Downloading ${input.file}…`)
    const response = await fetch(input.url)
    if (!response.ok) throw new Error(`${input.file}: HTTP ${response.status}`)
    await Bun.write(file, response)
  }
  if (sha(new Uint8Array(await file.arrayBuffer())) !== input.sha256) {
    throw new Error(
      `Checksum mismatch: ${input.file}. Refusing changed upstream data; review it before updating the pin.`,
    )
  }
}
const archive = unzipSync(
  new Uint8Array(await Bun.file('.asset-cache/isa_BP3D_4.0_obj_99.zip').arrayBuffer()),
)
const mappings = {
  partof: (await Bun.file('.asset-cache/partof_element_parts.txt').text())
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.split('\t')),
  isa: (await Bun.file('.asset-cache/isa_element_parts.txt').text())
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.split('\t')),
}
const doc = new Document()
doc.getRoot().getAsset().copyright =
  'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International'
const scene = doc.createScene('OrganUI Brain — BodyParts3D 4.0')
const buffer = doc.createBuffer()
const used = new Set<string>()
const min = [Infinity, Infinity, Infinity],
  max = [-Infinity, -Infinity, -Infinity]
const prepared = structures.map((structure) => {
  const files = mappings[structure.mapping || 'partof']
    .filter((r) => r[0] === structure.fma)
    .map((r) => r[2])
    .filter((id) => !structure.excludeElements?.includes(id))
  if (!files.length) throw new Error(`Missing mapping: ${structure.fma}`)
  const positions: number[] = [],
    indices: number[] = []
  const sources = files.map((id) => {
    if (used.has(id)) throw new Error(`Duplicate ownership: ${id}`)
    used.add(id)
    const bytes = archive[`isa_BP3D_4.0_obj_99/${id}.obj`]
    if (!bytes) throw new Error(`Missing OBJ: ${id}`)
    const offset = positions.length / 3
    let vertexCount = 0,
      triangles = 0
    for (const line of strFromU8(bytes).split(/\r?\n/)) {
      const tokens = line.trim().split(/\s+/)
      if (tokens[0] === 'v') {
        const v = tokens.slice(1, 4).map(Number)
        if (v.length !== 3 || !v.every(Number.isFinite)) throw new Error(`Invalid vertex: ${id}`)
        v.forEach((p, i) => {
          min[i] = Math.min(min[i], p)
          max[i] = Math.max(max[i], p)
        })
        positions.push(...v)
        vertexCount++
      } else if (tokens[0] === 'f') {
        const face = tokens.slice(1).map((t) => {
          const i = Number(t.split('/')[0])
          return offset + (i > 0 ? i - 1 : vertexCount + i)
        })
        for (let i = 1; i < face.length - 1; i++) {
          indices.push(face[0], face[i], face[i + 1])
          triangles++
        }
      }
    }
    return {
      element: id,
      sha256: sha(bytes),
      bytes: bytes.length,
      vertices: vertexCount,
      triangles,
    }
  })
  return { structure, positions, indices, sources }
})
const center = min.map((v, i) => (v + max[i]) / 2)
const scale = 0.02 // millimeters to display units; uniform scale, no anatomical reshaping
for (const { structure, positions, indices } of prepared) {
  const transformed = new Float32Array(positions.length)
  for (let i = 0; i < positions.length; i += 3) {
    transformed[i] = (positions[i] - center[0]) * scale
    transformed[i + 1] = (positions[i + 2] - center[2]) * scale
    transformed[i + 2] = -(positions[i + 1] - center[1]) * scale
  }
  const geometry = new BufferGeometry()
    .setAttribute('position', new Float32BufferAttribute(transformed, 3))
    .setIndex(indices)
  geometry.computeVertexNormals()
  const color = new Color(structure.color)
  const material = doc
    .createMaterial(structure.id)
    .setBaseColorFactor([color.r, color.g, color.b, 1])
    .setRoughnessFactor(0.65)
    .setMetallicFactor(0)
    .setDoubleSided(true)
  const primitive = doc
    .createPrimitive()
    .setAttribute(
      'POSITION',
      doc.createAccessor().setType('VEC3').setArray(transformed).setBuffer(buffer),
    )
    .setAttribute(
      'NORMAL',
      doc
        .createAccessor()
        .setType('VEC3')
        .setArray(new Float32Array(geometry.getAttribute('normal').array))
        .setBuffer(buffer),
    )
    .setIndices(
      doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(indices)).setBuffer(buffer),
    )
    .setMaterial(material)
  const mesh = doc.createMesh(structure.id).addPrimitive(primitive)
  scene.addChild(
    doc
      .createNode(structure.id)
      .setMesh(mesh)
      .setExtras({ structureId: structure.id, fma: structure.fma }),
  )
  geometry.dispose()
}
const runtime = await new NodeIO().writeBinary(doc)
await Bun.write('public/models/brain.glb', runtime)
const manifest = {
  dataset: 'BodyParts3D',
  version: '4.0',
  variant: 'IS-A geometry archive, polygon reduction rate 99%; IS-A and PART-OF mappings',
  retrieved: '2026-09-25',
  license: 'CC-BY-4.0',
  licenseUrl: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html',
  credit: doc.getRoot().getAsset().copyright,
  inputs,
  transform: { sourceBoundsMm: { min, max }, centerMm: center, scale, axes: '[x, z, -y]' },
  runtime: { file: 'brain.glb', bytes: runtime.byteLength, sha256: sha(runtime) },
  structures: prepared.map(({ structure, sources }) => ({
    id: structure.id,
    fma: structure.fma,
    sourceName: structure.sourceName,
    mapping: structure.mapping || 'partof',
    sources,
  })),
}
await Bun.write('public/models/manifest.json', JSON.stringify(manifest, null, 2) + '\n')
await Bun.write(
  'docs/model-source/selected-mappings.tsv',
  'hierarchy\tconcept id\tname\telement file id\n' +
    structures
      .flatMap((s) =>
        mappings[s.mapping || 'partof']
          .filter((r) => r[0] === s.fma)
          .filter((r) => !s.excludeElements?.includes(r[2]))
          .map((r) => [s.mapping || 'partof', ...r].join('\t')),
      )
      .join('\n') +
    '\n',
)
console.log(
  `Prepared ${structures.length} groups, ${used.size} source meshes, ${runtime.byteLength} bytes. SHA-256 ${sha(runtime)}`,
)
