// Rendered coarse/fine hit-target checks. Jest does not load CSS, so this
// drives a built preview in headless Chrome. Local throwaway page only.
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome'
const PORT = 4173
const BASE = `http://127.0.0.1:${PORT}`
const MIN = 44
// getBoundingClientRect can report 43.999984 for a used size of 44.
// 0.01px covers that float noise. A control that is actually short of the
// target, such as 43.5, still fails.
const HIT_EPSILON = 0.01
function atLeastMin(px) {
  return typeof px === 'number' && px >= MIN - HIT_EPSILON
}
const FIT_WARNING = "Too much text to fit. It's as small as it can be. Shorten it so nothing gets cut off."

const results = []
function check(name, ok, detail) {
  results.push({ name, ok, detail: ok ? undefined : detail })
  if (ok) console.log(`ok  ${name}`)
  else console.error(`FAIL ${name}`, detail ?? '')
}

async function waitForPreview() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(BASE)
      if (res.status < 500) return
    } catch {
      // preview still booting
    }
    await delay(250)
  }
  throw new Error('vite preview did not accept connections')
}

async function openPage(browser, { width, height, coarse, path = '/' }) {
  const page = await browser.newPage()
  page.setDefaultTimeout(30000)
  const client = await page.createCDPSession()
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 1024,
  })
  await client.send('Emulation.setTouchEmulationEnabled', {
    enabled: !!coarse,
    maxTouchPoints: 1,
  })
  await client.send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'pointer', value: coarse ? 'coarse' : 'fine' },
      { name: 'hover', value: coarse ? 'none' : 'hover' },
    ],
  })
  await page.evaluateOnNewDocument(() => {
    const stub = {
      register: () => Promise.resolve({ scope: '/' }),
      getRegistrations: () => Promise.resolve([]),
      ready: Promise.resolve({ unregister: () => Promise.resolve(true) }),
      addEventListener() {},
      removeEventListener() {},
    }
    try {
      Object.defineProperty(navigator, 'serviceWorker', { configurable: true, get: () => stub })
    } catch {
      // already defined
    }
  })
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForSelector('button[aria-label="Undo"]', { timeout: 30000 })
  await page.evaluate(() => document.fonts?.ready)
  return page
}

function overlaps(a, b) {
  return a.right > b.left + 0.5 && a.left < b.right - 0.5 && a.bottom > b.top + 0.5 && a.top < b.bottom - 0.5
}

async function readChrome(page) {
  return page.evaluate(() => {
    const rect = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }
    }
    const undo = document.querySelector('button[aria-label="Undo"]')
    const redo = document.querySelector('button[aria-label="Redo"]')
    const menu = document.querySelector('button[aria-label="Menu"]')
    const header = document.querySelector('header')
    const doc = document.documentElement
    const auto = [...document.querySelectorAll('label')].find((l) => l.textContent.includes('Auto-update'))
    return {
      coarse: window.matchMedia('(pointer: coarse)').matches,
      fine: window.matchMedia('(pointer: fine)').matches,
      undo: rect(undo),
      undoDisabled: undo?.disabled ?? null,
      redo: rect(redo),
      redoDisabled: redo?.disabled ?? null,
      glyphH: undo?.querySelector('span')?.getBoundingClientRect().height ?? null,
      menu: rect(menu),
      svg: rect(menu?.querySelector('svg')),
      headerH: header?.getBoundingClientRect().height ?? null,
      brand: rect(header?.querySelector('h1')?.parentElement),
      overflow: doc.scrollWidth - doc.clientWidth,
      dock: !!document.querySelector('.dock'),
      autoH: auto?.getBoundingClientRect().height ?? null,
      toggleH: auto?.querySelector('input')?.getBoundingClientRect().height ?? null,
      viewH: [...document.querySelectorAll('button')].find((b) => b.title === 'Reader mode')?.getBoundingClientRect().height ?? null,
    }
  })
}

async function clickControl(page, text) {
  const clicked = await page.evaluate((label) => {
    const els = [...document.querySelectorAll('button, [role="button"]')]
    const el = els.find((node) => node.textContent.replace(/\s+/g, ' ').includes(label))
    if (!el) return false
    el.click()
    return true
  }, text)
  if (!clicked) throw new Error(`control not found: ${text}`)
}

