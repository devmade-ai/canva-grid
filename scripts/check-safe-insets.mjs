// Safe-area geometry. Jest does not apply env(), so this drives a preview in
// headed Chrome and injects insets through Emulation.setSafeAreaInsetsOverride.
// The numbers are labelled: top is 47 or 59, bottom is 34, each side is 47.
// A doubled owner shows up as 94 or 68. This is not Safari, not a PWA, and
// not an unmocked device inset.
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome'
const PORT = 4174
const BASE = `http://127.0.0.1:${PORT}`
const FIT_WARNING = "Too much text to fit. It's as small as it can be. Shorten it so nothing gets cut off."
const ZERO = { top: 0, right: 0, bottom: 0, left: 0 }

const results = []
function check(name, ok, detail) {
  results.push({ name, ok, detail: ok ? undefined : detail })
  if (ok) console.log(`ok  ${name}`)
  else console.error(`FAIL ${name}`, detail ?? '')
}

function near(a, b, slack = 1) {
  return typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= slack
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

async function openPage(browser, { width, height, coarse, insets = ZERO, path = '/' }) {
  const page = await browser.newPage()
  page.setDefaultTimeout(30000)
  const client = await page.createCDPSession()
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 1024,
  })
  if (coarse) {
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  }
  await client.send('Emulation.setSafeAreaInsetsOverride', { insets })
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
  await page.waitForSelector('button[aria-label="Undo"], button[aria-label="Back to Editor"]', { timeout: 30000 })
  await page.evaluate(() => document.fonts?.ready)
  return { page, client }
}

async function readShell(page) {
  return page.evaluate(() => {
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        top: r.top, bottom: r.bottom, left: r.left, right: r.right,
        width: r.width, height: r.height,
        padBottom: parseFloat(cs.paddingBottom),
        padTop: parseFloat(cs.paddingTop),
      }
    }
    const bands = {}
    document.querySelectorAll('[data-inset-band]').forEach((el) => {
      const edge = el.getAttribute('data-inset-band')
      const current = box(el)
      const prev = bands[edge]
      bands[edge] = prev ? { ...current, count: (prev.count || 1) + 1 } : { ...current, count: 1 }
    })
    const paint = (el) => {
      const cs = getComputedStyle(el)
      const before = getComputedStyle(el, '::before')
      const after = getComputedStyle(el, '::after')
      return {
        filter: cs.filter,
        backdrop: cs.backdropFilter,
        mask: cs.maskImage,
        beforeFilter: before.filter,
        beforeBackdrop: before.backdropFilter,
        beforeContent: before.content,
        afterFilter: after.filter,
        afterBackdrop: after.backdropFilter,
        afterContent: after.content,
        bg: cs.backgroundColor,
        clip: cs.backgroundClip,
        opacity: cs.opacity,
        transform: cs.transform,
        willChange: cs.willChange,
        isolation: cs.isolation,
      }
    }
    const header = document.querySelector('header')
    const row = header?.querySelector('.coarse-header-row, .coarse-header-bar') || header
    const sharpNodes = []
    const addSharp = (name, el, bar) => {
      if (!el) return
      sharpNodes.push({ name, bar: !!bar, ...paint(el) })
    }
    addSharp('header', header, true)
    addSharp('row', row, false)
    addSharp('h1', header?.querySelector('h1'), false)
    addSharp('logo', header?.querySelector('svg'), false)
    addSharp('undo', document.querySelector('button[aria-label="Undo"]'), false)
    addSharp('menu', document.querySelector('button[aria-label="Menu"]'), false)
    addSharp('back', document.querySelector('button[aria-label="Back to Editor"]'), false)
    const tab = [...document.querySelectorAll('nav')].find((el) => !el.classList.contains('dock'))
    addSharp('tabnav', tab, true)
    let context = document.querySelector('[data-minimap="bar"]')?.parentElement
    while (context && context !== document.body && !context.classList?.contains('border-b')) context = context.parentElement
    if (context && context !== document.body) addSharp('context', context, true)
    const ancestors = []
    for (let el = header?.parentElement; el; el = el.parentElement) {
      const cs = getComputedStyle(el)
      if ((cs.backdropFilter && cs.backdropFilter !== 'none') || (cs.filter && cs.filter !== 'none') || (cs.transform && cs.transform !== 'none')) {
        ancestors.push({ tag: el.tagName, backdrop: cs.backdropFilter, filter: cs.filter, transform: cs.transform, overflow: cs.overflow })
      }
    }
    const dock = document.querySelector('nav.dock')
    const btn = dock?.querySelector('button')
    const main = document.querySelector('main')
    const canvas = main?.querySelector('.relative') || main?.querySelector('[style*="height"]')
    const menu = document.querySelector('button[aria-label="Menu"]')
    const undo = document.querySelector('button[aria-label="Undo"]')
    const doc = document.documentElement
    const rootStyle = getComputedStyle(document.documentElement)
    return {
      innerW: window.innerWidth,
      innerH: window.innerHeight,
      bodyPad: getComputedStyle(document.body).padding,
      safeTop: rootStyle.getPropertyValue('--safe-top').trim(),
      safeBottom: rootStyle.getPropertyValue('--safe-bottom').trim(),
      safeLeft: rootStyle.getPropertyValue('--safe-left').trim(),
      safeRight: rootStyle.getPropertyValue('--safe-right').trim(),
      bands,
      header: box(header),
      row: box(row),
      dock: box(dock),
      btn: box(btn),
      main: box(main),
      canvas: box(canvas),
      menu: box(menu),
      undo: box(undo),
      overflowX: doc.scrollWidth - doc.clientWidth,
      coarse: matchMedia('(pointer: coarse)').matches,
      fine: matchMedia('(pointer: fine)').matches,
      none: matchMedia('(pointer: none)').matches,
      touch: navigator.maxTouchPoints,
      mobileMq: matchMedia('(max-width: 1023px)').matches,
      sharp: { nodes: sharpNodes, ancestors },
    }
  })
}

