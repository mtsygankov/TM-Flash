### TM-Flash v1 — Multi-Deck Specification (Greenfield)

#### Purpose

Greenfield specification for TM-Flash: a lightweight, dependency-free web app for Chinese flashcards with adaptive SRS. This version launches with four hardcoded decks and seamless deck switching. Each deck maintains its own independent statistics. A future “virtual” 5th deck will aggregate the hardest cards across the four decks.

### 1) Overview

- Client-side only (HTML/CSS/Vanilla JS), static hosting ready. Development server runs on http://localhost:8000.
- Mobile-first UI; responsive to desktop. 
- Three views: Review, Statistics, Real-time Search.
- Four selectable decks via deck selector; per-deck stats are isolated per direction (CH->EN and EN->CH).
- Future: virtual “Hardest” deck (composed from the 4 decks) — design included below but not required at launch.

### 2) File Structure and Deck Registry

```
tm-flash/
├─ index.html
├─ styles.css
├─ app.js
└─ decks/
   ├─ deck_a.json   # e.g., Beginner / HSK1
   ├─ deck_b.json   # e.g., Elementary / HSK2
   ├─ deck_c.json   # e.g., Intermediate / HSK3
   └─ deck_d.json   # e.g., Upper-Intermediate / HSK4
```

Deck registry (in app.js):

```js
const DECKS = {
  deck_a: { label: "Deck A", url: "./decks/deck_a.json" },
  deck_b: { label: "Deck B", url: "./decks/deck_b.json" },
  deck_c: { label: "Deck C", url: "./decks/deck_c.json" },
  deck_d: { label: "Deck D", url: "./decks/deck_d.json" }
};
```

All deck JSON files follow the same schema and constraints (see §3).

### 3) Data Model

#### 3.1 Deck JSON Schema

```json
{
  "meta": {
    "version": "1.0",
    "language": "zh-en",
    "deck_name": "Deck A",
    "last_updated": "2025-09-16"
  },
  "cards": [
   {
     "card_id": "uniq_id_001",
     "hanzi": "我 要 咖啡",
     "pinyin": "wǒ yào kāfēi",
     "en_words": ["I", "want", "coffee"],
     "english": "I want coffee"
   }
  ]
}
```

Constraints:

- `card_id` unique within a deck.
- Token counts across `hanzi`, `pinyin`, and `en_words` must match exactly.
- `hanzi` and `pinyin` are space-separated strings.
- `en_words` is an array of strings, one for each corresponding hanzi token.
- All string values are trimmed of whitespace.

Validation behavior:
- Invalid entries are skipped; show a non-blocking error summary (including `card_id` and reason). Display a per-deck “deck errors” count in Statistics.

#### 3.2 LocalStorage Schema

- Key: `tmFlash`
- Versioned for future evolution.

```json
{
  "schema_version": 1,
  "settings": {
    "direction": "CH->EN",     
    "selected_deck": "deck_a",
    "theme": "light"
  },
   "decks": {
     "deck_a": {
       "cards": {
         "uniq_id_001": {
           "directions": {
             "CH->EN": { "correct": 5, "incorrect": 1, "last_reviewed": 1694726400000 },
             "EN->CH": { "correct": 3, "incorrect": 2, "last_reviewed": 1694726400000 }
           }
         }
       },
       "meta_cache": {
         "last_loaded": 1694726400000,
         "deck_name": "Deck A"
       }
     },
     "deck_b": { "cards": {}, "meta_cache": {} },
     "deck_c": { "cards": {}, "meta_cache": {} },
     "deck_d": { "cards": {}, "meta_cache": {} }
   }
}
```

Derived at runtime (per direction):

- `total = correct + incorrect`
- `is_new = (total === 0)`

### 4) Initialization and Deck Sync

On `DOMContentLoaded`:

1. Load or initialize LocalStorage.
2. Determine `settings.selected_deck` (default to the first listed in `DECKS`).
3. Fetch and parse the selected deck JSON.
4. Validate entries (uniqueness, token-count matching). Skip invalid cards and record errors.
5. Build in-memory structures:
- Array of cards for the active deck.
- Map by `card_id`.
- `pinyin_normalized` field per card (Unicode NFD, remove diacritics, lowercase).

6. Sync stats for the active deck only:
- Add missing card entries with directions: `{"directions": {"CH->EN": {correct:0, incorrect:0, last_reviewed:null}, "EN->CH": {correct:0, incorrect:0, last_reviewed:null}}}`.
- Remove stats for missing `card_id`s.

7. Render Review view as default (unflipped).

Session caching (optional):
- Cache parsed decks in memory by deck ID to speed up deck switches.

### 5) SRS (Per-Deck; Simple and Tunable)

Definitions per card per current direction:

- `now_ms = Date.now()`
- `total = correct + incorrect`
- `is_new = total === 0 ? 1 : 0`
- `days_since`:
    - If `is_new`: 14
    - Else: `min(14, (now_ms - last_reviewed) / 86_400_000)`
- `error_rate`:
    - If `is_new`: 1
    - Else: `1 - (correct / total)`

Score:  
$$

{score} = 5.0 * {isnew} + 3.0 * {errorrate} + 0.25 * {dayssince} + \epsilon

$$ 
Where `ε ∈ [0, 0.01)` for tie-breaking.

Select the card with the maximum score over the active deck.

### 6) UI and Views (Deck-Aware)

#### 6.1 Navigation

- Header contains: App title (left), Deck selector (center), Direction toggle (right).
- Views: Review, Statistics, Search (full-screen sections toggled via CSS class).

#### 6.2 Deck Selector

- Dropdown (or segmented control) listing: Deck A, Deck B, Deck C, Deck D.
- On change:
    - Persist `settings.selected_deck`.
    - Load/validate selected deck (use session cache if available).
    - Sync stats for that deck.
    - Reset Review state (unflipped) and select next card via SRS.
- Accessibility: Keyboard-focusable, `aria-label="Select deck"`.

#### 6.3 Review View

- Single HTML table for alignment; 4 rows:
    1. Hanzi (one cell per token)
    2. Pinyin (one cell per token)
    3. English words (one cell per token)
    4. English translation (one cell spanning all columns)
- Direction toggle persists in `settings.direction`:
    - CH->EN: show 1–2 initially; hide 3–4.
    - EN->CH: show 3–4 initially; hide 1–2.
- Flip: Click/tap or Space. Flipped shows all rows. Use CSS `visibility` on `<tr>` to avoid layout shift.
- Mark answer:
    - Correct: green button "Correct", ArrowRight, swipe right.
    - Incorrect: red button "Wrong", ArrowLeft, swipe left.
- On mark: update stats for the active deck and current direction; pick next card; reset flip.

#### 6.4 Statistics View

- For the active deck only by default (stats per direction, with direction selector):
    - Totals: total cards, reviewed cards, new cards, deck errors.
    - Histogram (vertical bars): card-level correct_ratio distribution with buckets 0–20,21–40,41–60,61–80,81–100.
    - Top 10 best and worst by correct_ratio; tie-breaker: `total` desc.
    - Reset learning stats: confirm dialog; clears stats for the active deck and selected direction only (keeps settings).

#### 6.5 Real-time Search View

- Inputs: Hanzi, Pinyin, English (searches `en_words` and `english`).
- Filter on each input change (AND across non-empty fields).
- Pinyin search: tone-insensitive via normalized cache.
- Results: rows with hanzi | pinyin | english. Click to jump to Review with that card with the possibility to return back to same search view easily.

### 7) Usability

- Keyboard:
    - Tab navigation for controls.
    - Space = Flip.
    - ArrowRight = Correct, ArrowLeft = Incorrect (if unflipped, flip first).

### 8) Performance and Offline