async function expandCollapse(page, title) {
  const opened = await page.evaluate((label) => {
    const titles = [...document.querySelectorAll('.collapse-title')]
    const node = titles.find((el) => el.textContent.includes(label))
    if (!node) return false
    const input = node.closest('.collapse')?.querySelector('input[type="checkbox"]')
    if (input && !input.checked) input.click()
    return true
  }, title)
  if (!opened) throw new Error(`collapse not found: ${title}`)
}

function assertHeader(tag, data, { coarse, mobile }) {
  // Headless Chrome reports pointer:none for a fine mouse. It never matches
  // (pointer: fine). Coarse emulation does match. Compact sizes below prove
  // the fine path did not pick up the coarse rules.
  check(`${tag} pointer coarse=${coarse}`, data.coarse === coarse, { coarse: data.coarse, fine: data.fine })
  check(`${tag} document does not overflow`, data.overflow === 0, data.overflow)
  if (coarse) {
    check(`${tag} undo box >= 44`, atLeastMin(data.undo.width) && atLeastMin(data.undo.height), data.undo)
    check(`${tag} redo box >= 44`, atLeastMin(data.redo.width) && atLeastMin(data.redo.height), data.redo)
    check(`${tag} undo glyph stays small`, data.glyphH != null && data.glyphH < 32, data.glyphH)
  }
  check(`${tag} undo/redo gap and no overlap`, data.redo.left - data.undo.right >= 1 && !overlaps(data.undo, data.redo), {
    gap: data.redo.left - data.undo.right,
  })
  if (mobile) {
    check(`${tag} menu present`, !!data.menu, data.menu)
    if (coarse) {
      check(`${tag} menu box >= 44`, atLeastMin(data.menu.width) && atLeastMin(data.menu.height), data.menu)
      check(`${tag} menu glyph stays ~20`, data.svg && data.svg.width <= 22 && data.svg.width >= 16 && data.svg.height <= 22, data.svg)
      check(`${tag} header stays compact`, data.headerH <= 58, data.headerH)
    } else {
      check(`${tag} undo stays compact`, data.undo.width <= 36 && data.undo.height <= 36, data.undo)
      check(`${tag} menu stays compact`, data.menu.width <= 40 && data.menu.height <= 40, data.menu)
    }
    check(`${tag} header clusters do not overlap`, data.brand.right <= data.undo.left - 1 && data.menu.left >= data.redo.right + 1, {
      brandGap: data.undo.left - data.brand.right,
      menuGap: data.menu.left - data.redo.right,
    })
  } else {
    check(`${tag} desktop has no dock`, data.dock === false, data.dock)
    if (coarse) {
      check(`${tag} auto-update row >= 44`, atLeastMin(data.autoH), data.autoH)
      check(`${tag} toggle glyph stays small`, data.toggleH != null && data.toggleH < 28, data.toggleH)
      check(`${tag} view control >= 44`, atLeastMin(data.viewH), data.viewH)
    } else {
      check(`${tag} undo stays btn-xs`, data.undo.width <= 28 && data.undo.height <= 28, data.undo)
      check(`${tag} view stays compact`, data.viewH != null && data.viewH <= 36, data.viewH)
      check(`${tag} auto-update stays compact`, data.autoH != null && data.autoH < MIN, data.autoH)
    }
  }
}

async function assertDisabledUndo(page, tag) {
  const before = await page.evaluate(() => ({
    undo: document.querySelector('button[aria-label="Undo"]').disabled,
    redo: document.querySelector('button[aria-label="Redo"]').disabled,
  }))
  check(`${tag} undo starts disabled`, before.undo === true && before.redo === true, before)
  await page.evaluate(() => document.querySelector('button[aria-label="Undo"]').click())
  const after = await page.evaluate(() => ({
    undo: document.querySelector('button[aria-label="Undo"]').disabled,
    redo: document.querySelector('button[aria-label="Redo"]').disabled,
  }))
  check(`${tag} disabled undo stays disabled`, after.undo === true && after.redo === true, after)
}

async function addRows(page) {
  await clickControl(page, 'Structure')
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Row Below')))
  for (let i = 0; i < 2; i++) {
    await clickControl(page, 'Row Below')
    await delay(50)
  }
  await page.waitForFunction(() => document.querySelector('button[aria-label="Undo"]').disabled === false)
}

