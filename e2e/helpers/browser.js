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
export async function openSaveLoadLoadTab(page) {
  const saveLoadBtn = page.locator('button[title="Save or load"]')
  if (await saveLoadBtn.count()) {
    await saveLoadBtn.click()
  } else {
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await page.getByRole('button', { name: 'Save / Load', exact: true }).click()
  }
  const dialog = page.getByRole('dialog')
  await dialog.waitFor({ state: 'visible' })
  await dialog.getByRole('tab', { name: /^Load/ }).click()
  return dialog
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