function hasBlur(node) {
  return [node.filter, node.backdrop, node.mask, node.beforeFilter, node.beforeBackdrop, node.afterFilter, node.afterBackdrop]
    .some((value) => /blur\(/i.test(value || ''))
}

function alphaOf(color) {
  const slash = String(color).match(/\/\s*([0-9.]+%?)\s*\)/)
  if (slash) return slash[1].endsWith('%') ? parseFloat(slash[1]) / 100 : parseFloat(slash[1])
  const rgba = String(color).match(/^rgba?\(([^)]+)\)/)
  if (rgba) {
    const parts = rgba[1].split(',').map((part) => part.trim())
    if (parts.length === 4) return parseFloat(parts[3])
  }
  return 1
}

// Chrome applies backdrop-filter to the backdrop, not the glyphs, so a sharp
// Chrome screenshot is not evidence that iOS stopped blurring this layer.
// These checks record the computed filter, mask, and pseudo effects and
// require that none of them is a blur on the elements that paint the chrome.
function assertSharp(tag, data) {
  const nodes = data.sharp?.nodes || []
  const blurred = nodes.filter(hasBlur)
  check(`${tag} chrome glyphs have no blur`, blurred.length === 0 && nodes.some((node) => node.name === 'header'), blurred.length ? blurred : nodes.map((node) => node.name))
  const translucent = nodes.filter((node) => node.bar && alphaOf(node.bg) < 0.99)
  check(`${tag} chrome bar background is opaque`, translucent.length === 0, translucent.map((node) => ({ name: node.name, bg: node.bg })))
  const h1 = nodes.find((node) => node.name === 'h1')
  if (h1) check(`${tag} wordmark still clips to text`, h1.clip === 'text', h1.clip)
  check(`${tag} no ancestor blur or transform`, (data.sharp?.ancestors || []).length === 0, data.sharp?.ancestors)
  const summary = nodes.map((node) => `${node.name}:backdrop=${node.backdrop}|filter=${node.filter}|mask=${node.mask}|before=${node.beforeBackdrop}|bgA=${alphaOf(node.bg)}|clip=${node.clip}`).join(' ')
  console.log(`computed ${tag} ${summary}`)
}

