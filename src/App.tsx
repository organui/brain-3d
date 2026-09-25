import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Focus,
  Info,
  Layers,
  Minus,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import Viewer, { type ViewerHandle } from './Viewer'
import ViewMenu from './ViewMenu'
import { isolatedHidden, revealHidden, tourHidden } from './explorerState'
import {
  anatomySource,
  ventricleSource,
  byId,
  groups,
  leftSurfaceIds,
  structures,
  tour,
  type View,
} from './anatomy'

export default function App() {
  const [selected, setSelected] = useState<string | null>(null)
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [view, setView] = useState<View | 'Custom view'>('Anterior')
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const controls = useRef<ViewerHandle | null>(null)
  const about = useRef<HTMLDialogElement>(null)
  const anatomyPanel = useRef<HTMLElement>(null)
  const sidebarToggle = useRef<HTMLButtonElement>(null)
  const focusPanel = useRef(false)
  const structureList = useRef<HTMLDivElement>(null)
  const selectedRow = useRef<HTMLLIElement>(null)
  const current = selected ? byId[selected] : null
  const visibleCount = structures.length - hidden.size
  const matches = structures.filter((s) =>
    `${s.name} ${s.sourceName} ${s.fma} ${s.group}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  )
  useLayoutEffect(() => {
    const list = structureList.current,
      row = selectedRow.current
    if (!list || !row || list.scrollHeight <= list.clientHeight) return
    const bounds = list.getBoundingClientRect(),
      item = row.getBoundingClientRect()
    if (item.top < bounds.top) list.scrollTop += item.top - bounds.top
    else if (item.bottom > bounds.bottom) list.scrollTop += item.bottom - bounds.bottom
  }, [selected, query, step, sidebarOpen])

  useLayoutEffect(() => {
    if (!sidebarOpen || !focusPanel.current) return
    focusPanel.current = false
    anatomyPanel.current?.focus({ preventScroll: true })
    if (matchMedia('(max-width: 760px)').matches) {
      anatomyPanel.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [sidebarOpen])

  function openAnatomy() {
    if (sidebarOpen) {
      anatomyPanel.current?.focus()
      return
    }
    focusPanel.current = true
    setSidebarOpen(true)
  }

  function closeAnatomy() {
    setSidebarOpen(false)
    sidebarToggle.current?.focus()
  }

  function select(id: string) {
    setSelected(id)
    setAnnouncement(
      `${byId[id].name} selected${hidden.has(id) ? '. Currently hidden; use Show structure to reveal it.' : ''}.`,
    )
  }
  function restore() {
    setHidden(new Set())
    setAnnouncement(`All ${structures.length} structures restored.`)
  }
  function reset() {
    setSelected(null)
    setHidden(new Set())
    setQuery('')
    setStep(null)
    controls.current?.preset('Anterior')
    setView('Anterior')
    setAnnouncement('Explorer reset. All structures visible, anterior view.')
  }
  function preset(next: View) {
    controls.current?.preset(next)
    setView(next)
  }
  function toggle(id: string) {
    const next = new Set(hidden)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setHidden(next)
    setAnnouncement(`${byId[id].name} ${next.has(id) ? 'hidden' : 'shown'}.`)
  }
  function isolate(id: string) {
    setHidden(isolatedHidden(id))
    setAnnouncement(`${byId[id].name} isolated. Restore all to show surrounding anatomy.`)
  }
  function revealInside() {
    setHidden(revealHidden())
    setSelected('left-hippocampus')
    preset('Left lateral')
    setAnnouncement(
      'Left cerebral surface hidden to reveal deeper anatomy. This is not a cut surface.',
    )
  }
  function goToStep(index: number) {
    const next = tour[index]
    setStep(index)
    setQuery('')
    setSelected(next.id)
    setHidden(tourHidden(next))
    preset(next.view)
    setAnnouncement(
      `Tour step ${index + 1} of ${tour.length}: ${next.title}. ${byId[next.id].name} selected.`,
    )
  }
  function endTour() {
    setStep(null)
    setSelected(null)
    setHidden(new Set())
    preset('Anterior')
    setAnnouncement('Guided exploration ended. Overview restored in the anterior view.')
  }

  return (
    <>
      <a
        href="#anatomy"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault()
          openAnatomy()
        }}
      >
        Skip to anatomy text
      </a>
      <header className="site-header">
        <a className="brand" href="./" aria-label="OrganUI Brain home">
          <span className="brand-icon">
            <Activity size={21} strokeWidth={1.6} />
          </span>
          <span>
            Organ<span className="brand-light">UI</span>
          </span>
          <span className="brand-slash">/</span>
          <span className="brand-product">Brain</span>
        </a>
        <nav aria-label="Project">
          <button
            className="text-button about-button"
            aria-label="About this model"
            onClick={() => about.current?.showModal()}
          >
            <Info size={15} />
            <span>About this model</span>
          </button>
          <button
            ref={sidebarToggle}
            className="sidebar-toggle"
            aria-label={sidebarOpen ? 'Collapse anatomy sidebar' : 'Expand anatomy sidebar'}
            aria-expanded={sidebarOpen}
            aria-controls="anatomy"
            onClick={sidebarOpen ? closeAnatomy : openAnatomy}
          >
            {sidebarOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
            <span>Anatomy</span>
          </button>
        </nav>
      </header>

      <main className={`explorer ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <section className="stage" aria-labelledby="page-title">
          <h1 id="page-title" className="sr-only">
            Brain anatomy explorer
          </h1>
          <Viewer
            selected={selected}
            hidden={hidden}
            onSelect={(id) => {
              setQuery('')
              select(id)
            }}
            onReady={setReady}
            onFreeView={() => setView('Custom view')}
            controlsRef={controls}
          />
          <div className="scene-status">
            <span className={`status-dot ${ready ? '' : 'pending'}`} />
            {ready
              ? `${visibleCount} of ${structures.length} structures visible`
              : 'Anatomy text always available'}
            {hidden.size > 0 ? (
              <button onClick={restore}>Restore all</button>
            ) : (
              <button onClick={revealInside}>Reveal inside</button>
            )}
          </div>
          {current && (
            <div className="selection-chip">
              <span className="color-dot" style={{ background: current.color }} />
              <button className="selection-name" onClick={openAnatomy}>
                {current.name}
              </button>
              {hidden.has(current.id) ? <EyeOff size={13} /> : <Check size={13} />}
              <button aria-label="Clear selection" onClick={() => setSelected(null)}>
                <X size={14} />
              </button>
            </div>
          )}
          {hidden.size === structures.length && (
            <div className="empty-scene">
              <Layers size={24} />
              <p>All structures are hidden.</p>
              <button className="button" onClick={restore}>
                Restore all structures
              </button>
            </div>
          )}
          <div className="stage-bottom">
            <div className="camera-toolbar" aria-label="Camera controls">
              <ViewMenu view={view} disabled={!ready} onChange={preset} />
              <div className="camera-actions" role="group" aria-label="Zoom and reset">
                <button
                  className="icon-button"
                  aria-label="Zoom in"
                  title="Zoom in"
                  disabled={!ready}
                  onClick={() => controls.current?.zoom(0.85)}
                >
                  <Plus size={17} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Zoom out"
                  title="Zoom out"
                  disabled={!ready}
                  onClick={() => controls.current?.zoom(1.18)}
                >
                  <Minus size={17} />
                </button>
                <button
                  className="icon-button reset-button"
                  aria-label="Reset explorer"
                  title="Reset view, selection, and visibility"
                  onClick={reset}
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
            <p id="model-instructions" className="sr-only">
              Drag to rotate and scroll or pinch to zoom. Focus the model and use arrow keys to
              rotate, plus and minus to zoom. Select structures in the anatomy panel for the same
              information without using the 3D view.
            </p>
          </div>
        </section>

        <aside
          className="anatomy-panel"
          id="anatomy"
          hidden={!sidebarOpen}
          tabIndex={-1}
          ref={anatomyPanel}
          aria-label="Anatomy and exploration"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation()
              closeAnatomy()
            }
          }}
        >
          <div className="panel-heading">
            <div>
              <h2>Anatomy</h2>
              <span className="count-tag">{structures.length} structures</span>
            </div>
            <button
              className="icon-button"
              aria-label="Close anatomy sidebar"
              onClick={closeAnatomy}
            >
              <X size={18} />
            </button>
          </div>
          <div className="search-wrap">
            <Search size={16} />
            <input
              type="search"
              aria-label="Search structures"
              placeholder="Find a structure…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="structure-list" aria-label="Brain structures" ref={structureList}>
            {groups.map((group) => {
              const items = matches.filter((s) => s.group === group)
              if (!items.length) return null
              return (
                <section key={group} aria-label={group}>
                  <h3>{group}</h3>
                  <ul>
                    {items.map((s) => (
                      <li
                        key={s.id}
                        ref={selected === s.id ? selectedRow : undefined}
                        className={`${selected === s.id ? 'selected' : ''} ${hidden.has(s.id) ? 'is-hidden' : ''}`}
                        style={{ '--structure-color': s.color } as CSSProperties}
                      >
                        <button
                          className="structure-select"
                          aria-label={`Select ${s.name}`}
                          aria-pressed={selected === s.id}
                          onClick={() => select(s.id)}
                        >
                          <span className="color-dot" />
                          <span>
                            {s.name}
                            {hidden.has(s.id) && <small>Hidden</small>}
                          </span>
                          {selected === s.id ? <ChevronRight size={15} /> : null}
                        </button>
                        <button
                          className="visibility-button"
                          aria-label={`${hidden.has(s.id) ? 'Show' : 'Hide'} ${s.name}`}
                          aria-pressed={!hidden.has(s.id)}
                          onClick={() => toggle(s.id)}
                          title={`${hidden.has(s.id) ? 'Show' : 'Hide'} structure`}
                        >
                          {hidden.has(s.id) ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
            {!matches.length && (
              <div className="no-results">
                <Search size={23} />
                <h3>No matching structures</h3>
                <p>Try “frontal”, “ventricle”, or an FMA identifier.</p>
                <button className="text-button" onClick={() => setQuery('')}>
                  Clear search
                </button>
              </div>
            )}
          </div>

          <section
            className={`detail-card ${current ? 'has-selection' : ''}`}
            aria-label="Structure details"
          >
            {current ? (
              <>
                <div className="detail-eyebrow">
                  <span className="eyebrow">{current.group.toUpperCase()}</span>
                  <span>{current.fma}</span>
                </div>
                <h2>{current.name}</h2>
                <p>{current.description}</p>
                {current.group === 'Ventricular spaces' && (
                  <p className="cavity-note">
                    {hidden.has(current.id)
                      ? 'This cavity-space surface is hidden. Show it to restore the source geometry.'
                      : leftSurfaceIds.some((id) => hidden.has(id))
                        ? 'Internal space visible. It represents cavity geometry, not tissue or imaging data.'
                        : 'Inside the cerebral tissue. Reveal inside or isolate it to inspect the surface.'}
                  </p>
                )}
                <div className="detail-actions">
                  <button className="button primary" onClick={() => isolate(current.id)}>
                    <Focus size={15} />
                    Isolate
                  </button>
                  <button className="button" onClick={() => toggle(current.id)}>
                    {hidden.has(current.id) ? <Eye size={15} /> : <EyeOff size={15} />}
                    {hidden.has(current.id) ? 'Show structure' : 'Hide'}
                  </button>
                  {hidden.size > 0 && (
                    <button className="text-button restore-detail" onClick={restore}>
                      Restore all
                    </button>
                  )}
                </div>
                <button className="text-button mobile-return" onClick={closeAnatomy}>
                  View in 3D <ArrowUpRight size={14} />
                </button>
                <details className="model-note">
                  <summary>Model notes & reference</summary>
                  <p>{current.note}</p>
                  <p>
                    Source label: {current.sourceName} ({current.fma}).
                  </p>
                  <a
                    href={current.group === 'Ventricular spaces' ? ventricleSource : anatomySource}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Anatomy reference ·{' '}
                    {current.group === 'Ventricular spaces' ? 'OpenStax' : 'NINDS'}{' '}
                    <ArrowUpRight size={12} />
                  </a>
                </details>
              </>
            ) : (
              <>
                <h2>Select a structure</h2>
                <p>Choose a part of the brain or a name above to explore its anatomy.</p>
                <span className="small-note">
                  Colors distinguish structures; they are illustrative.
                </span>
              </>
            )}
          </section>

          <section
            className={`tour-card ${step !== null ? 'tour-active' : ''}`}
            aria-label="Guided exploration"
          >
            {step === null ? (
              <>
                <div className="tour-icon">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3>Guided exploration</h3>
                  <p>5 stops · At your own pace</p>
                </div>
                <button
                  aria-label="Start guided exploration"
                  className="tour-start"
                  disabled={!ready}
                  onClick={() => goToStep(0)}
                >
                  <ArrowRight size={19} />
                </button>
              </>
            ) : (
              <>
                <div className="tour-top">
                  <span className="eyebrow">
                    GUIDED EXPLORATION · {step + 1} / {tour.length}
                  </span>
                  <button
                    className="icon-button"
                    aria-label="End guided exploration"
                    onClick={endTour}
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="tour-progress">
                  {tour.map((_, i) => (
                    <span className={i <= step ? 'complete' : ''} key={i} />
                  ))}
                </div>
                <h3>{tour[step].title}</h3>
                <p>{tour[step].text}</p>
                <div className="tour-controls">
                  <button
                    className="text-button"
                    disabled={step === 0}
                    onClick={() => goToStep(step - 1)}
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                  <button
                    className="text-button"
                    onClick={() => (step === tour.length - 1 ? endTour() : goToStep(step + 1))}
                  >
                    {step === tour.length - 1 ? 'Finish tour' : 'Next stop'}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
          </section>
          <p className="review-note">
            <span className="status-dot" />
            Educational demo · Content awaiting expert review
          </p>
        </aside>
      </main>

      <footer className="site-footer">
        <span>Educational model</span>
        <span>
          Model:{' '}
          <a
            href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html"
            target="_blank"
            rel="noreferrer"
          >
            BodyParts3D / DBCLS · CC BY 4.0 <ArrowUpRight size={11} />
          </a>
        </span>
      </footer>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <dialog
        ref={about}
        aria-labelledby="model-about-title"
        className="about-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) about.current?.close()
        }}
      >
        <div className="dialog-top">
          <span className="eyebrow">BEHIND THE MODEL</span>
          <button
            className="icon-button"
            aria-label="Close about dialog"
            onClick={() => about.current?.close()}
            autoFocus
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="model-about-title">
          Real anatomy.
          <br />
          An open starting point.
        </h2>
        <p>
          OrganUI Brain is an educational interface demonstration built from a curated selection of
          the BodyParts3D 4.0 archive.
        </p>
        <h3>What you’re looking at</h3>
        <p>
          Nineteen selectable groups: bilateral cerebral lobes and hippocampi, the cerebellum, three
          brainstem regions, and five ventricular-space surfaces. Compound whole-brain, hemisphere,
          and brainstem representations are omitted to prevent duplicate geometry. Cavity surfaces
          represent space, not tissue. Colors are illustrative.
        </p>
        <h3>Review status</h3>
        <p>
          Labels have been checked against the archive’s structure mappings. Descriptions are
          concise summaries of{' '}
          <a href={anatomySource} target="_blank" rel="noreferrer">
            NINDS’s introductory brain reference
          </a>
          . The selection, labels, and presentation have not been reviewed by a clinical anatomy
          expert. This is not a diagnostic tool or a physiological simulation.
        </p>
        <h3>Model credit & license</h3>
        <p>
          BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0
          International.
        </p>
        <p>
          Adapted by OrganUI: selected and grouped meshes, transformed coordinates, recomputed
          normals, assigned colors, and converted to GLB. Model data:{' '}
          <a
            href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html"
            target="_blank"
            rel="noreferrer"
          >
            CC BY 4.0
          </a>
          . Original application code: MIT.
        </p>
        <p className="small-note">
          The current archive license (updated February 2025) is used. Legacy OBJ comments cite CC
          BY-SA 2.1 Japan; this discrepancy is recorded in the repository.
        </p>
        <a
          className="button primary"
          href="https://github.com/organui/brain-3d"
          target="_blank"
          rel="noreferrer"
        >
          Explore the source <ArrowUpRight size={15} />
        </a>
      </dialog>
    </>
  )
}