- Targets: First load < 2s for ≤ 1000 cards per deck on mid-tier mobile over 4G; interaction latency < 50ms.
- SRS selection O(n) over active deck.
- Optional PWA: cache index.html, styles.css, app.js, and the active deck for offline use. If not implemented, the deck requires network on hard reload.

### 9) Security and Robustness

- Use `textContent` (no `innerHTML`) for deck strings; trim/sanitize inputs.
- Skip invalid cards; show error count and details on demand.
- Basic CSP suggestion: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'`.
- Handle deck fetch errors with retry UI; keep current deck active until a new one is successfully loaded.

### 10) Future: Virtual “Hardest” Deck (Design)

- Virtual deck ID: `virtual_hardest` (computed, not persisted as a separate deck).
- Definition of “hardest” (per direction):
    - `error_rate = 1 - (correct/total)` with `total >= MIN_ANSWERS` (e.g., 3).
    - Rank across all four decks by `error_rate` desc, then `total` desc, then (optionally) `last_reviewed` asc.
    - Select top `K` cards (e.g., 50) as the virtual deck set.
- Behavior when active:
    - Review flow identical; stats updates write back to origin deck via `{deck_id, card_id}`.
    - Search and Stats operate over the virtual set; presented as read-only aggregates.
- Refresh cadence:
    - Recompute on app load, explicit “Refresh hardest set”, and optionally after every N answers while active (e.g., N=25).
- Availability gating:
    - Enable only if combined reviewed cards across all decks ≥ threshold (e.g., 30).

### 11) Error Handling and Edge Cases

- Deck load failure: inline error; keep previous deck; allow retry. If repeated failures, temporarily disable that deck in selector for the session.
- Empty/invalid deck: display “No valid cards in this deck.”
- Switching while flipped: reset flip state.
- Duplicate `card_id` within a deck: skip as invalid; list in errors.
- Identical `card_id` across different decks: allowed; stats are per-deck. For virtual deck, qualify by `{deck_id, card_id}`.

### 12) Performance Considerations

- Each deck ≤ 1000 cards; overall combined can be larger, but only the active deck is processed for SRS.
- Virtual deck size capped by `K` to ensure fast rendering and selection.
- Session cache parsed decks to avoid re-fetch/parsing on switches.

### 13) Testing Plan

- Init: first-run storage creation; default selected deck.
- Deck switching: preserves per-deck stats per direction; direction persists globally.
- Direction toggle: switches display and stats tracking correctly.
- Review: flip/mark flows, keyboard and swipe.
- Stats: histogram bucket math, top/bottom lists, reset (active deck and direction only).
- Search: tone-insensitive pinyin; AND filter logic; jump to Review and back.
- Error cases: invalid token counts, duplicate card IDs, fetch failures.
- Optional PWA: offline behavior for cached assets and active deck.

### 14) Constants (Proposed)

```js
// SRS
const SRS_WEIGHTS = { NEW: 5.0, ERROR: 3.0, DAYS: 0.25 };
const SRS_MAX_DAYS = 14;

// Multi-deck
const DEFAULT_SELECTED_DECK = 'deck_a';

// Virtual deck (future)
const VIRTUAL_DECK_ID = 'virtual_hardest';
const VIRTUAL_TOP_K = 50;
const VIRTUAL_MIN_ANSWERS = 3;
const VIRTUAL_RECOMPUTE_EVERY_N_ANSWERS = 25; // optional
```

### 15) Acceptance Criteria

- User can switch among 4 decks via selector; selection persists across reloads.
- Each deck maintains independent stats per direction; switching does not alter other decks.
- Review, Statistics, and Search operate on the active deck.
- Reset clears only the active deck’s stats for the selected direction; settings are preserved.
- Direction toggle affects review display and stats collection.
- Deck validation skips malformed cards and surfaces an error count.
- Keyboard and swipe interactions work as specified; no layout jumps on flip.