function assertEdges(tag, data, insets, { mobile, zeroRow }) {
  const { top, right, bottom, left } = insets
  check(`${tag} body padding stays 0`, data.bodyPad === '0px', data.bodyPad)
  check(`${tag} one band per edge`, ['top', 'bottom', 'left', 'right'].every((edge) => data.bands[edge]?.count === 1), data.bands)
  check(`${tag} top band is ${top} not doubled`, near(data.bands.top.height, top), data.bands.top)
  check(`${tag} bottom band is ${bottom} not doubled`, near(data.bands.bottom.height, bottom), data.bands.bottom)
  check(`${tag} left band is ${left} not doubled`, near(data.bands.left.width, left), data.bands.left)
  check(`${tag} right band is ${right} not doubled`, near(data.bands.right.width, right), data.bands.right)
  check(`${tag} variables match the injected insets`, data.safeTop === `${top}px` && data.safeBottom === `${bottom}px` && data.safeLeft === `${left}px` && data.safeRight === `${right}px`, data)
  check(`${tag} no horizontal overflow`, data.overflowX === 0, data.overflowX)
  if (zeroRow != null) {
    check(`${tag} visible row stays ${zeroRow}px`, near(data.row.height, zeroRow), { row: data.row.height, zeroRow })
  }
  check(`${tag} row starts at the top band`, near(data.row.top, data.bands.top.bottom) || near(data.row.top, top), { row: data.row.top, band: data.bands.top.bottom, top })
  // innerWidth is an integer; the layout width is fractional (~0.9px past it).
  // A doubled side inset is 94px, so 2px of slack does not hide that.
  check(`${tag} row is inside the side bands`, data.row.left >= left - 2 && data.row.right <= data.innerW - right + 2, data.row)

  if (mobile) {
    check(`${tag} dock does not add its own bottom inset`, near(data.dock.padBottom, 0), data.dock)
    check(`${tag} dock stays 3.5rem`, near(data.dock.height, 56), data.dock)
    check(`${tag} dock button height matches the zero inset`, near(data.btn.height, 47, 2), data.btn)
    check(`${tag} dock sits on the bottom band`, near(data.dock.bottom, data.bands.bottom.top), { dock: data.dock.bottom, band: data.bands.bottom.top })
    check(`${tag} bottom band reaches the viewport`, near(data.bands.bottom.bottom, data.innerH), data.bands.bottom)
    // The platform strip sits between the canvas and the dock. The dock check
    // above is what proves the bar is on the band; this proves the canvas is not under it.
    check(`${tag} main stays above the dock`, data.main.bottom <= data.dock.top + 1, { main: data.main.bottom, dock: data.dock.top })
    check(`${tag} dock buttons clear the side bands`, data.btn.left >= left - 2 && data.btn.right <= data.innerW - right + 2, data.btn)
    check(`${tag} menu clears the right band`, !data.menu || data.menu.right <= data.innerW - right + 2, data.menu)
    if (data.canvas && data.canvas.height > 2) {
      check(`${tag} canvas stays above the dock`, data.canvas.bottom <= data.dock.top + 1, { canvas: data.canvas.bottom, dock: data.dock.top })
    }
  } else {
    check(`${tag} desktop has no dock`, data.dock == null, data.dock)
    check(`${tag} header box is below the top band`, near(data.header.top, top), data.header)
    check(`${tag} header height is independent of the top inset`, zeroRow == null || near(data.header.height, zeroRow), { header: data.header?.height, zeroRow })
  }
  assertSharp(tag, data)
}

async function closeSheet(page) {
  const open = await page.$('[aria-label="Tab controls"]')
  if (!open) return
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('nav.dock button')].find((el) => el.classList.contains('dock-active'))
      || [...document.querySelectorAll('nav.dock button')].find((el) => el.textContent.includes('Presets'))
    btn?.click()
  })
  await page.waitForFunction(() => !document.querySelector('[aria-label="Tab controls"]'))
  // The preview scale follows the main's size on the next ResizeObserver
  // frame. Reading immediately still sees the sheet-open canvas, which is
  // taller than the dock on a short viewport.
  await delay(400)
}

async function trustedTap(page, coarse, x, y) {
  await page.evaluate(() => {
    window.__trustedTap = null
    const mark = (event) => {
      window.__trustedTap = { trusted: event.isTrusted, type: event.type }
      document.removeEventListener('click', mark, true)
    }
    document.addEventListener('click', mark, true)
  })
  if (coarse) await page.touchscreen.tap(x, y)
  else await page.mouse.click(x, y)
  await delay(150)
  return page.evaluate(() => window.__trustedTap)
}

