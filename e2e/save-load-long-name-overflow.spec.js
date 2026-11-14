// Requirement: Long saved design names must not overflow Save/Load or clip row actions.
// Approach: Save 300-char name; assert dialog and Delete control stay within viewport.

import { test, expect } from '@playwright/test'
import {
  deleteButtonForDesign,
  expectDialogNoHorizontalOverflow,
  expectFullyInViewport,
  gotoAppReady,
  newPreparedContext,
  saveDesignFromModal,
} from './helpers/browser.js'

const LONG_NAME = 'x'.repeat(300)

async function assertLongNameRowLayout(page, designName) {
  const dialog = page.getByRole('dialog')
  await expectDialogNoHorizontalOverflow(dialog)

  const row = page.getByRole('button', { name: `Load design "${designName}"` })
  await expect(row).toBeVisible()
  await expectFullyInViewport(row)

  const deleteBtn = deleteButtonForDesign(page, designName)
  await expect(deleteBtn).toBeVisible()
  await expectFullyInViewport(deleteBtn)

  const titleAttr = await row.locator('.truncate').first().getAttribute('title')
  expect(titleAttr).toBe(designName)
}

test.describe('Save/Load — long design name layout @1280', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('300-char saved name truncates; dialog and Delete stay in viewport', async ({ browser }) => {
    const context = await newPreparedContext(browser, { width: 1280, height: 800 })
    const page = await context.newPage()
    await gotoAppReady(page)
    await saveDesignFromModal(page, LONG_NAME)
    await assertLongNameRowLayout(page, LONG_NAME)
    await context.close()
  })
})

test.describe('Save/Load — long design name layout @390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('300-char saved name truncates; dialog and Delete stay in viewport', async ({ browser }) => {
    const context = await newPreparedContext(browser, { width: 390, height: 844, mobile: true })
    const page = await context.newPage()
    await gotoAppReady(page)
    await saveDesignFromModal(page, LONG_NAME)
    await assertLongNameRowLayout(page, LONG_NAME)
    await context.close()
  })
})