// Requirement: a pasted CanvaGrid link must render as a card, not a bare URL.
//
// Approach: one site-wide 1200×630 (1.91:1) PNG, generated from the same
//   icon.svg the app icons come from, composited onto the brand plate. Committed
//   to public/ so the deploy is a plain file copy.
//
// Why NOT reuse the square app icon: every platform expecting 1.91:1 either
//   crops it or letterboxes it, and it reads as a mistake. Different ratio,
//   different asset — see APP_ICONS.md vs DISCOVERABILITY.md.
//
// Why NO text in the image: sharp rasterises SVG text through fontconfig, which
//   cannot load .woff2 webfonts, so a wordmark silently renders in whatever
//   system font exists and ships in the wrong typeface. For a single site-wide
//   card the words belong in og:title / og:description, which every unfurler
//   renders itself, beside the image. (That default inverts for PER-ITEM cards,
//   where the headline is the entire point — not the case here, CanvaGrid has
//   one page.)
//
// Run: automatically, as part of `npm run prebuild`.

import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

const WIDTH = 1200
const HEIGHT = 630
// The mark occupies a little over half the height, centred, leaving generous
// margin — unfurlers crop the edges at some sizes, and a card that fills its
// frame is the one that gets clipped.
const MARK = 340
// DaisyUI lofi neutral, matching the manifest theme_color so the card and the
// installed app read as the same product.
const PLATE = '#f4f4f5'

async function generate() {
  const svg = readFileSync(resolve(publicDir, 'icon.svg'))
  const mark = await sharp(svg, { density: 400 }).resize(MARK, MARK).png().toBuffer()

  // Two passes: sharp applies .composite() at the END of its pipeline, so
  // chaining .flatten() alongside it runs BEFORE the mark lands and yields a
  // blank plate. Composite to a buffer, then strip alpha.
  const composited = await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 4, background: PLATE },
  })
    .composite([{ input: mark, gravity: 'centre' }])
    .png()
    .toBuffer()

  const out = resolve(publicDir, 'og-card.png')
  await sharp(composited).flatten({ background: PLATE }).png().toFile(out)

  // Assert the emitted file, not the numbers we asked for. A declared
  // og:image:width only ever proves you can type; the tripwire reads this PNG's
  // own header, and so does this.
  const meta = await sharp(out).metadata()
  if (meta.width !== WIDTH || meta.height !== HEIGHT) {
    throw new Error(`og-card.png is ${meta.width}×${meta.height}, expected ${WIDTH}×${HEIGHT}`)
  }
  console.log(`  og-card.png (${meta.width}x${meta.height}, mark ${MARK}px on ${PLATE})`)
}

generate().catch((err) => {
  console.error('OG card generation failed:', err)
  process.exit(1)
})
