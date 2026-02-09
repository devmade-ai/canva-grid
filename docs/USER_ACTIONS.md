# User Actions Required

This document tracks manual actions that require user intervention (external dashboards, credentials, configuration, etc.).

---

## Set Up Google Analytics 4

**Why:** GA4 tracking code has been added to `index.html` with a placeholder Measurement ID (`G-XXXXXXXXXX`). You need to create a GA4 property and replace the placeholder with your real ID.

**Steps:**

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new GA4 property for Social Ad Creator
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)
4. Replace both instances of `G-XXXXXXXXXX` in `index.html` with your real Measurement ID
5. Deploy the updated site

**After setup:** You'll be able to view `app_install` events in GA4 under Reports > Engagement > Events. The event includes a `method` parameter showing which browser was used (chrome, edge, safari, etc.).