async function assertInteractions(page, tag, coarse) {
  await closeSheet(page)
  const dockBtn = await page.$('nav.dock button')
  const box = await dockBtn.boundingBox()
  const tap = await trustedTap(page, coarse, box.x + box.width / 2, box.y + box.height / 2)
  check(`${tag} dock tap is trusted`, tap?.trusted === true, tap)
  await page.waitForSelector('[aria-label="Tab controls"]')
  // Snap animation is 300ms. Measuring mid-translate puts the scroller over the dock.
  await delay(400)
  const sheet = await page.evaluate(() => {
    const el = document.querySelector('[aria-label="Tab controls"]')
    const r = el.getBoundingClientRect()
    const dock = document.querySelector('nav.dock').getBoundingClientRect()
    const scroller = el.querySelector('.overflow-y-auto')
    return {
      left: r.left, right: r.right, bottom: r.bottom,
      innerW: window.innerWidth, innerH: window.innerHeight,
      dockTop: dock.top,
      scrollerBottom: scroller ? scroller.getBoundingClientRect().bottom : null,
    }
  })
  check(`${tag} sheet clears the side bands`, sheet.left >= -2 && sheet.right <= sheet.innerW + 2, sheet)
  check(`${tag} sheet content stays above the dock`, sheet.scrollerBottom == null || sheet.scrollerBottom <= sheet.dockTop + 2, sheet)
  await closeSheet(page)

  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('nav.dock button')].find((el) => el.textContent.includes('Structure'))
    btn.click()
  })
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Row Below')))
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Row Below')).click())
    await delay(40)
  }
  await closeSheet(page)
  await page.waitForSelector('[data-minimap="bar"]')
  const before = await page.$eval('[data-minimap="bar"]', (el) => el.scrollTop)
  const barBox = await page.$('[data-minimap="bar"]').then((el) => el.boundingBox())
  if (coarse) {
    const client = await page.createCDPSession()
    const x = barBox.x + barBox.width / 2
    const y = barBox.y + barBox.height / 2
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - 60 }] })
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await client.detach()
  } else {
    await page.mouse.move(barBox.x + barBox.width / 2, barBox.y + barBox.height / 2)
    await page.mouse.wheel({ deltaY: 80 })
  }
  await delay(50)
  const scrolled = await page.$eval('[data-minimap="bar"]', (el) => ({ top: el.scrollTop, max: el.scrollHeight - el.clientHeight }))
  if (scrolled.max > 4) {
    check(`${tag} minimap gesture moved the scroll`, scrolled.top > before, scrolled)
  }
  const reached = await page.evaluate(() => {
    const bar = document.querySelector('[data-minimap="bar"]')
    bar.scrollTop = bar.scrollHeight
    const last = [...bar.querySelectorAll('[role="button"]')].at(-1)
    const first = bar.querySelector('[role="button"]')
    const br = bar.getBoundingClientRect()
    const lr = last.getBoundingClientRect()
    const dock = document.querySelector('nav.dock').getBoundingClientRect()
    return {
      lastInBar: lr.top >= br.top - 1 && lr.bottom <= br.bottom + 2,
      barAboveDock: br.bottom <= dock.top + 1,
      firstLabel: first?.getAttribute('aria-label') || null,
      clientH: bar.clientHeight,
    }
  })
  check(`${tag} minimap scroll reaches the last cell`, reached.lastInBar === true, reached)
  check(`${tag} minimap stays above the dock`, reached.barAboveDock === true, reached)
  check(`${tag} minimap cap stays near 88`, reached.clientH <= 96 && reached.clientH >= 80, reached.clientH)

  const firstBox = await page.evaluate(() => {
    const bar = document.querySelector('[data-minimap="bar"]')
    bar.scrollTop = 0
    const first = bar.querySelector('[role="button"]')
    const r = first.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, label: first.getAttribute('aria-label') }
  })
  const cellTap = await trustedTap(page, coarse, firstBox.x, firstBox.y)
  check(`${tag} first minimap cell tap is trusted`, cellTap?.trusted === true, cellTap)
}

