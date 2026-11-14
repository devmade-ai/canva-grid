// Requirement: E2E against production build + preview (not dev server).
// Approach: webServer runs build then preview; Playwright uses bundled Chrome.
// Alternatives:
//   - puppeteer-core only: Rejected — task requires Playwright for real-Chromium e2e.

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: 'chrome',
    trace: 'off',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
}