#!/usr/bin/env node
/**
 * Fills in the exact Qur'an Arabic for every verse in src/content/verses.json
 * and every Qur'anic dhikr in src/content/adhkar.json.
 *
 * You only write the reference (and your own paraphrased meaning); this script
 * writes the Arabic. Never type Qur'an Arabic by hand.
 *
 * Sources, tried in order:
 *   1. Quran.com API v4, `text_uthmani`            (network)
 *   2. QUL Uthmani, the Tarteel / Quran.com dataset (offline, via the
 *      `quran-validator` dev dependency)
 * Every ayah is then cross-checked, letter skeleton only, against the King Fahd
 * Complex Uthmani text published by QuranEnc (the `quran-json` dev dependency).
 * The script stops with an error if the two disagree.
 *
 * Usage:  npm run content:quran            (use network when reachable)
 *         npm run content:quran -- --offline
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'src', 'content')
const offline = process.argv.includes('--offline')

const pkgFile = (pkg, rel) => join(root, 'node_modules', pkg, rel)
const readJson = async (p) => JSON.parse(await readFile(p, 'utf8'))

// ---------- sources ----------

const qulVerses = await readJson(pkgFile('quran-validator', 'data/quran-verses.json'))
const qulSurahs = await readJson(pkgFile('quran-validator', 'data/quran-surahs.json'))
const qulByKey = new Map(qulVerses.map((v) => [`${v.surah}:${v.ayah}`, v.text]))
const kfgqpc = await readJson(pkgFile('quran-json', 'dist/quran.json'))

let networkOk = !offline
const used = new Set()

async function fromQuranCom(key) {
  if (!networkOk) return null
  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_key/${key}?fields=text_uthmani`,
      { signal: AbortSignal.timeout(8000) },
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json?.verse?.text_uthmani ?? null
  } catch (err) {
    console.warn(`Quran.com API unreachable (${err.message}); using the bundled QUL text instead.`)
    networkOk = false
    return null
  }
}

async function ayahText(surah, ayah) {
  const key = `${surah}:${ayah}`
  const remote = await fromQuranCom(key)
  if (remote) {
    used.add('Quran.com API v4 (text_uthmani)')
    return remote.trim()
  }
  const local = qulByKey.get(key)
  if (!local) throw new Error(`No ayah ${key}`)
  used.add('QUL Uthmani by Tarteel (bundled in quran-validator)')
  return local.trim()
}

// ---------- matching helpers ----------

// Reduce Arabic to a loose letter skeleton so different orthographies compare equal.
function skeleton(s) {
  return s
    .normalize('NFC')
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[اء]/g, '')
    .replace(/[^ء-ي]/g, '')
}

const tokens = (text) => text.split(/\s+/).filter(Boolean)
const isWord = (t) => skeleton(t).length > 0

function findPhrase(toks, phrase, label) {
  const target = skeleton(phrase)
  for (let i = 0; i < toks.length; i++) {
    if (!isWord(toks[i])) continue
    let acc = ''
    for (let j = i; j < toks.length; j++) {
      acc += skeleton(toks[j])
      if (acc === target) return [i, j]
      if (!target.startsWith(acc)) break
    }
  }
  throw new Error(`${label}: could not find "${phrase}" in the ayah`)
}

/** Cut an ayah to start at `from` and/or end after `to` (both plain Arabic phrases). */
function excerpt(text, { from, to } = {}, label) {
  let toks = tokens(text)
  if (from) toks = toks.slice(findPhrase(toks, from, label)[0])
  if (to) toks = toks.slice(0, findPhrase(toks, to, label)[1] + 1)
  // Drop stray pause marks left at the edges.
  while (toks.length && !isWord(toks[0])) toks.shift()
  while (toks.length && !isWord(toks[toks.length - 1])) toks.pop()
  return toks.join(' ')
}

function crossCheck(surah, ayah, text) {
  const other = kfgqpc[surah - 1]?.verses?.[ayah - 1]?.text
  if (!other) throw new Error(`Cross-check text missing for ${surah}:${ayah}`)
  if (skeleton(other) !== skeleton(text)) {
    throw new Error(
      `Cross-check failed for ${surah}:${ayah}\n  primary: ${text}\n  KFGQPC:  ${other}`,
    )
  }
}

function parseRef(ref) {
  const m = /^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/.exec(ref.trim())
  if (!m) throw new Error(`Bad ref "${ref}" (use "2:286" or "94:5-8")`)
  const surah = Number(m[1])
  const first = Number(m[2])
  const last = m[3] ? Number(m[3]) : first
  const meta = qulSurahs.find((s) => s.number === surah)
  if (!meta || first < 1 || last < first || last > meta.versesCount) {
    throw new Error(`Ref "${ref}" is out of range`)
  }
  return { surah, first, last, meta }
}

const cache = new Map()
async function resolve(ref, ex, label) {
  const cacheKey = JSON.stringify([ref, ex ?? null])
  if (cache.has(cacheKey)) return cache.get(cacheKey)
  const { surah, first, last, meta } = parseRef(ref)
  const ayat = []
  for (let n = first; n <= last; n++) {
    const full = await ayahText(surah, n)
    crossCheck(surah, n, full)
    let text = full
    if (ex?.from && n === first) text = excerpt(text, { from: ex.from }, label)
    if (ex?.to && n === last) text = excerpt(text, { to: ex.to }, label)
    ayat.push({ ayah: n, text })
  }
  const out = {
    surah: { number: surah, name: meta.englishName, arabicName: meta.name },
    ayat,
  }
  cache.set(cacheKey, out)
  return out
}

// ---------- fill content ----------

const versesPath = join(contentDir, 'verses.json')
const adhkarPath = join(contentDir, 'adhkar.json')
const verses = await readJson(versesPath)
const adhkar = await readJson(adhkarPath)

let count = 0
for (const [feeling, items] of Object.entries(verses)) {
  for (const item of items) {
    const { surah, ayat } = await resolve(item.ref, item.excerpt, `${feeling}/${item.id}`)
    item.surah = surah
    item.ayat = ayat
    count++
  }
}

for (const [feeling, items] of Object.entries(adhkar)) {
  for (const item of items) {
    if (!item.quranRef) continue
    const { ayat } = await resolve(item.quranRef, item.excerpt, `${feeling}/${item.id}`)
    item.arabic = ayat.map((a) => a.text).join(' ')
    count++
  }
}

const stamp = (obj) => JSON.stringify(obj, null, 2) + '\n'
await writeFile(versesPath, stamp(verses))
await writeFile(adhkarPath, stamp(adhkar))
await writeFile(
  join(contentDir, 'provenance.json'),
  stamp({
    generatedBy: 'scripts/fetch-quran.mjs',
    arabicSource: [...used],
    crossCheckedAgainst: "King Fahd Complex Uthmani text via QuranEnc (quran-json)",
  }),
)
console.log(`Filled Arabic for ${count} items from: ${[...used].join(', ')}`)