async function assertDialog(page, tag, insets) {
  await page.evaluate(() => document.querySelector('button[aria-label="Menu"]')?.click())
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Help')))
  const menu = await page.evaluate(() => {
    const el = document.querySelector('nav[aria-label="Main navigation"]:not(.dock)')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, innerH: innerHeight, innerW: innerWidth }
  })
  if (menu) {
    check(`${tag} menu stays inside the side bands`, menu.left >= insets.left - 1 && menu.right <= menu.innerW - insets.right + 1, menu)
    check(`${tag} menu stays below the top inset`, menu.top >= insets.top - 1, menu)
  }
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Help & Tutorial') || b.textContent.trim() === 'Help')?.click())
  await page.waitForSelector('dialog[open] .modal-box', { timeout: 5000 }).catch(() => null)
  // modal-bottom slides up. At 50ms the box is still below the safe rect.
  await delay(400)
  const dialog = await page.evaluate(() => {
    const el = document.querySelector('dialog[open]')
    if (!el) return null
    const box = el.querySelector('.modal-box')?.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft],
      box: box && { top: box.top, bottom: box.bottom, left: box.left, right: box.right },
      innerW: innerWidth,
      innerH: innerHeight,
    }
  })
  check(`${tag} dialog opened`, !!dialog, dialog)
  if (dialog) {
    check(`${tag} dialog padding is the inset once`, dialog.pad.join(' ') === `${insets.top}px ${insets.right}px ${insets.bottom}px ${insets.left}px`, dialog.pad)
    check(`${tag} dialog box clears the top inset`, dialog.box.top >= insets.top - 1, dialog.box)
    check(`${tag} dialog box clears the bottom inset`, dialog.box.bottom <= dialog.innerH - insets.bottom + 1, dialog.box)
    check(`${tag} dialog box clears the side insets`, dialog.box.left >= insets.left - 1 && dialog.box.right <= dialog.innerW - insets.right + 1, dialog.box)
  }
  await page.keyboard.press('Escape')
  await delay(50)
}

