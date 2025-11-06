### TM-Flash v1 — Agentic Development Workboard (Greenfield)

This workboard lists atomic, agent-friendly tickets to build TM-Flash v1 per the greenfield multi-deck specification. Each ticket has clear deliverables, acceptance criteria, and dependencies.

**Git Workflow Note:** Only commit results of ticket implementations. Do not commit debug logs, temporary fixes, styling changes, or other modifications unless they are explicitly part of a ticket's deliverables. Use `git reset` or `git revert` to clean the history if non-ticket changes are accidentally committed.
Pinned Invariants (keep in context)

- Tech: Vanilla HTML/CSS/JS only. No frameworks.
- Files: index.html, styles.css, app.js, decks/deck_a.json, deck_b.json, deck_c.json, deck_d.json.
- Storage key: tmFlash; schema_version: 1.
- Card fields: card_id, hanzi, pinyin, def_words, def.
- Direction settings: "CH⇆EN" | "EN⇆CH" (global; internal keys: "CH->EN" | "EN->CH").
- SRS: weights NEW=5.0, ERROR=3.0, DAYS=0.25; SRS_MAX_DAYS=14.
- Four decks; per-deck stats isolated per direction (CH->EN and EN->CH).

---

EPIC 1 — Bootstrap & Scaffolding

Ticket W-001 — Project Skeleton [DONE]
- Description: Create minimal project structure and base HTML/CSS/JS files.
- Deliverables:
    - index.html with header (app title, deck selector placeholder, direction toggle placeholder) and three empty sections: #view-review, #view-stats, #view-search.
    - styles.css with base layout, typography, and utility classes for hidden/visible views.
    - app.js with App.init() stub and console log.
- Acceptance Criteria:
    - Project loads in browser with visible header and three tabs (static placeholders ok).
    - No console errors.
- Dependencies: None.

Ticket W-002 — View Navigation Toggle [DONE]
- Description: Implement simple tab navigation to show/hide the three sections.
- Deliverables:
    - Tab buttons in header (Review, Stats, Search) with active state.
    - JS functions: Nav.init(), Nav.show(viewId), CSS class .is-hidden.
- Acceptance Criteria:
    - Clicking each tab shows the corresponding section and hides others.
    - URL does not need routing; state persists until reload.
- Dependencies: W-001.


Ticket W-003 — Constants and Deck Registry [DONE]
- Description: Define global constants and the four-deck registry.
- Deliverables:
    - In app.js: DECKS map with 4 entries (deck_a..deck_d) and URLs.
    - Constants: SRS_WEIGHTS, SRS_MAX_DAYS, DEFAULT_SELECTED_DECK.
- Acceptance Criteria:
    - console.log lists the deck registry on App.init().
- Dependencies: W-001.

---

EPIC 2 — Storage & Settings

Ticket W-010 — LocalStorage Schema Init [DONE]
- Description: Implement storage module with schema_version=1 and default settings.
- Deliverables:
    - Storage object with: loadState(), saveState(), getSettings(), setSettings(), getDeckStats(deckId), setDeckStats(deckId, statsObj).
      - Default state: { schema_version:1, settings:{ direction:DIRECTION_KEYS.CH_TO_EN, selected_deck: DEFAULT_SELECTED_DECK, theme:"light" }, decks:{ deck_a:{cards:{}}, deck_b:{cards:{}}, deck_c:{cards:{}}, deck_d:{cards:{}} } } (cards entries will have directions: { [DIRECTION_KEYS.CH_TO_EN]: {correct:0, incorrect:0, last_reviewed:null}, [DIRECTION_KEYS.EN_TO_CH]: {...} }).
- Acceptance Criteria:
    - On first run, tmFlash key is created matching the schema.
    - Subsequent runs read and preserve values.
- Dependencies: W-003.


Ticket W-011 — Direction Toggle Persistence [DONE]
- Description: Implement UI control for direction and persist in storage.
- Deliverables:
    - Toggle UI in header.
    - JS: Settings.applyDirection(), Settings.toggleDirection().
- Acceptance Criteria:
    - Toggling updates UI and storage; reload preserves last selection.
- Dependencies: W-010.

---

EPIC 3 — Deck Loading & Validation

Ticket W-020 — Deck Fetch with Retry [DONE]
- Description: Load deck JSON by selected_deck with timeout and retry UI.
- Deliverables:
    - DeckLoader.fetch(deckId) returning parsed JSON or error.
    - Inline error banner with Retry button.
- Acceptance Criteria:
    - Successful fetch stores deck JSON in memory.
    - Network failure shows banner; Retry works.
- Dependencies: W-010.