async function assertEnabledUndo(page, tag) {
  const hit = await page.evaluate(() => {
    const el = document.querySelector('button[aria-label="Undo"]')
    const b = el.getBoundingClientRect()
    const node = document.elementFromPoint(b.left + 3, b.top + b.height / 2)
    return {
      disabled: el.disabled,
      label: node?.closest('button')?.getAttribute('aria-label') ?? null,
      width: b.width,
      height: b.height,
    }
  })
  check(`${tag} enabled undo padding hits the button`, hit.disabled === false && hit.label === 'Undo' && atLeastMin(hit.width) && atLeastMin(hit.height), hit)
}

async function assertHandle(page, tag) {
  const handle = await page.evaluate(() => {
    const el = document.querySelector('[data-sheet-handle]')
    if (!el) return null
    const r = el.getBoundingClientRect()
    const pill = el.querySelector('div')?.getBoundingClientRect()
    return { height: r.height, width: r.width, pillH: pill?.height ?? null, pillW: pill?.width ?? null }
  })
  check(`${tag} sheet handle >= 44`, !!handle && atLeastMin(handle.height) && atLeastMin(handle.width), handle)
  check(`${tag} handle pill stays thin`, !!handle && handle.pillH <= 8 && handle.pillH >= 2, handle)
}

async function closeSheet(page) {
  await clickControl(page, 'Structure')
  await page.waitForSelector('[data-minimap="bar"]')
}

async function assertMinimap(page, tag) {
  const mini = await page.evaluate(() => {
    const bar = document.querySelector('[data-minimap="bar"]')
    const cells = [...bar.querySelectorAll('[role="button"]')].map((el) => {
      const r = el.getBoundingClientRect()
      return { label: el.getAttribute('aria-label'), width: r.width, height: r.height }
    })
    return { clientH: bar.clientHeight, scrollH: bar.scrollHeight, cells }
  })
  check(`${tag} minimap has 4 cells`, mini.cells.length === 4, mini.cells.length)
  check(`${tag} minimap cells >= 44`, mini.cells.every((c) => atLeastMin(c.width) && atLeastMin(c.height)), mini.cells)
  check(`${tag} minimap cap stays short`, mini.clientH <= 96, mini.clientH)
  check(`${tag} minimap scrolls extra rows`, mini.scrollH > mini.clientH + 4, mini)
  const reached = await page.evaluate(() => {
    const bar = document.querySelector('[data-minimap="bar"]')
    bar.scrollTop = bar.scrollHeight
    const last = [...bar.querySelectorAll('[role="button"]')].at(-1)
    const br = bar.getBoundingClientRect()
    const lr = last.getBoundingClientRect()
    return lr.top >= br.top - 1 && lr.bottom <= br.bottom + 2
  })
  check(`${tag} minimap scroll reaches the last cell`, reached === true, reached)
}

async function assertCanvasGeometry(page, tag) {
  const geom = await page.evaluate(() => {
    const wrap = document.querySelector('main .relative')
    const canvasH = wrap?.getBoundingClientRect().height ?? 0
    const cells = [...document.querySelectorAll('[aria-label^="Select cell"]')].map((el) => el.getBoundingClientRect().height)
    const sum = cells.reduce((total, h) => total + h, 0)
    return { canvasH, cells, sum }
  })
  check(`${tag} canvas overlays follow the grid`, geom.cells.length === 4 && Math.abs(geom.sum - geom.canvasH) < 8, geom)
}

async function assertSheetScroll(page, tag) {
  await clickControl(page, 'Structure')
  await page.waitForSelector('[aria-label="Tab controls"] .overflow-y-auto')
  await page.evaluate(() => {
    document.querySelectorAll('[aria-label="Tab controls"] .collapse > input[type="checkbox"]').forEach((input) => {
      if (!input.checked) input.click()
    })
  })
  await delay(100)
  const scrolled = await page.evaluate((minPx) => {
    const scroller = document.querySelector('[aria-label="Tab controls"] .overflow-y-auto')
    const before = scroller.scrollHeight > scroller.clientHeight + 4
    scroller.scrollTop = scroller.scrollHeight
    const buttons = [...scroller.querySelectorAll('button')].filter((el) => {
      const r = el.getBoundingClientRect()
      return r.width >= minPx && r.height >= minPx
    })
    const view = scroller.getBoundingClientRect()
    const visible = buttons.some((el) => {
      const r = el.getBoundingClientRect()
      return r.top >= view.top - 1 && r.bottom <= view.bottom + 2 && r.top > view.top + 20
    })
    return { before, visible, sh: scroller.scrollHeight, ch: scroller.clientHeight, n: buttons.length }
  }, MIN - HIT_EPSILON)
  check(`${tag} sheet content scrolls`, scrolled.before === true, scrolled)
  check(`${tag} scrolled sheet control is >= 44`, scrolled.visible === true, scrolled)
}

