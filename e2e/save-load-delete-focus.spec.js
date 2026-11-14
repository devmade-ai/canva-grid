// Requirement: Regression — Save/Load inline delete confirm keyboard focus (live audit Nov 2026).
// Approach: Playwright + production preview; seeded IndexedDB per context.

import { test, expect } from '@playwright/test'
import {
  deleteButtonForDesign,
  expectFocusNotBodyOnFirstRaf,
  gotoAppReady,
  newPreparedContext,
  openSaveLoadLoadTab,
  seedDesigns,
} from './helpers/browser.js'

async function openDeleteConfirm(page, designName) {
  const dialog = await openSaveLoadLoadTab(page)
  const deleteBtn = deleteButtonForDesign(page, designName)
  await deleteBtn.focus()
  await page.keyboard.press('Enter')
  await expect(dialog.getByRole('button', { name: 'Delete?', exact: true })).toBeVisible()
  return { dialog, deleteBtn }
}

test.describe('Save/Load Load tab — inline delete focus @1280', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('Enter on Delete moves focus to Cancel and Tab reaches Delete?', async ({ browser }) => {
    const context = await newPreparedContext(browser, { width: 1280, height: 800 })
    const page = await context.newPage()
    await gotoAppReady(page)
    await seedDesigns(page, ['Alpha', 'Beta'])

    const { dialog } = await openDeleteConfirm(page, 'Alpha')
    const cancel = dialog.getByRole('button', { name: 'Cancel', exact: true })
    await expect(cancel).toBeFocused()

    await page.keyboard.press('Shift+Tab')
    const confirmDelete = dialog.getByRole('button', { name: 'Delete?', exact: true })
    await expect(confirmDelete).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(cancel).toBeFocused()

    await context.close()
  })

  test('keyboard Cancel returns focus to Delete; dialog stays open', async ({ browser }) => {
    const context = await newPreparedContext(browser, { width: 1280, height: 800 })
    const page = await context.newPage()
    await gotoAppReady(page)
    await seedDesigns(page, ['Gamma'])

    const { dialog } = await openDeleteConfirm(page, 'Gamma')
    await expectFocusNotBodyOnFirstRaf(page, () => page.keyboard.press('Enter'))
    await expect(deleteButtonForDesign(page, 'Gamma')).toBeFocused()
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Delete?', exact: true })).toBeHidden()

    await context.close()
  })

  test('Escape dismisses inline confirm only and refocuses Delete', async ({ browser }) => {
    const context = await newPreparedContext(browser, { width: 1280, height: 800 })
    const page = await context.newPage()
    await gotoAppReady(page)
    await seedDesigns(page, ['Delta'])

    const { dialog } = await openDeleteConfirm(page, 'Delta')
    await expectFocusNotBodyOnFirstRaf(page, () => page.keyboard.press('Escape'))
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Delete?', exact: true })).toBeHidden()
    await expect(deleteButtonForDesign(page, 'Delta')).toBeFocused()

    await context.close()
  })

  test('confirmed delete — middle row focuses next row Delete', async ({ browser }) => {
    const context = await newPreparedContext(browser, { width: 1280, height: 800 })
    const page = await context.newPage()
    await gotoAppReady(page)
    await seedDesigns(page, ['First', 'Middle', 'Last'])

    const { dialog } = await openDeleteConfirm(page, 'Middle')
    await page.keyboard.press('Shift+Tab')
    await expectFocusNotBodyOnFirstRaf(page, () => page.keyboard.press('Enter'))
    await expect(deleteButtonForDesign(page, 'Last')).toBeFocused()
    await expect(dialog).toBeVisible()

    await context.close()
  })

  test('confirmed delete with search filter focuses neighbour in filtered list', async ({ browser }) => {
    const context = await newPreparedContext(browser, { width: 1280, height: 800 })
    const page = await context.newPage()
    await gotoAppReady(page)
    await seedDesigns(page, ['Kiwi', 'Mango', 'Panda', 'Zebra'])

    const dialog = await openSaveLoadLoadTab(page)
    await dialog.getByLabel('Search saved designs').fill('an')
    await expect(dialog.getByRole('button', { name: 'Load design "Mango"' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Load design "Panda"' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Load design "Kiwi"' })).toBeHidden()

    const deleteBtn = deleteButtonForDesign(page, 'Mango')
    await deleteBtn.focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Shift+Tab')
    await expectFocusNotBodyOnFirstRaf(page, () => page.keyboard.press('Enter'))
    await expect(deleteButtonForDesign(page, 'Panda')).toBeFocused()

    await context.close()
  })

  test('confirmed delete — last row focuses previous row Delete', async ({ browser }) => {
    const context = await newPreparedContext(browser, { width: 1280, height: 800 })
    const page = await context.newPage()
    await gotoAppReady(page)
    await seedDesigns(page, ['Row A', 'Row B'])

    await openDeleteConfirm(page, 'Row B')
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Enter')
    await expect(deleteButtonForDesign(page, 'Row A')).toBeFocused()

    await context.close()
  })

  test('confirmed delete — only row focuses empty message', async ({ browser }) => {
    const context = await newPreparedContext(browser, { width: 1280, height: 800 })
    const page = await context.newPage()
    await gotoAppReady(page)
    await seedDesigns(page, ['Solo'])

    const { dialog } = await openDeleteConfirm(page, 'Solo')
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Enter')
    await expect(dialog.locator('[data-load-empty]')).toBeFocused()

    await context.close()
  })
})

test.describe('Save/Load Load tab — inline delete focus @390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('Escape refocuses Delete without body flash', async ({ browser }) => {
    const context = await newPreparedContext(browser, { width: 390, height: 844, mobile: true })
    const page = await context.newPage()
    await gotoAppReady(page)
    await seedDesigns(page, ['M Escape'])

    const { dialog } = await openDeleteConfirm(page, 'M Escape')
    await expectFocusNotBodyOnFirstRaf(page, () => page.keyboard.press('Escape'))
    await expect(deleteButtonForDesign(page, 'M Escape')).toBeFocused()
    await expect(dialog).toBeVisible()

    await context.close()
  })

  test('keyboard Cancel refocuses Delete without body flash', async ({ browser }) => {
    const context = await newPreparedContext(browser, { width: 390, height: 844, mobile: true })
    const page = await context.newPage()
    await gotoAppReady(page)
    await seedDesigns(page, ['M Cancel'])

    const { dialog } = await openDeleteConfirm(page, 'M Cancel')
    await expectFocusNotBodyOnFirstRaf(page, () => page.keyboard.press('Enter'))
    await expect(deleteButtonForDesign(page, 'M Cancel')).toBeFocused()
    await expect(dialog).toBeVisible()

    await context.close()
  })

  test('Enter on Delete focuses Cancel (not Close); confirm controls reachable via Shift+Tab', async ({ browser }) => {
    const context = await newPreparedContext(browser, { width: 390, height: 844, mobile: true })
    const page = await context.newPage()
    await gotoAppReady(page)
    await seedDesigns(page, ['Mobile One'])

    const { dialog } = await openDeleteConfirm(page, 'Mobile One')
    const cancel = dialog.getByRole('button', { name: 'Cancel', exact: true })
    await expect(cancel).toBeFocused()
    await expect(dialog.getByLabel('Close dialog')).not.toBeFocused()

    await page.keyboard.press('Shift+Tab')
    await expect(dialog.getByRole('button', { name: 'Delete?', exact: true })).toBeFocused()
    await expect(dialog).toBeVisible()

    await context.close()
  })
})