Ticket W-021 — Deck Validation [DONE]
- Description: Validate uniqueness of card_id and token-count equality across hanzi/pinyin/def_words.
- Deliverables:
    - Validator.validate(deckJson) → { validCards, errors$$$$ }.
    - Error summary UI (non-blocking) and per-deck error count stored for Stats.
- Acceptance Criteria:
    - Invalid cards are skipped; errors list includes card_id and reason.
- Dependencies: W-020.

Ticket W-022 — Pinyin Normalization Cache [DONE]
- Description: Add pinyin_normalized (NFD diacritics removed, lowercase) to in-memory cards.
- Deliverables:
    - Normalizer.normalizePinyin(str) utility.
    - Augment cards with pinyin_normalized on load.
- Acceptance Criteria:
    - "wǒ yào kāfēi" → "wo yao kafei" verified via console tests.
- Dependencies: W-021.

Ticket W-023 — Stats Sync (Per-Deck) [DONE]
- Description: Align storage stats with the validated card set for the active deck, per direction.
- Deliverables:
    - Stats.sync(deckId, cards) adds missing entries with directions { [DIRECTION_KEYS.CH_TO_EN]: {correct:0, incorrect:0, last_reviewed:null}, [DIRECTION_KEYS.EN_TO_CH]: {...} } and removes orphaned ones.
- Acceptance Criteria:
    - After sync, stats map size equals valid card count; no stale IDs.
- Dependencies: W-021.

---

EPIC 4 — Deck Selector & Navigation Wiring

Ticket W-030 — Deck Selector UI & Behavior [DONE]
- Description: Implement deck dropdown/segmented control bound to settings.selected_deck.
- Deliverables:
    - UI control in header rendering DECKS labels.
    - onChange handler: persist selection → fetch/validate → sync → reset Review view.
- Acceptance Criteria:
    - Switching decks updates header label, loads the new deck, and shows first SRS-selected card.
    - Selection persists across reloads.
- Dependencies: W-022, W-023, W-002.

---

EPIC 5 — SRS Engine

Ticket W-040 — Scoring Function [DONE]
- Description: Implement scoreCard(stat) per spec, for current direction.
- Deliverables:
    - JS function scoreCard({correct, incorrect, last_reviewed}) for the active direction.
- Acceptance Criteria:
    - Unit-like tests in console: new > old; higher error_rate > lower; more days_since (clamped) increases score.
- Dependencies: W-023.

Ticket W-041 — Next-Card Selection [DONE]
- Description: Implement selectNextCard(cards, statsMap, direction) returning the max-score card based on current direction stats.
- Deliverables:
    - JS function selectNextCard(); epsilon tie-breaker.
- Acceptance Criteria:
    - Deterministic with seeds aside from small epsilon; manual tests pass.
- Dependencies: W-040.

---

EPIC 6 — Review View

Ticket W-050 — Card Table Rendering [DONE]
- Description: Render the 4-row table with aligned tokens and translation colspan.
- Deliverables:
    - renderCard(card), tokenization by single space; sanitize via textContent.
    - CSS to prevent layout shift.
- Acceptance Criteria:
    - For sample "我 要 咖啡" rows align; no jumps when toggling rows.
- Dependencies: W-030, W-041.

Ticket W-051 — Direction & Flip State [DONE]
- Description: Implement unflipped/flipped visibility per direction; Space to flip.
- Deliverables:
    - applyFlipState(flipped), applyDirection(direction).
- Acceptance Criteria:
    - CH⇆EN shows rows 1–2 unflipped; EN⇆CH shows rows 3–4; flipped shows all.
- Dependencies: W-050, W-011.

Ticket W-052 — Answer Capture & Advance [DONE]
- Description: Correct/Incorrect buttons, ArrowRight/Left, swipe right/left; update stats and advance.
- Deliverables:
    - Handlers: onCorrect(), onIncorrect(), swipe detectors scoped to card.
      - Stats update: increment counters for current direction, set last_reviewed=Date.now().
- Acceptance Criteria:
    - Marking updates storage for active deck, resets flip, and shows next SRS card.
- Dependencies: W-051, W-041, W-023.

---

EPIC 7 — Statistics View

Ticket W-060 — Aggregations & Metrics [DONE]
- Description: Compute totals and per-card correct_ratio for active deck and direction.
- Deliverables:
    - Metrics: totalCards, reviewedCount, newCount, deckErrors.
- Acceptance Criteria:
    - Numbers match known small fixtures.
- Dependencies: W-023.

Ticket W-063 — Direction Selector in Stats View [DONE]
- Description: Add direction toggle in stats view to switch between CH⇆EN and EN⇆CH stats display.
- Deliverables:
    - UI toggle in #view-stats; onChange rerenders metrics/histogram/top lists for selected direction.
- Acceptance Criteria:
    - Toggling updates all stats displays; defaults to current global direction.
