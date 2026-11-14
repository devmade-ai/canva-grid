// Requirement: Clean browser context per test with seeded IndexedDB designs.
// Approach: Stub service worker before navigation; seed via page.evaluate.
// Alternatives:
//   - Shared storage: Rejected — tests would leak designs and focus order.

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {{ width: number, height: number, mobile?: boolean }} viewport
 */
export async function newPreparedContext(browser, { width, height, mobile = false }) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: mobile,
    hasTouch: mobile,
  })
  await context.addInitScript(() => {
    const stub = {
      register: () => Promise.resolve({ scope: '/' }),
      getRegistrations: () => Promise.resolve([]),
      ready: Promise.resolve({ unregister: () => Promise.resolve(true) }),
      addEventListener() {},
      removeEventListener() {},
    }
    try {
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        get: () => stub,
      })
    } catch {
      // already defined
    }
  })
  return context
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string[]} names — newest-first order matches listDesigns sort
 */
export async function seedDesigns(page, names) {
  await page.evaluate(async (designNames) => {
    const openDb = () =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open('canvagrid', 1)
        req.onupgradeneeded = (event) => {
          const db = event.target.result
          if (!db.objectStoreNames.contains('designs')) {
            db.createObjectStore('designs', { keyPath: 'id' })
          }
        }
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })

    const db = await openDb()
    const base = Date.now()
    for (let i = 0; i < designNames.length; i++) {
      const design = {
        id: `e2e-${base}-${i}`,
        name: designNames[i],
        savedAt: new Date(base - i * 60_000).toISOString(),
        state: { platform: 'instagram-feed-portrait', pages: [null], activePage: 0 },
      }
      await new Promise((resolve, reject) => {
        const tx = db.transaction('designs', 'readwrite')
        tx.objectStore('designs').put(design)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    }
  }, names)
}

/**
 * @param {import('@playwright/test').Page} page
 */
export async function gotoAppReady(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.waitForSelector('button[aria-label="Undo"]', { timeout: 30_000 })
  await page.evaluate(() => document.fonts?.ready)
}

/**
 * @param {import('@playwright/test').Page} page
 */
/**
 * @param {import('@playwright/test').Page} page
 */
export async function openSaveLoadModal(page) {
  const saveLoadBtn = page.locator('button[title="Save or load"]')
  if (await saveLoadBtn.count()) {
    await saveLoadBtn.click()
  } else {
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await page.getByRole('button', { name: 'Save / Load', exact: true }).click()
  }
  const dialog = page.getByRole('dialog')
  await dialog.waitFor({ state: 'visible' })
  return dialog
}

export async function openSaveLoadLoadTab(page) {
  const dialog = await openSaveLoadModal(page)
  await dialog.getByRole('tab', { name: /^Load/ }).click()
  return dialog
}

/**
 * Save the current design from the modal; lands on Load tab after success.
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 */
export async function saveDesignFromModal(page, name) {
  const dialog = await openSaveLoadModal(page)
  await dialog.getByRole('tab', { name: 'Save Current' }).click()
  await dialog.getByPlaceholder('My Design').fill(name)
  await dialog.getByRole('button', { name: 'Save Design', exact: true }).click()
  await dialog.getByRole('button', { name: `Load design "${name}"` }).waitFor({ state: 'visible' })
  return dialog
}

/**
 * @param {import('@playwright/test').Locator} dialog
 */
export async function expectDialogNoHorizontalOverflow(dialog) {
  const metrics = await dialog.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
  }))
  if (metrics.scrollWidth > metrics.clientWidth) {
    throw new Error(
      `Dialog horizontal overflow: scrollWidth=${metrics.scrollWidth} clientWidth=${metrics.clientWidth}`,
    )
  }
}

/**
 * @param {import('@playwright/test').Locator} locator
 */
export async function expectFullyInViewport(locator) {
  const ok = await locator.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    return (
      r.width > 0
      && r.height > 0
      && r.left >= 0
      && r.top >= 0
      && r.right <= vw
      && r.bottom <= vh
    )
  })
  if (!ok) {
    throw new Error('Element is not fully inside the viewport')
  }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} designName
 */
export function deleteButtonForDesign(page, designName) {
  return page
    .getByRole('button', { name: `Load design "${designName}"` })
    .getByRole('button', { name: 'Delete design' })
}

/**
 * Requirement: Assert dismiss does not leave focus on body at the first animation frame.
 * Playwright's toBeFocused() retries past a one-frame body flash — this catches that.
 * @param {import('@playwright/test').Page} page
 * @param {() => Promise<void>} action
 */
export async function expectFocusNotBodyOnFirstRaf(page, action) {
  await action()
  const bodyAtRaf1 = await page.evaluate(
    () => new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve(document.activeElement === document.body)
      })
    }),
  )
  if (bodyAtRaf1 !== false) {
    throw new Error(`Expected focus not on body at first rAF after action, bodyAtRaf1=${bodyAtRaf1}`)
  }
}