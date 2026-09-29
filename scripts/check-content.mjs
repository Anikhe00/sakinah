#!/usr/bin/env node
// Fails the build if any feeling is missing content or a verse has no Arabic yet.
import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content')
const load = async (f) => JSON.parse(await readFile(join(dir, f), 'utf8'))
const FEELINGS = ['anxious', 'sad', 'lonely', 'overwhelmed', 'tired', 'behind-on-studies', 'unmotivated',
  'angry', 'guilty', 'afraid', 'grateful', 'happy', 'hopeful']
const HADITH = /(Bukhari|Muslim|Abi Dawud|Abu Dawud|Tirmidhi|Ibn Majah|Qur'an)/

const problems = []
const files = { verses: await load('verses.json'), adhkar: await load('adhkar.json'), talks: await load('talks.json') }

for (const [name, data] of Object.entries(files)) {
  for (const key of Object.keys(data)) if (!FEELINGS.includes(key)) problems.push(`${name}: unknown feeling "${key}"`)
  for (const f of FEELINGS) {
    const items = data[f] ?? []
    if (items.length < 2 || items.length > 4) problems.push(`${name}.${f}: has ${items.length} items (want 2–4)`)
    const ids = new Set()
    for (const it of items) {
      if (!it.id) problems.push(`${name}.${f}: item without id`)
      if (ids.has(it.id)) problems.push(`${name}.${f}: duplicate id ${it.id}`)
      ids.add(it.id)
      if (name === 'verses' && (!it.ayat?.length || !it.surah)) problems.push(`verses.${f}.${it.id}: no Arabic yet, run npm run content:quran`)
      if (name !== 'talks' && !it.meaning) problems.push(`${name}.${f}.${it.id}: missing meaning`)
      if (name === 'adhkar') {
        if (!it.arabic) problems.push(`adhkar.${f}.${it.id}: no Arabic${it.quranRef ? ', run npm run content:quran' : ''}`)
        if (!it.transliteration) problems.push(`adhkar.${f}.${it.id}: missing transliteration`)
        if (!HADITH.test(it.source ?? '')) problems.push(`adhkar.${f}.${it.id}: source must name Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah or the Qur'an`)
      }
      if (name === 'talks' && (!it.speaker || !it.topic || !it.query)) problems.push(`talks.${f}.${it.id}: needs speaker, topic and query`)
    }
  }
}

if (problems.length) {
  console.error('Content problems:\n  ' + problems.join('\n  '))
  process.exit(1)
}
console.log('Content OK: every feeling has 2–4 verses, adhkar and talks.')
