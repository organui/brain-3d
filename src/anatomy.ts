export type Structure = {
  id: string
  fma: string
  name: string
  sourceName: string
  group: 'Cerebral lobes' | 'Deep structures' | 'Brainstem & cerebellum' | 'Ventricular spaces'
  side?: 'Left' | 'Right' | 'Midline'
  mapping?: 'isa'
  excludeElements?: string[]
  color: string
  description: string
  note: string
}

export const anatomySource =
  'https://www.ninds.nih.gov/sites/default/files/2025-05/know-your-brain-brian-basics.pdf'
export const ventricleSource =
  'https://openstax.org/books/anatomy-and-physiology-2e/pages/13-3-circulation-and-the-central-nervous-system'

const lobe = (
  id: string,
  fma: string,
  side: 'Left' | 'Right',
  region: 'Frontal' | 'Parietal' | 'Temporal' | 'Occipital',
  color: string,
): Structure => ({
  id,
  fma,
  side,
  name: `${side} ${region.toLowerCase()} lobe`,
  sourceName: `${side.toLowerCase()} ${region.toLowerCase()} lobe`,
  group: 'Cerebral lobes',
  color,
  description:
    region === 'Frontal'
      ? 'The front portion of a cerebral hemisphere; it includes cortical regions involved in planning and voluntary movement.'
      : region === 'Parietal'
        ? 'A superior-posterior part of a cerebral hemisphere that participates in integrating bodily sensory information.'
        : region === 'Temporal'
          ? 'A lower lateral part of a cerebral hemisphere that includes regions involved in hearing and memory.'
          : 'The posterior part of a cerebral hemisphere and the principal cortical region for visual processing.',
  note: 'The lobe boundary follows the BodyParts3D source grouping. Colors separate neighboring source meshes and do not encode function.',
})

export const structures: Structure[] = [
  lobe('left-frontal', 'FMA72970', 'Left', 'Frontal', '#c98e83'),
  lobe('right-frontal', 'FMA72969', 'Right', 'Frontal', '#d9a096'),
  lobe('left-parietal', 'FMA72974', 'Left', 'Parietal', '#c7a577'),
  lobe('right-parietal', 'FMA72973', 'Right', 'Parietal', '#d6b486'),
  lobe('left-temporal', 'FMA72972', 'Left', 'Temporal', '#aa847d'),
  lobe('right-temporal', 'FMA72971', 'Right', 'Temporal', '#ba948c'),
  lobe('left-occipital', 'FMA72976', 'Left', 'Occipital', '#9b8d83'),
  lobe('right-occipital', 'FMA72975', 'Right', 'Occipital', '#aa9c91'),
  {
    id: 'left-hippocampus',
    fma: 'FMA72714',
    side: 'Left',
    name: 'Left hippocampus',
    sourceName: 'left hippocampus',
    group: 'Deep structures',
    color: '#d8ad67',
    description:
      'A curved deep structure of the temporal region involved in forming and organizing memories.',
    note: 'Normally hidden by cerebral tissue. Use Reveal inside or isolate it to inspect its source mesh.',
  },
  {
    id: 'right-hippocampus',
    fma: 'FMA72713',
    side: 'Right',
    name: 'Right hippocampus',
    sourceName: 'right hippocampus',
    group: 'Deep structures',
    color: '#e4bd7c',
    description:
      'A curved deep structure of the temporal region involved in forming and organizing memories.',
    note: 'Normally hidden by cerebral tissue. Use Reveal inside or isolate it to inspect its source mesh.',
  },
  {
    id: 'midbrain',
    fma: 'FMA61993',
    side: 'Midline',
    name: 'Midbrain',
    sourceName: 'midbrain',
    group: 'Brainstem & cerebellum',
    color: '#9a776d',
    description: 'The upper portion of the brainstem, between the forebrain and pons.',
    note: 'Six source elements are combined. The aqueduct element is assigned to the ventricular-space group to avoid duplicate geometry.',
    excludeElements: ['FJ1738'],
  },
  {
    id: 'pons',
    fma: 'FMA67943',
    side: 'Midline',
    name: 'Pons',
    sourceName: 'pons',
    group: 'Brainstem & cerebellum',
    color: '#b18779',
    description: 'The rounded middle portion of the brainstem, anterior to the cerebellum.',
    note: 'Two source elements are combined as one selectable structure.',
  },
  {
    id: 'medulla',
    fma: 'FMA62004',
    side: 'Midline',
    name: 'Medulla oblongata',
    sourceName: 'medulla oblongata',
    group: 'Brainstem & cerebellum',
    color: '#8b6d67',
    description: 'The lowest portion of the brainstem, continuous inferiorly with the spinal cord.',
    note: 'Two source elements are combined. The spinal cord is outside this release.',
  },
  {
    id: 'cerebellum',
    fma: 'FMA67944',
    side: 'Midline',
    name: 'Cerebellum',
    sourceName: 'cerebellum',
    group: 'Brainstem & cerebellum',
    color: '#b49b86',
    description:
      'A folded structure behind the brainstem that helps coordinate movement and balance.',
    note: 'The source supplies two elements, combined here as one selectable cerebellum.',
  },
  {
    id: 'left-lateral-ventricle',
    fma: 'FMA78450',
    side: 'Left',
    name: 'Left lateral ventricle',
    sourceName: 'left lateral ventricle',
    group: 'Ventricular spaces',
    color: '#6f9ca3',
    description:
      'One of the paired cavities deep in the cerebrum through which cerebrospinal fluid circulates.',
    note: 'Rendered as a solid surface representing cavity space, not neural tissue or fluid imaging.',
  },
  {
    id: 'right-lateral-ventricle',
    fma: 'FMA78449',
    side: 'Right',
    name: 'Right lateral ventricle',
    sourceName: 'right lateral ventricle',
    group: 'Ventricular spaces',
    color: '#79aab1',
    description:
      'One of the paired cavities deep in the cerebrum through which cerebrospinal fluid circulates.',
    note: 'Rendered as a solid surface representing cavity space, not neural tissue or fluid imaging.',
  },
  {
    id: 'third-ventricle',
    fma: 'FMA78454',
    side: 'Midline',
    name: 'Third ventricle',
    sourceName: 'third ventricle',
    group: 'Ventricular spaces',
    color: '#628e98',
    description:
      'A narrow midline cavity connected to the lateral ventricles and cerebral aqueduct.',
    note: 'Rendered as a cavity-space surface; connecting foramina are not separate selections.',
  },
  {
    id: 'cerebral-aqueduct',
    fma: 'FMA78467',
    side: 'Midline',
    name: 'Cerebral aqueduct',
    sourceName: 'cerebral aqueduct',
    group: 'Ventricular spaces',
    color: '#527e88',
    description: 'A narrow channel through the midbrain linking the third and fourth ventricles.',
    note: 'This source element also belongs to the compound midbrain mapping; ownership is assigned here to avoid duplicate geometry.',
  },
  {
    id: 'fourth-ventricle',
    fma: 'FMA78469',
    side: 'Midline',
    name: 'Fourth ventricle',
    sourceName: 'fourth ventricle',
    group: 'Ventricular spaces',
    color: '#719aa1',
    description:
      'A cavity between the brainstem and cerebellum that receives fluid from the cerebral aqueduct.',
    note: 'Rendered as a solid cavity-space surface, not a cut surface or medical scan.',
  },
]

