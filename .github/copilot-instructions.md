<!-- Copilot instructions for TM-Flash codebase -->
# TM-Flash — AI coding assistant instructions

Summary
- Small client-side web app for spaced-repetition flashcards (no backend). Core files live at the repository root and are plain JS/HTML/CSS.

Big picture
- Single-page app loaded from `index.html`. Script load order is important: `constants.js` -> `storage.js` -> `stats.js` -> `srs.js` -> `deckloader.js` -> `deckselector.js` -> `settings.js` -> `review.js` -> `statsview.js` -> `search.js` -> `nav.js` -> `app.js`. Keep that order when adding scripts.
- Data flows: decks are JSON files in `decks/*.json` loaded by `DeckLoader.fetch()`; per-deck user state lives in `localStorage` under key `tmFlash` and is managed by `Storage` and `Stats`.
- Review flow: `App.init()` initializes `Storage`, then `DeckSelector.init()` (loads deck), then `Settings`, `Nav`, `Review`. `Review` renders cards and calls `SRS` to pick next due card; `Stats.updateCardStats()` persists results.

Key files & examples
- `index.html` — entry point and script order. Example: deck selector `<select id="deck-selector">` and review pane `#card-table`.
- `constants.js` — deck registry `DECKS` and default constants (e.g., `DEFAULT_SELECTED_DECK`). Edit carefully; tests and UI expect these names.
- `deckloader.js` — uses `fetch(url)` + timeout and shows an error banner on failure. Use `DeckLoader.fetch(deckId)` when programmatically loading decks.
- `decks/*.json` — deck format example (see `decks/deck_a.json`): top-level `cards` array; each card has `card_id`, `hanzi`, `pinyin`, `en_words` (array of words), and `english` (string). Preserve `en_words` as an array — UI tokenizes by table columns.
- `storage.js` / `stats.js` — localStorage schema: top-level `schema_version` and `settings`, and `decks` mapping. Stats shape per card: each direction (`"CH->EN"` and `"EN->CH"`) contains `total_correct`, `total_incorrect`, `last_correct_at`, `last_incorrect_at`, `correct_streak_len`, `incorrect_streak_len`, and their `_started_at` timestamps. Use `Storage.getDeckStats(deckId)` and `Storage.setDeckStats(deckId, stats)` for reads/writes.
- `srs.js` — selection and scheduling logic lives here. Prefer small, focused changes and include console logs for debugging (the file contains detailed logger statements).

SRS design summary
- Purpose: `srs.js` implements a compact spaced-repetition scheduler used by `Review` to decide which card to show next and when a card is due.
- Interval calculation: `SRS.calculateNextReviewInterval(cardStats)`
	- Uses a small `BASE_INTERVALS` table (hours) e.g. `[0.5, 4, 24, 72, 168, 336, 720, 1440]` representing 30min → 60 days base steps.
	- Interval index is derived from `correct_streak_len` (capped to table length) to pick a base interval.
	- Several modifiers adjust the base interval:
		- Recent incorrects shorten interval strongly (multiplier ~0.3).
		- Accuracy-based modifier for cards with >=3 reviews: high accuracy (>=0.9) increases interval (~1.3×); mid/low accuracy reduces it.
		- Incorrect streaks apply exponential penalty: multiply by 0.5^incorrect_streak_len.
		- Very long correct streaks give a capped bonus (small factor per extra streak above 5).
	- Final interval is clamped between minimum (0.5 hours) and maximum (~2160 hours ≈ 90 days).

- Due check: `SRS.shouldReviewCard(cardStats)` computes last review timestamp and compares now >= last + interval (converted to ms). New cards without timestamps are considered due.

- Selection & priority: `SRS.selectNextCard(cards, statsMap, direction)`
	- Filters the `cards` array with `shouldReviewCard()` to get `dueCards`.
	- Scoring for due cards:
		- New cards (no reviews) get a very high priority (1000).
		- Recent failure / incorrect streaks add priority (500 + 100 × streak_len).
		- Overdue factor: (now - expectedReviewTime) in hours used to add `overdueFactor * 10` to priority.
		- Low accuracy (<0.6) adds a boost proportional to (0.6 - accuracy) × 200.
		- Small random jitter (Math.random() * 5) breaks ties.
	- Returns the highest-scoring card.

Edge cases & implementation notes
- New cards: `Stats.sync(deckId, cards)` creates stat entries; `selectNextCard` treats no-timestamp stats as new and due.
- Missing stats: `selectNextCard` and `shouldReviewCard` defensively build default stat objects when `statsMap[card.card_id]` is missing.
- Time math: `calculateNextReviewInterval` returns hours; conversions to/from ms occur where timestamps are compared.
- Determinism: the algorithm uses randomness to break ties; avoid removing the jitter unless explicitly testing deterministic behavior.

Suggested small tests to validate changes
- Unit tests (manual or quick harness):
	- New card -> `shouldReviewCard` returns true.
	- Card with recent incorrect -> `calculateNextReviewInterval` returns a smaller interval than a similar correct-streak card.
	- Overdue card has higher priority than on-time cards with similar stats.


Developer workflows (discovered)
- Local dev server: the app expects being served over HTTP. Use: `python -m http.server 8000` (or any static server) and open `http://localhost:8000`.
- Manual testing: interact with UI in-browser. Keyboard controls: `Space` flips card, `ArrowRight` marks correct, `ArrowLeft` marks incorrect (only when flipped).
- No automated test harness present. Changes should be validated manually in browser and via console logs.

Project-specific conventions & gotchas
- Script load order matters. Adding a new module requires adding a script tag in `index.html` in the correct position.
- Deck JSON must use `en_words` as an array of tokens; `hanzi` is space-separated tokens that control table columns. `Review.renderCard()` depends on these tokens for layout and scaling.
- `Storage.CURRENT_SCHEMA_VERSION` is used to reset state on mismatch. Changing schema requires migration logic (currently the code resets to defaults on mismatch).
- `Stats.sync(deckId, cards)` is called to create per-card stats entries — don't assume stats exist until sync runs.
- Branching and remote pushes are not used (local-only workflow documented). Commits should be atomic and mention workboard tickets if present.

When making changes
- Preserve public function names used across files (e.g., `DeckLoader.fetch`, `Storage.loadState`, `Stats.updateCardStats`, `SRS.selectNextCard`, `App.init`, `Review.renderCard`).
- For UI changes, prefer non-invasive DOM updates (existing code uses `innerHTML` templates in `Review.renderCard()` and sets `--scale-factor` CSS variable). Maintain escaping via `escapeHtml()`.
- For performance-sensitive code (rendering many cards), follow current approach: minimal DOM nodes, tokenized table structure, and CSS scaling.

Examples to reference in PRs or code edits
- To load a deck: call `await DeckLoader.fetch('deck_a')` which resolves to parsed deck JSON.
- To read user settings: `Storage.getSettings()`; to persist: `Storage.setSettings({ selected_deck: 'deck_b' })`.
- To update stats after an answer: `Stats.updateCardStats(deckId, cardId, 'CH->EN', true)`.

Quick debugging tips
- Open browser console — many modules log detailed debug messages (SRS and Review include verbose logs). Use `localStorage.getItem('tmFlash')` to inspect state.
- If decks fail to load, check `DECKS` in `constants.js` for correct `url` paths and use `DeckLoader.showErrorBanner()` UI for retry.

If anything is unclear
- Tell me which area you'd like expanded (setup, deck format, SRS logic, storage schema, or specific files) and I'll extend these instructions with targeted code examples or migration notes.
