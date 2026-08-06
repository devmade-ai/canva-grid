// Requirement: the served document must contain real, readable text about what
//   CanvaGrid is.
//
// Why: measured on the deployed origin, the document had ZERO crawlable body
//   text — everything is client-rendered into an empty mount point, so a crawler
//   that does not execute JavaScript, and EVERY unfurler, saw nothing but the
//   head. Perfect head tags over an empty <div id="root"> make a link preview
//   well and a page indexable not at all.
//
// Approach: inject this markup INTO the mount point at build time
//   (vite.config.js → seoLandingHtml). React's first render replaces the
//   container's children, so the handoff needs no removal step, no flag, and no
//   third moving part that can break — the app owning #root is what clears it.
//
// It is also the no-JS fallback and the first paint, so it is written to be
//   read by a person, not stuffed for a crawler.
//
// Keep in sync with index.html's description and og:description — the tripwire
//   in scripts/__tests__/seo.test.ts asserts the load-bearing phrases appear
//   here, so rewording the pitch in one place and not the other fails the build
//   rather than silently drifting.

export const SEO_LANDING_HTML = `
    <main class="seo-landing">
      <h1>CanvaGrid — design social ads in your browser</h1>
      <p>
        CanvaGrid is a free, browser-based design tool for social media
        advertising. Build a layout once and export it at every size the
        platforms ask for, without installing anything and without an account.
      </p>
      <h2>What you can make</h2>
      <ul>
        <li>LinkedIn single-image and carousel ads</li>
        <li>Facebook and Instagram feed posts, stories and reels covers</li>
        <li>Twitter/X post images and header cards</li>
        <li>TikTok covers and vertical story frames</li>
      </ul>
      <h2>How it works</h2>
      <ul>
        <li>Pick a grid, drop in images, and set type and colour per cell.</li>
        <li>Overlay gradients or solid washes per image or per cell.</li>
        <li>Export a single image, the whole set as a ZIP, or a print-ready PDF.</li>
      </ul>
      <p>
        Everything runs on your own device. Your images are not uploaded to a
        server, and the app keeps working offline once it has loaded.
      </p>
    </main>
`