export const groups = [
  'Cerebral lobes',
  'Deep structures',
  'Brainstem & cerebellum',
  'Ventricular spaces',
] as const
export const byId = Object.fromEntries(structures.map((s) => [s.id, s])) as Record<
  string,
  Structure
>
export const leftSurfaceIds = structures
  .filter((s) => s.group === 'Cerebral lobes' && s.side === 'Left')
  .map((s) => s.id)

export type View =
  'Anterior' | 'Posterior' | 'Left lateral' | 'Right lateral' | 'Superior' | 'Inferior'

export const tour: {
  id: string
  title: string
  text: string
  view: View
  reveal?: boolean
  isolate?: boolean
}[] = [
  {
    id: 'left-frontal',
    title: 'Read the outer surface',
    text: 'Start at the left frontal lobe. The boundary and warm color follow a source grouping; color does not encode brain activity or one exclusive function.',
    view: 'Left lateral',
  },
  {
    id: 'left-temporal',
    title: 'Follow the lateral profile',
    text: 'The temporal lobe sits below the frontal and parietal lobes. Rotate to see how these folded regions meet.',
    view: 'Left lateral',
  },
  {
    id: 'left-hippocampus',
    title: 'Reveal a deeper structure',
    text: 'The left surface is hidden to expose the hippocampus in its original alignment. This is a visibility reveal, not a section or scan.',
    view: 'Left lateral',
    reveal: true,
  },
  {
    id: 'cerebellum',
    title: 'Look behind the brainstem',
    text: 'From the posterior view, the cerebellum occupies the lower rear of the model behind the brainstem.',
    view: 'Posterior',
  },
  {
    id: 'right-lateral-ventricle',
    title: 'Trace an internal space',
    text: 'Finish with an isolated lateral ventricle. The solid surface represents a cavity through which cerebrospinal fluid circulates—not tissue or MRI data.',
    view: 'Superior',
    isolate: true,
  },
]
