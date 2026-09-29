# Sakinah

*سكينة: tranquillity sent down on the heart.*

A quiet, mobile-first web app. You say how your heart feels right now and get a Qur'an verse, a dhikr or dua, or an Islamic talk for that feeling. You can save any of them to a private log that stays on your device.

- React + Vite + TypeScript, Tailwind CSS v4
- Installable PWA that works fully offline once it has loaded (talk links need a connection)
- Log stored in IndexedDB through Dexie, behind a small `LogRepository` interface

## Run it

Needs Node 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build and a local preview of it (the service worker only runs in this mode):

```bash
npm run build      # checks the content, type-checks, builds to dist/
npm run preview    # http://localhost:4173
```

To install it on your phone, deploy `dist/` to any static host with HTTPS (Netlify, Vercel, Cloudflare Pages, GitHub Pages). Open it in Safari on iOS and choose **Share → Add to Home Screen**, or in Chrome on Android choose **Install app**. After the first visit it opens and works offline.

## How the content works

Everything the app shows lives in `src/content`, as JSON keyed by feeling. Each feeling should have 2 to 4 items of each type, and `npm run build` fails if one doesn't.

| File | Holds |
| --- | --- |
| `verses.json` | Qur'an verses: reference, your own paraphrased meaning, and the Arabic filled in by the script |
| `adhkar.json` | Adhkar and duas: Arabic, transliteration, meaning, source, and a repeat count when there is one |
| `talks.json` | Talks: speaker, topic, and the search phrase used for the YouTube and Spotify links |
| `provenance.json` | Written by the script. Records where the Arabic came from |

The feeling keys are `anxious`, `sad`, `lonely`, `overwhelmed`, `tired`, `behind-on-studies`, `unmotivated`, `angry`, `guilty`, `afraid`, `grateful`, `happy`, `hopeful`. They're defined in `src/lib/feelings.ts`.

### Qur'an Arabic is never typed by hand

`scripts/fetch-quran.mjs` writes every piece of Qur'an Arabic in the app, for verses and for adhkar whose words come from the Qur'an. It works like this:

1. It asks the **Quran.com API v4** for `text_uthmani` by surah and ayah.
2. If the API can't be reached, it uses **QUL Uthmani**, the Tarteel dataset behind Quran.com, which is bundled in the `quran-validator` dev dependency.
3. It checks every ayah, letter by letter with the vowel marks set aside, against the **King Fahd Complex Uthmani text** from QuranEnc (the `quran-json` dev dependency). If the two disagree, it stops with an error.

```bash
npm run content:quran              # uses Quran.com when reachable
npm run content:quran -- --offline # bundled QUL text only
```

The script rewrites `verses.json` and `adhkar.json` in place. It only touches the `surah`, `ayat` and `arabic` fields.

### Add a verse

1. Open `src/content/verses.json` and add an item under each feeling it suits:

   ```json
   {
     "id": "v-2-153",
     "ref": "2:153",
     "meaning": "You who believe, seek help through patience and prayer. Allah is with those who are patient."
   }
   ```

   - `ref` is one ayah (`"2:153"`) or a range inside one surah (`"94:5-8"`).
   - `meaning` is a plain paraphrase in your own words. Please don't paste a published translation.
   - To show only part of a long ayah, add `"excerpt": { "from": "ومن يتق الله" }` and/or `"to": "..."`. Write the words in ordinary Arabic spelling. The script finds them in the Uthmani text and cuts there, and the card marks the reference as "(part)".
   - Reuse the same `id` if the verse appears under more than one feeling.

2. Run `npm run content:quran`. The script adds `surah` and `ayat`.
3. Run `npm run content:check`, or just `npm run build`.

### Add a dhikr or dua

Add an item to `src/content/adhkar.json` under each feeling it suits:

```json
{
  "id": "d-la-hawla",
  "title": "La hawla wa la quwwata illa billah",
  "arabic": "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
  "transliteration": "La hawla wa la quwwata illa billah.",
  "meaning": "There is no power and no strength except through Allah.",
  "source": "Sahih al-Bukhari 6384; Sahih Muslim 2704",
  "repeat": 100,
  "repeatNote": "in a day"
}
```

- `source` must name Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami' at-Tirmidhi, Sunan Ibn Majah, or the Qur'an. The content check enforces this.
- `repeat` (a number) and `repeatNote` (free text, for example "morning and evening") are optional.
- If the words are from the Qur'an, leave out `arabic` and add `"quranRef": "21:87"` plus an optional `excerpt`. Then run `npm run content:quran` to fill in the Arabic.

"Allahumma la sahla" was on the original list. It isn't included because its sources (Ibn Hibban, Ibn as-Sunni) are outside the five collections above.

### Add a talk

```json
{ "id": "t-omar-suleiman-burnout", "speaker": "Omar Suleiman", "topic": "burnout", "query": "Omar Suleiman burnout" }
```

The card shows "Omar Suleiman on burnout" with links that search YouTube and Spotify for `query`.

## Moving the log to Supabase later

The UI only uses the `LogRepository` interface in `src/data/LogRepository.ts`:

```ts
interface LogRepository {
  add(entry: NewLogEntry): Promise<LogEntry>
  list(): Promise<LogEntry[]>         // newest first
  get(id: string): Promise<LogEntry | undefined>
  remove(id: string): Promise<void>
}
```

To switch, write `src/data/supabaseRepository.ts` that implements it (for example, a `log_entries` table with `id`, `feeling`, `note`, `created_at` and a `content` jsonb column), then change the one line in `src/data/index.ts`. Each entry stores a snapshot of what was shown, so old entries still reopen after content edits.

## Project layout

```
scripts/
  fetch-quran.mjs      fills Qur'an Arabic into the content files
  check-content.mjs    checks counts, sources and missing Arabic (runs on build)
public/                favicon and PWA icons
src/
  content/             verses.json, adhkar.json, talks.json, types.ts, index.ts
  data/                LogRepository interface and the Dexie implementation
  lib/                 feelings, picking (no repeats), week counts, theme, routing
  components/          FeelingChips, ResultCard, TabBar, ThemeToggle
  pages/               Today, Log, Entry
```

## Design notes

- Colours are CSS variables in `src/index.css` (misty teal-green, ink blue, teal accent, muted gold), with a dark set. The theme button in the header switches between device, light and dark.
- Fonts are self-hosted through Fontsource, so they work offline: Amiri for Arabic, Newsreader for meanings, Instrument Sans for the interface.
- Reduced motion is respected, keyboard focus is always visible, and every tap target is at least 44px.
