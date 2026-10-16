// Browser interaction check for the anatomy panel (registry anatomy tree).
// Usage: PLAYWRIGHT_MODULE=/path/to/playwright node scripts/browser-check.cjs <port> <screenshot-dir>
// Requires a running dev server on 127.0.0.1:<port> and a Chromium for Playwright.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('assert')
const [port, shots] = process.argv.slice(2)
const url = `http://127.0.0.1:${port}/`
const log = (...a) => console.log('✔', ...a)
;(async () => {
  const browser = await chromium.launch({
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
  })
  const errors = []
  async function open(vp) {
    const page = await browser.newPage({ viewport: vp })
    page.on(
      'console',
      (m) => m.type() === 'error' && errors.push(`${vp.width} console: ${m.text()}`),
    )
    page.on('pageerror', (e) => errors.push(`${vp.width} pageerror: ${e.message}`))
    await page.goto(url)
    await page.waitForSelector('text=/19 of 19 structures visible/', { timeout: 60000 })
    await page.waitForTimeout(1200)
    return page
  }
  const status = (p) => p.locator('.scene-status').innerText()
  const viewLabel = (p) => p.locator('.view-trigger').getAttribute('aria-label')
  const row = (p, name) => p.getByRole('treeitem', { name, exact: true })
  const active = (p) =>
    p.evaluate(() => {
      const a = document.activeElement
      return a ? a.id || a.className || a.tagName : null
    })

  // ---------- desktop ----------
  let page = await open({ width: 1440, height: 900 })
  assert.equal(await page.locator('#anatomy').isHidden(), true)
  log('panel closed by default')
  await page.getByRole('button', { name: 'Expand anatomy sidebar' }).click()
  await page.waitForTimeout(200)
  assert.equal(await active(page), 'anatomy')
  log('focus moves into panel on open')
  assert.equal(await page.getByRole('treeitem').count(), 23)
  log('tree shows 4 groups + 19 leaves expanded')

  // search
  const search = page.getByLabel('Search brain structures')
  await search.fill('hippo')
  await page.waitForTimeout(200)
  const names = await page
    .getByRole('treeitem')
    .evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
  assert.deepEqual(names, ['Deep structures', 'Left hippocampus', 'Right hippocampus'])
  log('search filters with ancestors', names.join(' | '))

  // select leaf in tree
  await row(page, 'Left hippocampus')
    .getByRole('button', { name: 'Left hippocampus', exact: true })
    .click()
  await page.waitForTimeout(300)
  assert.equal(await row(page, 'Left hippocampus').getAttribute('aria-selected'), 'true')
  assert.equal(
    await page.locator('.selection-chip .selection-name').innerText(),
    'Left hippocampus',
  )
  assert.equal(await page.locator('.detail-card h2').innerText(), 'Left hippocampus')
  assert.equal(await viewLabel(page), 'Camera view: Anterior')
  log('tree selection drives chip, details; view label unchanged')

  // group label click does not select
  await search.fill('')
  await page.waitForTimeout(200)
  await row(page, 'Cerebral lobes')
    .getByRole('button', { name: 'Cerebral lobes', exact: true })
    .click()
  await page.waitForTimeout(200)
  assert.equal(await page.locator('.detail-card h2').innerText(), 'Left hippocampus')
  assert.equal(await row(page, 'Cerebral lobes').getAttribute('aria-selected'), 'false')
  log('group label click keeps leaf selection')

  // hide/show leaf -> mixed group
  await row(page, 'Pons').getByRole('button', { name: 'Visible: hide Pons' }).click()
  await page.waitForTimeout(200)
  assert.match(await status(page), /18 of 19/)
  assert.equal(await row(page, 'Pons').getAttribute('aria-checked'), 'false')
  assert.equal(await row(page, 'Brainstem & cerebellum').getAttribute('aria-checked'), 'mixed')
  log('leaf hide -> 18/19, group mixed')
  await page.screenshot({ path: `${shots}/v-mixed.png` })
  await row(page, 'Brainstem & cerebellum')
    .getByRole('button', { name: 'Mixed: show Brainstem & cerebellum' })
    .click()
  await page.waitForTimeout(200)
  assert.match(await status(page), /19 of 19/)
  log('mixed group click shows all its leaves')
  await row(page, 'Ventricular spaces')
    .getByRole('button', { name: 'Visible: hide Ventricular spaces' })
    .click()
  await page.waitForTimeout(200)
  assert.match(await status(page), /14 of 19/)
  assert.equal(await row(page, 'Ventricular spaces').getAttribute('aria-checked'), 'false')
  log('group hide -> 14/19')
  // details hide button syncs tree
  await page.locator('.detail-actions').getByRole('button', { name: 'Hide' }).click()
  await page.waitForTimeout(200)
  assert.equal(await row(page, 'Left hippocampus').getAttribute('aria-checked'), 'false')
  assert.equal(await row(page, 'Deep structures').getAttribute('aria-checked'), 'mixed')
  log('details Hide syncs tree')
  // isolate
  await page.locator('.detail-actions').getByRole('button', { name: 'Isolate' }).click()
  await page.waitForTimeout(200)
  assert.match(await status(page), /1 of 19/)
  assert.equal(await page.locator('[role=treeitem][aria-checked=true]').count(), 1)
  log('isolate syncs tree (1 visible)')
  // restore all
  await page.locator('.scene-status').getByRole('button', { name: 'Restore all' }).click()
  await page.waitForTimeout(200)
  assert.match(await status(page), /19 of 19/)
  assert.equal(await page.locator('[role=treeitem][aria-checked=true]').count(), 23)
  log('restore all -> every row visible')

  // reset clears search + expansion
  await search.fill('lobe')
  await page.waitForTimeout(150)
  await search.fill('')
  await page.waitForTimeout(150)
  await row(page, 'Cerebral lobes').getByRole('button', { name: 'Collapse Cerebral lobes' }).click()
  await search.fill('pons')
  await page.waitForTimeout(150)
  await page.getByRole('button', { name: 'Reset explorer' }).click()
  await page.waitForTimeout(400)
  assert.equal(await page.getByLabel('Search brain structures').inputValue(), '')
  assert.equal(await page.getByRole('treeitem').count(), 23)
  assert.equal(await page.locator('.selection-chip').count(), 0)
  assert.equal(await viewLabel(page), 'Camera view: Anterior')
  log('reset clears selection, tree search and collapsed groups')

  // keyboard: arrows, Enter, Space, Home/End
  await row(page, 'Pons').focus()
  await page.keyboard.press('ArrowDown')
  assert.equal(
    await page.evaluate(() => document.activeElement.getAttribute('aria-label')),
    'Medulla oblongata',
  )
  await page.keyboard.press('Enter')
  await page.waitForTimeout(150)
  assert.equal(await page.locator('.detail-card h2').innerText(), 'Medulla oblongata')
  await page.keyboard.press(' ')
  await page.waitForTimeout(150)
  assert.match(await status(page), /18 of 19/)
  await page.keyboard.press(' ')
  await page.keyboard.press('Home')
  assert.equal(
    await page.evaluate(() => document.activeElement.getAttribute('aria-label')),
    'Cerebral lobes',
  )
  await page.keyboard.press('Enter')
  await page.waitForTimeout(150)
  assert.equal(await page.locator('.detail-card h2').innerText(), 'Medulla oblongata')
  await page.keyboard.press('ArrowLeft')
  assert.equal(await page.getByRole('treeitem').count(), 15)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('End')
  assert.equal(
    await page.evaluate(() => document.activeElement.getAttribute('aria-label')),
    'Fourth ventricle',
  )
  assert.match(await status(page), /19 of 19/)
  log(
    'keyboard: arrows/Home/End move, Enter selects leaf (ignored on group), Space toggles, Left/Right collapse/expand',
  )
  await page.getByRole('button', { name: 'Clear selection' }).click()

  // escape focus return
  await row(page, 'Pons').focus()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  assert.equal(await page.locator('#anatomy').isHidden(), true)
  assert.equal(
    await page.evaluate(() => document.activeElement.classList.contains('sidebar-toggle')),
    true,
  )
  log('Escape closes panel and returns focus to toggle')

  // 3D click -> tree selection; chip name opens panel
  const box = await page.locator('.canvas-wrap canvas').boundingBox()
  const pt = { x: box.x + box.width / 2 - 60, y: box.y + box.height * 0.36 }
  await page.mouse.click(pt.x, pt.y)
  await page.waitForTimeout(400)
  const picked = await page.locator('.selection-chip .selection-name').innerText()
  assert.equal(await viewLabel(page), 'Camera view: Anterior')
  log('3D click selected', picked, '(view label stays Anterior)')
  await page.screenshot({ path: `${shots}/v-3d-pick.png` })
  await page.locator('.selection-chip .selection-name').click()
  await page.waitForTimeout(300)
  assert.equal(await page.locator('#anatomy').isHidden(), false)
  assert.equal(await active(page), 'anatomy')
  assert.equal(await row(page, picked).getAttribute('aria-selected'), 'true')
  const inView = await page.evaluate(() => {
    const t = document.querySelector('[role=tree]').getBoundingClientRect()
    const r = document.querySelector('[role=treeitem][aria-selected=true]').getBoundingClientRect()
    return r.top >= t.top - 1 && r.bottom <= t.bottom + 1
  })
  assert.ok(inView)
  log('chip name opens panel; tree row selected and in view')

  // hidden structure not pickable: hide picked, click same point
  await row(page, picked)
    .getByRole('button', { name: `Visible: hide ${picked}` })
    .click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'Clear selection' }).click()
  await page.mouse.click(pt.x, pt.y)
  await page.waitForTimeout(400)
  const second = (await page.locator('.selection-chip .selection-name').count())
    ? await page.locator('.selection-chip .selection-name').innerText()
    : '(nothing)'
  assert.notEqual(second, picked)
  log('after hiding', picked, 'the same click picks', second)
  await page.getByRole('button', { name: 'Reset explorer' }).click()
  await page.waitForTimeout(300)

  // screenshot: anatomy panel, search, selection, superior view
  await page.getByRole('button', { name: 'Camera view: Anterior' }).click()
  await page.getByRole('menuitemradio', { name: /Superior/ }).click()
  await page.waitForTimeout(1500)
  if (await page.locator('#anatomy').isHidden())
    await page.getByRole('button', { name: 'Expand anatomy sidebar' }).click()
  await page.getByLabel('Search brain structures').fill('frontal')
  await page.waitForTimeout(200)
  await row(page, 'Left frontal lobe')
    .getByRole('button', { name: 'Left frontal lobe', exact: true })
    .click()
  await page.mouse.move(5, 5)
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${shots}/anatomy.png` })

  // reveal + guided reveal
  await page.getByRole('button', { name: 'Reset explorer' }).click()
  await page.waitForTimeout(300)
  await page.locator('.scene-status').getByRole('button', { name: 'Reveal inside' }).click()
  await page.waitForTimeout(1500)
  assert.match(await status(page), /15 of 19/)
  assert.equal(await row(page, 'Cerebral lobes').getAttribute('aria-checked'), 'mixed')
  assert.equal(await row(page, 'Left hippocampus').getAttribute('aria-selected'), 'true')
  const revealInView = await page.evaluate(() => {
    const t = document.querySelector('[role=tree]').getBoundingClientRect()
    const r = document.querySelector('[role=treeitem][aria-selected=true]').getBoundingClientRect()
    return r.top >= t.top - 1 && r.bottom <= t.bottom + 1
  })
  assert.ok(revealInView)
  log('reveal inside: 15/19, lobes mixed, hippocampus row selected and scrolled into view')
  await page.mouse.move(5, 5)
  await page.screenshot({ path: `${shots}/reveal.png` })
  await page.getByRole('button', { name: 'Reset explorer' }).click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: /Start guided/ }).click()
  await page.getByRole('button', { name: 'Next stop' }).click()
  await page.getByRole('button', { name: 'Next stop' }).click()
  await page.waitForTimeout(1500)
  assert.equal(await row(page, 'Left hippocampus').getAttribute('aria-selected'), 'true')
  await page.mouse.move(5, 5)
  await page.screenshot({ path: `${shots}/guided-reveal.png` })
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Next stop' }).click()
  await page.getByRole('button', { name: 'Finish tour' }).click()
  await page.waitForTimeout(500)
  assert.match(await status(page), /19 of 19/)
  assert.equal(await viewLabel(page), 'Camera view: Anterior')
  log('guided tour steps sync tree; finish restores 19/19 anterior')
  await page.close()

  // ---------- mobile ----------
  page = await open({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Expand anatomy sidebar' }).click()
  await page.waitForTimeout(300)
  assert.equal(await active(page), 'anatomy')
  await page.getByLabel('Search brain structures').fill('cere')
  await page.waitForTimeout(200)
  await row(page, 'Cerebellum').getByRole('button', { name: 'Cerebellum', exact: true }).click()
  await page.waitForTimeout(300)
  assert.equal(await page.locator('.detail-card h2').innerText(), 'Cerebellum')
  await row(page, 'Cerebellum').getByRole('button', { name: 'Visible: hide Cerebellum' }).click()
  await page.waitForTimeout(200)
  assert.equal(await row(page, 'Brainstem & cerebellum').getAttribute('aria-checked'), 'mixed')
  await row(page, 'Cerebellum').getByRole('button', { name: 'Hidden: show Cerebellum' }).click()
  const overflow = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    document.documentElement.clientWidth,
  ])
  assert.equal(overflow[0], overflow[1])
  log('mobile: search/select/hide/show ok, no horizontal overflow', overflow.join('='))
  await page.locator('#anatomy').evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await page.mouse.move(5, 5)
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${shots}/mobile-anatomy.png` })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  assert.equal(
    await page.evaluate(() => document.activeElement.classList.contains('sidebar-toggle')),
    true,
  )
  log('mobile Escape returns focus')
  await page.close()

  await browser.close()
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No console/page errors')
})().catch((e) => {
  console.error('FAIL', e.message)
  process.exit(1)
})