async function assertDownloadAndCheckbox(page, tag) {
  await clickControl(page, 'Export')
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Download')))
  const download = await page.evaluate(() => {
    const el = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Download'))
    const r = el.getBoundingClientRect()
    return { width: r.width, height: r.height }
  })
  check(`${tag} download >= 44 tall`, atLeastMin(download.height) && atLeastMin(download.width), download)

  await clickControl(page, 'Style')
  await page.waitForFunction(() => [...document.querySelectorAll('.collapse-title')].some((el) => el.textContent.includes('Background')))
  await expandCollapse(page, 'Background')
  await page.waitForFunction(() => [...document.querySelectorAll('label')].some((l) => l.textContent.includes('Override theme color')))
  const box = await page.evaluate(() => {
    const label = [...document.querySelectorAll('label')].find((l) => l.textContent.includes('Override theme color'))
    const input = label.querySelector('input')
    const lr = label.getBoundingClientRect()
    const ir = input.getBoundingClientRect()
    const before = input.checked
    label.querySelector('span').click()
    return { height: lr.height, width: lr.width, inputH: ir.height, before, after: input.checked }
  })
  check(`${tag} checkbox row >= 44`, atLeastMin(box.height) && atLeastMin(box.width), box)
  check(`${tag} checkbox glyph stays small`, box.inputH < 30 && box.inputH > 8, box.inputH)
  check(`${tag} checkbox label toggles`, box.after !== box.before, box)
  const discs = await page.evaluate(() => {
    return [...document.querySelectorAll('button[aria-label="Off Black"], button[aria-label="White"]')].map((el) => {
      const button = el.getBoundingClientRect()
      const disc = el.querySelector('span')?.getBoundingClientRect()
      return { bw: button.width, bh: button.height, dw: disc?.width ?? 0, dh: disc?.height ?? 0 }
    })
  })
  check(`${tag} color discs keep their paint size`, discs.length >= 2 && discs.every((d) => atLeastMin(d.bw) && atLeastMin(d.bh) && d.dw <= 24 && d.dh <= 24 && d.dw >= 16), discs)
}

async function assertReader(page, tag) {
  await clickControl(page, 'Structure')
  await page.waitForFunction(() => [...document.querySelectorAll('.collapse-title')].some((el) => el.textContent.includes('Pages')))
  await expandCollapse(page, 'Pages')
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Add Page')))
  for (let i = 0; i < 11; i++) await clickControl(page, 'Add Page')
  await page.evaluate(() => document.querySelector('button[aria-label="Menu"]').click())
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Reader Mode')))
  await clickControl(page, 'Reader Mode')
  await page.waitForSelector('button[aria-label="Back to Editor"]', { timeout: 10000 })
  const reader = await page.evaluate(() => {
    const doc = document.documentElement
    const dots = [...document.querySelectorAll('button[title^="Page "]')].map((el) => {
      const r = el.getBoundingClientRect()
      return { width: r.width, height: r.height }
    })
    const scroller = document.querySelector('main .overflow-x-auto')
    return {
      overflow: doc.scrollWidth - doc.clientWidth,
      dots,
      scrollW: scroller?.scrollWidth ?? 0,
      clientW: scroller?.clientWidth ?? 0,
    }
  })
  check(`${tag} reader page dots >= 44`, reader.dots.length >= 12 && reader.dots.every((d) => atLeastMin(d.width) && atLeastMin(d.height)), {
    n: reader.dots.length,
    sample: reader.dots[0],
  })
  check(`${tag} reader page row scrolls inside the page`, reader.scrollW > reader.clientW && reader.overflow === 0, reader)
}