async function assertReader(page, tag, insets) {
  await page.evaluate(() => [...document.querySelectorAll('nav.dock button')].find((el) => el.textContent.includes('Structure'))?.click())
  await page.waitForFunction(() => [...document.querySelectorAll('.collapse-title')].some((el) => el.textContent.includes('Pages')))
  await page.evaluate(() => {
    const title = [...document.querySelectorAll('.collapse-title')].find((el) => el.textContent.includes('Pages'))
    const input = title?.closest('.collapse')?.querySelector('input[type="checkbox"]')
    if (input && !input.checked) input.click()
  })
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Add Page')))
  for (let i = 0; i < 12; i++) {
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Add Page')).click())
  }
  await page.evaluate(() => document.querySelector('button[aria-label="Menu"]')?.click())
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Reader Mode')))
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Reader Mode')).click())
  await page.waitForSelector('button[aria-label="Back to Editor"]')
  const shell = await readShell(page)
  assertSharp(`${tag} reader`, shell)
  check(`${tag} reader row padding is not the inset`, shell.row.padTop < 20 && shell.row.padTop > 0, shell.row)
  const dots = await page.evaluate(() => {
    const scroller = document.querySelector('main .overflow-x-auto')
    const buttons = [...document.querySelectorAll('button[title^="Page "]')].map((el) => {
      const r = el.getBoundingClientRect()
      return { width: r.width, height: r.height, left: r.left, right: r.right }
    })
    return {
      n: buttons.length,
      sample: buttons[0],
      scrollW: scroller?.scrollWidth ?? 0,
      clientW: scroller?.clientWidth ?? 0,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
  check(`${tag} reader page dots stay at least 44`, dots.n >= 12 && dots.sample && dots.sample.width >= 43.9 && dots.sample.height >= 43.9, dots)
  check(`${tag} reader page row scrolls inside the page`, dots.scrollW > dots.clientW && dots.overflow === 0, dots)
  check(`${tag} reader top band is ${insets.top}`, near(shell.bands.top.height, insets.top), shell.bands.top)
  check(`${tag} reader bottom band is ${insets.bottom}`, near(shell.bands.bottom.height, insets.bottom), shell.bands.bottom)
  check(`${tag} reader canvas stays above the bottom band`, !shell.canvas || shell.canvas.bottom <= shell.bands.bottom.top + 1, { canvas: shell.canvas, band: shell.bands.bottom })
  check(`${tag} reader has no page overflow`, shell.overflowX === 0, shell.overflowX)
  const back = await page.$('button[aria-label="Back to Editor"]')
  const backBox = await back.boundingBox()
  const tap = await trustedTap(page, true, backBox.x + 8, backBox.y + backBox.height / 2)
  check(`${tag} reader back tap is trusted`, tap?.trusted === true, tap)
  await page.waitForSelector('button[aria-label="Undo"]')
}

async function assertLongTitle(browser, spec) {
  const { page } = await openPage(browser, spec)
  const tag = spec.tag
  try {
    await closeSheet(page)
    await page.evaluate(() => [...document.querySelectorAll('nav.dock button, nav button')].find((b) => b.textContent.includes('Content') || b.textContent.trim() === 'Content')?.click())
    await page.waitForSelector('textarea[placeholder="Enter title..."]', { timeout: 10000 })
    await page.evaluate(() => {
      const cell = [...document.querySelectorAll('[aria-label="Cell 2"]')].find((el) => el.getBoundingClientRect().width > 0)
      cell?.click()
    })
    await page.waitForFunction(() => document.querySelector('textarea[placeholder="Enter title..."]')?.value === 'Your Title Here')
    const read = () => page.evaluate((warning) => {
      const frame = document.querySelector('[data-fit-frame="1"]')
      const title = frame?.querySelector('h1[data-fit-base]')
      const warnings = [...document.querySelectorAll('[role="status"]')].filter((el) => el.textContent.trim() === warning)
      return {
        font: title ? parseFloat(getComputedStyle(title).fontSize) : null,
        base: title ? Number(title.getAttribute('data-fit-base')) : null,
        warningCount: warnings.length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }
    }, FIT_WARNING)
    const setTitle = async (value) => {
      await page.evaluate((next) => {
        const el = document.querySelector('textarea[placeholder="Enter title..."]')
        const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')
        desc.set.call(el, next)
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }, value)
    }
    const initial = await read()
    check(`${tag} default title stays full size`, initial.base > 12 && initial.font != null && Math.abs(initial.font - initial.base) < 0.01, initial)
    const overflowing = Array.from({ length: 80 }, (_, i) => `Overflow line ${i + 1}`).join('\n')
    await setTitle(overflowing)
    await page.waitForFunction((warning) => [...document.querySelectorAll('[role="status"]')].some((el) => el.textContent.trim() === warning), {}, FIT_WARNING)
    const floored = await read()
    check(`${tag} overflow title floors at 12px`, floored.font != null && Math.abs(floored.font - 12) < 0.01 && floored.warningCount === 1, floored)
    check(`${tag} overflow title does not widen the page`, floored.overflow === 0, floored.overflow)
    await setTitle('Your Title Here')
    await page.waitForFunction(() => ![...document.querySelectorAll('[role="status"]')].some((el) => el.textContent.includes('Too much text to fit')))
    const restored = await read()
    check(`${tag} shortening the title restores it`, restored.warningCount === 0 && restored.base > 12 && Math.abs(restored.font - restored.base) < 0.01, restored)
  } finally {
    await page.close()
  }
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
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    })

    const zeros = [
      { tag: 'zero 320 coarse', width: 320, height: 568, coarse: true, mobile: true },
      { tag: 'zero 375 coarse', width: 375, height: 667, coarse: true, mobile: true },
      { tag: 'zero 390 coarse', width: 390, height: 844, coarse: true, mobile: true },
      { tag: 'zero 390 compact', width: 390, height: 844, coarse: false, mobile: true },
      { tag: 'zero 568x320', width: 568, height: 320, coarse: true, mobile: true },
      { tag: 'zero 844x390', width: 844, height: 390, coarse: true, mobile: true },
      { tag: 'zero desktop', width: 1280, height: 800, coarse: false, mobile: false },
      { tag: 'zero desktop coarse', width: 1280, height: 800, coarse: true, mobile: false },
    ]
    const baselines = {}
    for (const spec of zeros) {
      const { page } = await openPage(browser, spec)
      try {
        if (spec.mobile) await closeSheet(page)
        const data = await readShell(page)
        baselines[spec.tag] = spec.mobile ? data.row.height : data.header.height
        check(`${spec.tag} matchMedia coarse=${spec.coarse}`, data.coarse === spec.coarse && data.mobileMq === spec.mobile, data)
        check(`${spec.tag} touch follows pointer`, spec.coarse ? data.touch > 0 : data.touch === 0, data.touch)
        assertEdges(spec.tag, data, ZERO, { mobile: spec.mobile, zeroRow: null })
        if (spec.tag === 'zero 320 coarse') {
          check('320 header is 53', near(data.header.height, 53), data.header)
        }
        if (spec.tag === 'zero 390 compact') {
          check('390 compact is not treated as coarse', data.coarse === false && data.undo.width <= 36, data.undo)
        }
        if (spec.tag === 'zero 390 coarse') {
          check('390 coarse undo is at least 44', data.undo.width >= 43.9 && data.undo.height >= 43.9, data.undo)
        }
      } finally {
        await page.close()
      }
    }
    check('width is not the pointer', baselines['zero 390 coarse'] != null && baselines['zero 390 compact'] != null, baselines)

    const injected = [
      { tag: 'top47 390', width: 390, height: 844, coarse: true, mobile: true, insets: { top: 47, right: 0, bottom: 34, left: 0 }, zero: 'zero 390 coarse', interact: true },
      { tag: 'top59 390', width: 390, height: 844, coarse: true, mobile: true, insets: { top: 59, right: 0, bottom: 34, left: 0 }, zero: 'zero 390 coarse' },
      { tag: 'top47 375', width: 375, height: 667, coarse: true, mobile: true, insets: { top: 47, right: 0, bottom: 34, left: 0 }, zero: 'zero 375 coarse' },
      { tag: 'top47 320', width: 320, height: 568, coarse: true, mobile: true, insets: { top: 47, right: 0, bottom: 34, left: 0 }, zero: 'zero 320 coarse' },
      { tag: 'sides 844x390', width: 844, height: 390, coarse: true, mobile: true, insets: { top: 0, right: 47, bottom: 34, left: 47 }, zero: 'zero 844x390', interact: true },
      { tag: 'all 568x320', width: 568, height: 320, coarse: true, mobile: true, insets: { top: 47, right: 47, bottom: 34, left: 47 }, zero: 'zero 568x320' },
      { tag: 'all 390 compact', width: 390, height: 844, coarse: false, mobile: true, insets: { top: 47, right: 0, bottom: 34, left: 0 }, zero: 'zero 390 compact' },
      { tag: 'desktop all', width: 1280, height: 800, coarse: false, mobile: false, insets: { top: 59, right: 47, bottom: 34, left: 47 }, zero: 'zero desktop' },
      { tag: 'desktop coarse bottom', width: 1280, height: 800, coarse: true, mobile: false, insets: { top: 47, right: 0, bottom: 34, left: 0 }, zero: 'zero desktop coarse' },
    ]
    for (const spec of injected) {
      const { page, client } = await openPage(browser, spec)
      try {
        if (spec.mobile) await closeSheet(page)
        const data = await readShell(page)
        assertEdges(spec.tag, data, spec.insets, { mobile: spec.mobile, zeroRow: baselines[spec.zero] })
        if (spec.interact) await assertInteractions(page, spec.tag, spec.coarse)
        if (spec.tag === 'top47 390') await assertDialog(page, spec.tag, spec.insets)
        if (spec.tag === 'sides 844x390') await assertReader(page, spec.tag, spec.insets)
        if (spec.tag === 'top59 390') {
          await client.send('Emulation.setDeviceMetricsOverride', {
            width: 844, height: 390, deviceScaleFactor: 1, mobile: true,
          })
          await client.send('Emulation.setSafeAreaInsetsOverride', {
            insets: { top: 0, right: 47, bottom: 34, left: 47 },
          })
          await delay(100)
          const turned = await readShell(page)
          check('orientation retargets bands without a reload', near(turned.bands.top.height, 0) && near(turned.bands.left.width, 47) && near(turned.bands.bottom.height, 34) && near(turned.row.height, baselines['zero 390 coarse']), turned.bands)
          check('orientation keeps the row inside the new sides', turned.row.left >= 47 - 2 && turned.row.right <= turned.innerW - 47 + 2, turned.row)
        }
      } finally {
        await page.close()
      }
    }

    await assertLongTitle(browser, { tag: 'title 320 inset', width: 320, height: 568, coarse: true, insets: { top: 47, right: 0, bottom: 34, left: 0 } })
    await assertLongTitle(browser, { tag: 'title 390 inset', width: 390, height: 844, coarse: true, insets: { top: 47, right: 0, bottom: 34, left: 0 } })
    await assertLongTitle(browser, { tag: 'title desktop inset', width: 1280, height: 800, coarse: false, insets: { top: 47, right: 47, bottom: 34, left: 47 } })
  } finally {
    if (browser) await browser.close()
    preview.kill('SIGTERM')
  }

  const failed = results.filter((item) => !item.ok)
  console.log(`\ninsets ${results.length - failed.length}/${results.length} passed`)
  if (failed.length) {
    console.error(JSON.stringify(failed, null, 2))
    process.exit(1)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