- Dependencies: W-060, W-011.

Ticket W-061 — Histogram & Top Lists [DONE]
- Description: Render histogram buckets 0–20,21–40,41–60,61–80,81–100 and top 10 best/worst for active direction.
- Deliverables:
    - Simple CSS bars or canvas; lists with hanzi + def + stats.
- Acceptance Criteria:
    - Correct bucket counts; sorting as specified with tie-breaker by total desc.
- Dependencies: W-060.

Ticket W-062 — Reset Active Deck Stats [DONE]
- Description: Confirm dialog; clear stats for current deck and direction; preserve settings; rerender.
- Deliverables:
    - resetCurrentDeckStats() and UI button.
- Acceptance Criteria:
    - After reset, all cards become new; direction and selected deck unchanged.
- Dependencies: W-060.

---

EPIC 8 — Search View

Ticket W-070 — Real-Time Search (Pinyin/English) [DONE]
- Description: One search input field with selector (button) to switch between pinyin or def search.
- Deliverables:
    - Search.filter(query, type) and render results list; click-to-jump to Review.
- Acceptance Criteria:
    - Typing "yao" matches pinyin tokens containing "yào"; selector toggles search type; clicking a result focuses that card in Review.
- Dependencies: W-022, W-050.

---

EPIC 9 — Accessibility & UX Polish

Ticket W-080 — Accessibility Pass [PENDING]
- Description: Add aria-labels, aria-live flip status, keyboard focus styles, color contrast.
- Deliverables:
    - A11y attributes and CSS outlines; hidden live region for flip announcements.
- Acceptance Criteria:
    - Screen reader announces flip; all interactive elements keyboard reachable.
- Dependencies: W-051, W-052, W-030.

Ticket W-081 — Error & Empty States [PENDING]
- Description: Inline banners for fetch errors; "No valid cards" state; graceful handling.
- Deliverables:
    - Reusable Banner component (vanilla) and empty-state UI.
- Acceptance Criteria:
    - Simulated errors produce actionable messages; app remains usable.
- Dependencies: W-020, W-021.

---

EPIC 10 — Sample Data & QA

Ticket W-090 — Sample Decks A–D [PENDING]
- Description: Create four small decks (5–20 cards) covering tone variety and tokenization.
- Deliverables:
    - decks/deck_a.json … deck_d.json adhering to schema and constraints.
- Acceptance Criteria:
    - All decks validate with zero errors.
- Dependencies: W-021.

Ticket W-091 — Manual QA Script [PENDING]
- Description: Checklist to verify deck switching, review flows, direction persistence, direction-specific stats tracking, stats, search, errors.
- Deliverables:
    - [README-qa.md](http://readme-qa.md/) with scenario steps and expected results.
- Acceptance Criteria:
    - Runs cleanly on Chrome and Safari (mobile & desktop).
- Dependencies: All core tickets up to W-081.

Ticket W-092 — Header Layout Optimization [PENDING]
- Description: Optimize header layout to prevent wrapping on narrow screens (<770px) by compacting elements, enabling shrinking, and ensuring single-row display with nav right-aligned.
- Deliverables:
    - Updated styles.css: Reduced padding/gaps/font-sizes/min-widths; flex properties for shrinking; justify-content: space-between for alignment; responsive adjustments.
    - Removed h1 and deck-status from header for compactness.
- Acceptance Criteria:
    - Header stays in one row on screens >=500px; nav right-aligned; no wrapping on narrow viewports.
- Dependencies: W-001.

---

Optional EPIC — Offline & Future Virtual Deck

Ticket W-100 (Optional) — PWA Caching [PENDING]
- Description: Service worker to cache core assets and the active deck.
- Deliverables:
    - sw.js, minimal registration, cache-first strategy with revalidation.
- Acceptance Criteria:
    - App loads offline after first visit; deck updates on next online session.
- Dependencies: Core epics.

Ticket W-101 (Future) — Virtual Hardest Deck Stub [PENDING]
- Description: Implement ranking function to compute top-K hardest across all decks per direction; no UI yet.
- Deliverables:
    - computeVirtualHardest(decksState, K, minAnswers) returning decki​d,cardi​d,cardRef.
- Acceptance Criteria:
    - Works on mock data; stats updates would propagate to origin deck (design proven in code comments/tests).
- Dependencies: W-060.

---

Agent Prompt Template (for each ticket)

- Task: Pasteticketdescription.
- Inputs: Files/modulestotouch,constants,datastructures.
- Constraints: Vanilla JS only; preserve file names; use textContent; no libraries.
- Output: Functions,DOMelements,CSSclasses,andwheretheylive.
- Acceptance Checks: Copyticket’sacceptancebullets.
