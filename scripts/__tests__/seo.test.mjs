// Requirement: every piece of the discoverability setup is one line that can be
//   deleted with no visible symptom. A preview quietly goes blank; a canonical
//   starts pointing everywhere at once; a rewrite swallows robots.txt. None of
//   it shows up in a build, a page render, or a manual click-through.
//
// Approach: assert over the BUILT output where the artifact is what matters,
//   and over source where the source is what matters. The dist half skips
//   rather than fails when dist/ is absent, so a fresh clone can run the suite —
//   the deploy builds first, so it is live where it counts.
//
// Two things this file does deliberately, both learned the hard way elsewhere
// in the fleet:
//   1. It STRIPS HTML COMMENTS before matching. A regex cannot tell it is
//      inside <!-- -->, and this head is full of explanatory comments that
//      quote tag literals. Without stripping, a presence check passes on a tag
//      that exists only in a comment, and a content check reads the commented
//      copy instead of the real one.
//   2. It reads the card's own PNG header rather than trusting og:image:width.
//      Asserting the literal only proves you can type — a resized card passes
//      green while every unfurl crops.

import { describe, test, expect } from '@jest/globals'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const SITE = 'https://canva-grid.vercel.app'
const TITLE = 'CanvaGrid — design social ads in your browser'

const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '')

const source = stripComments(readFileSync(join(ROOT, 'index.html'), 'utf8'))
const distIndex = join(ROOT, 'dist', 'index.html')
const built = existsSync(distIndex) ? stripComments(readFileSync(distIndex, 'utf8')) : null

const meta = (html, attr, key) =>
  html.match(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="([^"]*)"`))?.[1] ?? null

describe('index.html: identity tags', () => {
  test('title says what the tool is, within budget', () => {
    const title = source.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''
    expect(title).toBe(TITLE)
    expect(title).not.toBe('CanvaGrid') // the bare brand token this replaced
    expect(title.length).toBeLessThanOrEqual(60)
  })

  test('title, og:title and twitter:title say one thing', () => {
    expect(meta(source, 'property', 'og:title')).toBe(TITLE)
    expect(meta(source, 'name', 'twitter:title')).toBe(TITLE)
  })

  test('description is identical across the three surfaces', () => {
    const d = meta(source, 'name', 'description')
    expect(d.length).toBeGreaterThan(50)
    expect(meta(source, 'property', 'og:description')).toBe(d)
    expect(meta(source, 'name', 'twitter:description')).toBe(d)
  })

  test('declares a self-referencing canonical', () => {
    expect(source).toContain(`<link rel="canonical" href="${SITE}/" />`)
  })

  test('carries every tag an unfurler reads', () => {
    for (const key of ['og:type', 'og:site_name', 'og:url', 'og:image', 'og:image:alt']) {
      expect(meta(source, 'property', key)).toBeTruthy()
    }
    expect(meta(source, 'name', 'twitter:card')).toBe('summary_large_image')
  })

  test('og:image and og:url are absolute', () => {
    // Facebook's crawler rejects a relative og:image outright.
    expect(meta(source, 'property', 'og:image').startsWith('https://')).toBe(true)
    expect(meta(source, 'property', 'og:url').startsWith('https://')).toBe(true)
  })

  test('each identity tag appears exactly once', () => {
    // A rewrite that ADDS a tag rather than replacing one satisfies every
    // presence check above while shipping two contradictory answers.
    for (const literal of ['<title>', '<link rel="canonical"', '<meta property="og:title"']) {
      expect(source.split(literal).length - 1).toBe(1)
    }
  })
})

describe('structured data', () => {
  const block = source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]

  test('is present and parses', () => {
    expect(block).toBeTruthy()
    expect(() => JSON.parse(block)).not.toThrow()
  })

  test('describes the app, @id-joined to the site and publisher', () => {
    const graph = JSON.parse(block)
    expect(graph['@context']).toBe('https://schema.org')
    const types = graph['@graph'].map((n) => n['@type'])
    expect(types).toContain('WebApplication')
    expect(types).toContain('WebSite')
    expect(types).toContain('Organization')
    const app = graph['@graph'].find((n) => n['@type'] === 'WebApplication')
    expect(app.isPartOf['@id']).toBe(`${SITE}/#website`)
  })

  test('contains no literal </script, which would truncate the head', () => {
    expect(block).not.toMatch(/<\/script/i)
  })
})

describe('robots.txt and sitemap.xml', () => {
  const robots = readFileSync(join(ROOT, 'public', 'robots.txt'), 'utf8')
  const sitemap = readFileSync(join(ROOT, 'public', 'sitemap.xml'), 'utf8')

  test('allows the crawl and disallows nothing', () => {
    // A Disallow here would also switch off the unfurlers the card exists for:
    // facebookexternalhit, Twitterbot, LinkedInBot and Slack all honour it.
    expect(robots).toMatch(/^Allow: \/$/m)
    expect(robots).not.toMatch(/^Disallow:\s*\S/m)
  })

  test('names the sitemap at an absolute URL', () => {
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`)
  })

  test('sitemap lists every URL the app serves, and no more', () => {
    const locs = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1])
    expect(locs).toEqual([`${SITE}/`])
  })
})

describe('the SPA rewrite must not swallow real files', () => {
  const rewrites = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8')).rewrites

  test('excludes any path carrying a file extension', () => {
    // Before this, GET /robots.txt returned 200 with the app's HTML — the file
    // did not exist and the catch-all answered for it. Same for sitemap.xml,
    // and it also turned every missing asset into a soft 200.
    const catchAll = rewrites.find((r) => r.destination === '/index.html')
    expect(catchAll).toBeTruthy()
    expect(catchAll.source).toContain('(?!.*\\.[a-zA-Z0-9]+$)')
  })
})

describe('the card is really 1200x630', () => {
  const card = join(ROOT, 'public', 'og-card.png')

  test('exists and is a PNG of the declared size', () => {
    expect(existsSync(card)).toBe(true)
    const buf = readFileSync(card)
    expect(buf.subarray(1, 4).toString()).toBe('PNG')
    // IHDR: width and height are the two big-endian uint32s at byte 16.
    expect(buf.readUInt32BE(16)).toBe(1200)
    expect(buf.readUInt32BE(20)).toBe(630)
  })

  test('matches what the head declares', () => {
    const buf = readFileSync(card)
    expect(meta(source, 'property', 'og:image:width')).toBe(String(buf.readUInt32BE(16)))
    expect(meta(source, 'property', 'og:image:height')).toBe(String(buf.readUInt32BE(20)))
  })
})

const describeBuilt = built ? describe : describe.skip

describeBuilt('built output: the document a crawler receives', () => {
  test('carries crawlable body text INSIDE the mount point', () => {
    // Asserting inside the container matters: the headline is also in <title>
    // and og:title, so a whole-file search for it passes on a page whose body
    // was never injected.
    const root = built.match(/<div id="root">([\s\S]*?)<\/div>\s*<script/)?.[1] ?? ''
    const text = root.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    expect(text.length).toBeGreaterThan(400)
    expect(text).toContain('CanvaGrid')
  })

  test('landing copy stays in step with the head', () => {
    for (const phrase of ['LinkedIn', 'Instagram', 'TikTok']) {
      expect(built).toContain(phrase)
    }
  })
})