async function readCellTitle(page) {
  return page.evaluate((warning) => {
    const frame = document.querySelector('[data-fit-frame="1"]')
    const title = frame?.querySelector('h1[data-fit-base]')
    const warnings = [...document.querySelectorAll('[role="status"]')].filter((el) => el.textContent.trim() === warning)
    const field = document.querySelector('textarea[placeholder="Enter title..."]')
    const describedId = field?.getAttribute('aria-describedby')
    const described = describedId ? document.getElementById(describedId) : null
    return {
      font: title ? parseFloat(getComputedStyle(title).fontSize) : null,
      base: title ? Number(title.getAttribute('data-fit-base')) : null,
      warningCount: warnings.length,
      described: described?.textContent.trim() ?? null,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  }, FIT_WARNING)
}

async function setTitle(page, value) {
  const wrote = await page.evaluate((next) => {
    const el = document.querySelector('textarea[placeholder="Enter title..."]')
    if (!el) return false
    const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')
    desc.set.call(el, next)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  }, value)
  if (!wrote) throw new Error('title field missing')
}

async function assertLongTitle(browser, spec) {
  const page = await openPage(browser, spec)
  const tag = spec.tag
  try {
    await clickControl(page, 'Content')
    await page.waitForSelector('textarea[placeholder="Enter title..."]')
    await page.evaluate(() => {
      const cell = [...document.querySelectorAll('[aria-label="Cell 2"]')].find((el) => el.getBoundingClientRect().width > 0)
      if (!cell) throw new Error('Cell 2 missing')
      cell.click()
    })
    await page.waitForFunction(() => document.querySelector('textarea[placeholder="Enter title..."]')?.value === 'Your Title Here')

    const initial = await readCellTitle(page)
    check(`${tag} default title stays at its full size`, initial.base > 12 && initial.font != null && Math.abs(initial.font - initial.base) < 0.01, initial)
    check(`${tag} default title has no fit warning`, initial.warningCount === 0, initial)
    check(`${tag} default title does not widen the page`, initial.overflow === 0, initial.overflow)

    const fitting = Array.from({ length: 15 }, (_, i) => `Line ${i + 1} still readable`).join('\n')
    await setTitle(page, fitting)
    await page.waitForFunction((base) => {
      const title = document.querySelector('[data-fit-frame="1"] h1[data-fit-base]')
      if (!title) return false
      return parseFloat(getComputedStyle(title).fontSize) < base - 1
    }, {}, initial.base)
    const shrunk = await readCellTitle(page)
    check(`${tag} long title shrinks below the requested size`, shrunk.font < shrunk.base && shrunk.font > 12, shrunk)
    check(`${tag} a title that still fits has no warning`, shrunk.warningCount === 0, shrunk)
    check(`${tag} a fitted title does not widen the page`, shrunk.overflow === 0, shrunk.overflow)

    const overflowing = Array.from({ length: 200 }, (_, i) => `Overflow line ${i + 1}`).join('\n')
    await setTitle(page, overflowing)
    await page.waitForFunction((warning) => [...document.querySelectorAll('[role="status"]')].some((el) => el.textContent.trim() === warning), {}, FIT_WARNING)
    const floored = await readCellTitle(page)
    check(`${tag} overflow title shows the fit warning once`, floored.warningCount === 1, floored)
    check(`${tag} overflow title stops at the 12px floor`, floored.font != null && Math.abs(floored.font - 12) < 0.01, floored)
    check(`${tag} title field points at the fit warning`, floored.described === FIT_WARNING, floored.described)
    check(`${tag} an overflowing title does not widen the page`, floored.overflow === 0, floored.overflow)

    await setTitle(page, 'Your Title Here')
    await page.waitForFunction(() => ![...document.querySelectorAll('[role="status"]')].some((el) => el.textContent.includes('Too much text to fit')))
    const restored = await readCellTitle(page)
    check(`${tag} shortening the title clears the warning`, restored.warningCount === 0 && restored.described == null, restored)
    check(`${tag} shortening the title restores the full size`, restored.base > 12 && Math.abs(restored.font - restored.base) < 0.01, restored)
    check(`${tag} restored title does not widen the page`, restored.overflow === 0, restored.overflow)
  } finally {
    await page.close()
  }
}

async function assertPlatformStatus(page) {
  await expandCollapse(page, 'Select Platform')
  await page.waitForSelector('input[aria-label="Search platforms"]')
  await page.evaluate(() => {
    const el = document.querySelector('input[aria-label="Search platforms"]')
    const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')
    desc.set.call(el, 'xyz123')
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await page.waitForSelector('[role="status"]')
  const text = await page.$eval('[role="status"]', (el) => el.textContent.trim())
  check('empty platform search status', text === 'No platforms match', text)
}

async function assertDebug(browser) {
  const root = await openPage(browser, { width: 390, height: 844, coarse: true, path: '/' })
  const rootText = await root.evaluate(() => document.getElementById('debug-root')?.textContent ?? '')
  check('debug pill hidden on /', !rootText.includes('dbg'), rootText)
  await root.close()

  const dbg = await openPage(browser, { width: 390, height: 844, coarse: true, path: '/?dbg=1' })
  const dbgText = await dbg.evaluate(() => document.getElementById('debug-root')?.textContent ?? '')
  check('debug pill shows on ?dbg=1', dbgText.includes('dbg'), dbgText)
  await dbg.close()

  const embed = await openPage(browser, { width: 390, height: 844, coarse: true, path: '/?dbg=1&embed=1' })
  const embedText = await embed.evaluate(() => document.getElementById('debug-root')?.textContent ?? '')
  check('debug pill hidden on embed', !embedText.includes('dbg'), embedText)
  await embed.close()
}

async function run() {
  const preview = spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
    { cwd: new URL('..', import.meta.url).pathname, stdio: ['ignore', 'pipe', 'pipe'] },
  )
  let browser
  try {
    await waitForPreview()
    browser = await puppeteer.launch({
      executablePath: CHROME,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    })

    const cases = [
      { tag: 'coarse 320', width: 320, height: 568, coarse: true, mobile: true, deep: 'full' },
      { tag: 'coarse 375', width: 375, height: 667, coarse: true, mobile: true, deep: 'header' },
      { tag: 'coarse 390', width: 390, height: 844, coarse: true, mobile: true, deep: 'flow' },
      { tag: 'coarse 568x320', width: 568, height: 320, coarse: true, mobile: true, deep: 'short' },
      { tag: 'coarse 740x360', width: 740, height: 360, coarse: true, mobile: true, deep: 'short' },
      { tag: 'desktop coarse', width: 1280, height: 800, coarse: true, mobile: false, deep: 'header' },
      { tag: 'desktop fine', width: 1280, height: 800, coarse: false, mobile: false, deep: 'header' },
      { tag: 'fine 390', width: 390, height: 844, coarse: false, mobile: true, deep: 'header' },
    ]

    for (const spec of cases) {
      const page = await openPage(browser, spec)
      try {
        const data = await readChrome(page)
        assertHeader(spec.tag, data, spec)
        const gap = await page.evaluate(() => {
          const undo = document.querySelector('button[aria-label="Undo"]').getBoundingClientRect()
          const redo = document.querySelector('button[aria-label="Redo"]').getBoundingClientRect()
          const x = (undo.right + redo.left) / 2
          const y = undo.top + undo.height / 2
          const label = document.elementFromPoint(x, y)?.closest('button')?.getAttribute('aria-label') ?? null
          return { label, gap: redo.left - undo.right }
        })
        check(`${spec.tag} undo/redo gap is not part of either button`, gap.label !== 'Undo' && gap.label !== 'Redo', gap)
        if (spec.coarse && spec.mobile) await assertDisabledUndo(page, spec.tag)
        if (spec.deep === 'header') {
          await page.close()
          continue
        }
        if (spec.mobile) {
          await addRows(page)
          await assertEnabledUndo(page, spec.tag)
          await assertHandle(page, spec.tag)
          await closeSheet(page)
          await assertMinimap(page, spec.tag)
          await assertCanvasGeometry(page, spec.tag)
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
          check(`${spec.tag} no overflow after minimap`, overflow === 0, overflow)
        }
        if (spec.deep === 'full' || spec.deep === 'flow') {
          await assertSheetScroll(page, spec.tag)
          await assertDownloadAndCheckbox(page, spec.tag)
        }
        if (spec.deep !== 'header' && spec.tag !== 'coarse 740x360') await assertReader(page, spec.tag)
      } finally {
        if (!page.isClosed()) await page.close()
      }
    }

    const statusPage = await openPage(browser, { width: 390, height: 844, coarse: true })
    await assertPlatformStatus(statusPage)
    await statusPage.close()
    await assertDebug(browser)
    await assertLongTitle(browser, { tag: 'desktop fine', width: 1280, height: 800, coarse: false })
    await assertLongTitle(browser, { tag: 'coarse 390', width: 390, height: 844, coarse: true })
  } finally {
    if (browser) await browser.close()
    preview.kill('SIGTERM')
  }

  const failed = results.filter((item) => !item.ok)
  console.log(`\nrendered ${results.length - failed.length}/${results.length} passed`)
  if (failed.length) {
    console.error(JSON.stringify(failed, null, 2))
    process.exit(1)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
