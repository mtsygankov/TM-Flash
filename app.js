// Constants
const SRS_WEIGHTS = {
  NEW: 5.0,
  ERROR: 3.0,
  DAYS: 0.25,
};

const SRS_MAX_DAYS = 14;

const DEFAULT_SELECTED_DECK = "deck_a";

// Deck registry
const DECKS = {
  deck_a: {
    label: "Deck A",
    url: "decks/deck_a.json",
  },
  deck_b: {
    label: "Deck B",
    url: "decks/deck_b.json",
  },
  deck_c: {
    label: "Deck C",
    url: "decks/deck_c.json",
  },
  deck_d: {
    label: "Deck D",
    url: "decks/deck_d.json",
  },
};

// Storage module
const Storage = {
  STORAGE_KEY: "tmFlash",
  CURRENT_SCHEMA_VERSION: 2,

  getDefaultState() {
    return {
      schema_version: this.CURRENT_SCHEMA_VERSION,
      settings: {
        direction: "CH->EN",
        selected_deck: DEFAULT_SELECTED_DECK,
        theme: "light",
      },
      decks: {
        deck_a: { cards: {} },
        deck_b: { cards: {} },
        deck_c: { cards: {} },
        deck_d: { cards: {} },
      },
    };
  },

  loadState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        const defaultState = this.getDefaultState();
        this.saveState(defaultState);
        return defaultState;
      }
      const state = JSON.parse(stored);
      // Ensure schema version is current
      if (state.schema_version !== this.CURRENT_SCHEMA_VERSION) {
        console.warn("Schema version mismatch, using defaults");
        const defaultState = this.getDefaultState();
        this.saveState(defaultState);
        return defaultState;
      }
      return state;
    } catch (error) {
      console.error("Error loading state:", error);
      const defaultState = this.getDefaultState();
      this.saveState(defaultState);
      return defaultState;
    }
  },

  saveState(state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving state:", error);
    }
  },

  getSettings() {
    const state = this.loadState();
    return state.settings;
  },

  setSettings(settings) {
    const state = this.loadState();
    state.settings = { ...state.settings, ...settings };
    this.saveState(state);
  },

  getDeckStats(deckId) {
    const state = this.loadState();
    return state.decks[deckId] || { cards: {} };
  },

  setDeckStats(deckId, statsObj) {
    const state = this.loadState();
    state.decks[deckId] = statsObj;
    this.saveState(state);
  },
};

// Stats module
const Stats = {
  sync(deckId, cards) {
    const deckStats = Storage.getDeckStats(deckId);
    const validCardIds = new Set(cards.map((card) => card.card_id));
    const syncedCards = {};

      // Add missing entries for valid cards
     cards.forEach((card) => {
       if (!deckStats.cards[card.card_id]) {
         syncedCards[card.card_id] = {
           "CH->EN": {
             total_correct: 0,
             total_incorrect: 0,
             last_correct_at: null,
             last_incorrect_at: null,
             correct_streak_len: 0,
             incorrect_streak_len: 0,
             correct_streak_started_at: null,
             incorrect_streak_started_at: null
           },
           "EN->CH": {
             total_correct: 0,
             total_incorrect: 0,
             last_correct_at: null,
             last_incorrect_at: null,
             correct_streak_len: 0,
             incorrect_streak_len: 0,
             correct_streak_started_at: null,
             incorrect_streak_started_at: null
           },
         };
       } else {
         syncedCards[card.card_id] = deckStats.cards[card.card_id];
       }
     });

    // Remove orphaned entries (cards that no longer exist in the deck)
    Object.keys(deckStats.cards).forEach((cardId) => {
      if (!validCardIds.has(cardId)) {
        console.log(`Removing orphaned stats for card: ${cardId}`);
      } else {
        syncedCards[cardId] = deckStats.cards[cardId];
      }
    });

    const syncedStats = { cards: syncedCards };
    Storage.setDeckStats(deckId, syncedStats);

    console.log(
      `Stats sync complete for ${deckId}: ${Object.keys(syncedCards).length} cards`,
    );
    return syncedStats;
  },

  getCardStats(deckId, cardId, direction) {
    const deckStats = Storage.getDeckStats(deckId);
    return (
      deckStats.cards[cardId]?.[direction] || {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      }
    );
  },

  updateCardStats(deckId, cardId, direction, isCorrect) {
    const deckStats = Storage.getDeckStats(deckId);
    const cardStats = deckStats.cards[cardId] || {
      "CH->EN": {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      },
      "EN->CH": {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      },
    };

    if (!cardStats[direction]) {
      cardStats[direction] = {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      };
    }

    const now = Date.now();

    if (isCorrect) {
      cardStats[direction].total_correct++;
      cardStats[direction].last_correct_at = now;

      if (cardStats[direction].incorrect_streak_len > 0) {
        // Reset incorrect streak
        cardStats[direction].incorrect_streak_len = 0;
        cardStats[direction].correct_streak_len = 1;
        cardStats[direction].correct_streak_started_at = now;
      } else {
        // Starting or continuing correct streak
        if (cardStats[direction].correct_streak_len === 0) {
          cardStats[direction].correct_streak_started_at = now;
        }
        cardStats[direction].correct_streak_len++;
      }
    } else {
      cardStats[direction].total_incorrect++;
      cardStats[direction].last_incorrect_at = now;

      if (cardStats[direction].correct_streak_len > 0) {
        // Reset correct streak
        cardStats[direction].correct_streak_len = 0;
        cardStats[direction].incorrect_streak_len = 1;
        cardStats[direction].incorrect_streak_started_at = now;
      } else {
        // Starting or continuing incorrect streak
        if (cardStats[direction].incorrect_streak_len === 0) {
          cardStats[direction].incorrect_streak_started_at = now;
        }
        cardStats[direction].incorrect_streak_len++;
      }
    }

    deckStats.cards[cardId] = cardStats;
    Storage.setDeckStats(deckId, deckStats);
    // Update in-memory stats
    App.currentStats = deckStats;
  },

  computeMetrics(deckId, direction) {
    const totalCards = App.currentCards ? App.currentCards.length : 0;
    const deckStats = Storage.getDeckStats(deckId);
    let reviewedCount = 0;
    Object.values(deckStats.cards).forEach((cardStats) => {
      const dirStat = cardStats[direction];
      if (dirStat && dirStat.total_correct + dirStat.total_incorrect > 0) reviewedCount++;
    });
    const newCount = totalCards - reviewedCount;
    const deckErrors = deckStats.errorCount || 0;
    return { totalCards, reviewedCount, newCount, deckErrors };
  },
};

// SRS module
const SRS = {
  calculateNextReviewInterval(cardStats) {
    const {
      total_correct,
      total_incorrect,
      last_correct_at,
      last_incorrect_at,
      correct_streak_len,
      incorrect_streak_len,
      correct_streak_started_at,
      incorrect_streak_started_at
    } = cardStats;

    const total_reviews = total_correct + total_incorrect;
    const accuracy = total_reviews > 0 ? total_correct / total_reviews : 0;
    const now = Date.now();

    // Base intervals (in hours)
    const BASE_INTERVALS = [0.5, 4, 24, 72, 168, 336, 720, 1440]; // 30min to 60 days

    // Determine base interval index based on correct streak
    let intervalIndex = Math.min(correct_streak_len, BASE_INTERVALS.length - 1);
    let baseInterval = BASE_INTERVALS[intervalIndex];

    // Modifiers based on performance
    let modifier = 1.0;

    // Recent performance modifier
    if (last_incorrect_at && last_correct_at) {
      const recentlyIncorrect = last_incorrect_at > last_correct_at;
      if (recentlyIncorrect) {
        modifier *= 0.3; // Much shorter interval after mistake
      }
    }

    // Accuracy modifier
    if (total_reviews >= 3) {
      if (accuracy >= 0.9) modifier *= 1.3;
      else if (accuracy >= 0.7) modifier *= 1.0;
      else if (accuracy >= 0.5) modifier *= 0.7;
      else modifier *= 0.4;
    }

    // Incorrect streak penalty
    if (incorrect_streak_len > 0) {
      modifier *= Math.pow(0.5, incorrect_streak_len); // Exponential penalty
    }

    // Long correct streak bonus (but cap it)
    if (correct_streak_len > 5) {
      modifier *= Math.min(2.0, 1 + (correct_streak_len - 5) * 0.1);
    }

    const finalInterval = baseInterval * modifier;
    return Math.max(0.5, Math.min(finalInterval, 2160)); // Min 30min, max 90 days
  },

  shouldReviewCard(cardStats) {
    console.log("🔍 shouldReviewCard called with stats:", {
      last_correct_at: cardStats.last_correct_at,
      last_incorrect_at: cardStats.last_incorrect_at,
      total_correct: cardStats.total_correct,
      total_incorrect: cardStats.total_incorrect
    });

    if (!cardStats.last_correct_at && !cardStats.last_incorrect_at) {
      console.log("✅ New card - returning true");
      return true; // New card
    }

    const lastReview = Math.max(cardStats.last_correct_at || 0, cardStats.last_incorrect_at || 0);
    const intervalHours = this.calculateNextReviewInterval(cardStats);
    const nextReviewTime = lastReview + (intervalHours * 60 * 60 * 1000);
    const now = Date.now();
    const isDue = now >= nextReviewTime;

    console.log("🔍 Card review check:", {
      lastReview: new Date(lastReview).toISOString(),
      intervalHours: intervalHours.toFixed(2),
      nextReviewTime: new Date(nextReviewTime).toISOString(),
      now: new Date(now).toISOString(),
      isDue
    });

    return isDue;
  },

  selectNextCard(cards, statsMap, direction) {
    console.log("🔍 SRS.selectNextCard called with direction:", direction);
    console.log("🔍 Cards array:", cards ? `Array with ${cards.length} cards` : "null/undefined");
    console.log("🔍 Stats map:", statsMap ? "Object provided" : "null/undefined");

    if (!cards || cards.length === 0) {
      console.log("❌ No cards array or empty array");
      return null;
    }

    const dueCards = cards.filter(card => {
      const stats = statsMap[card.card_id]?.[direction];
      const isDue = this.shouldReviewCard(stats || {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      });

      console.log(`🔍 Card ${card.card_id}: stats exist=${!!stats}, isDue=${isDue}`);
      return isDue;
    });

    console.log("🔍 Due cards found:", dueCards.length);

    if (dueCards.length === 0) {
      console.log("❌ No due cards found");
      return null;
    }

    // Priority scoring for due cards
    const scoredCards = dueCards.map(card => {
      const stats = statsMap[card.card_id]?.[direction] || {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      };

      const total_reviews = stats.total_correct + stats.total_incorrect;

      let priority = 0;

      // New cards get highest priority
      if (total_reviews === 0) {
        priority = 1000;
      } else {
        // Recently failed cards
        if (stats.incorrect_streak_len > 0) {
          priority = 500 + (stats.incorrect_streak_len * 100);
        }

        // Overdue factor
        const lastReview = Math.max(stats.last_correct_at || 0, stats.last_incorrect_at || 0);
        const intervalHours = this.calculateNextReviewInterval(stats);
        const expectedReviewTime = lastReview + (intervalHours * 60 * 60 * 1000);
        const overdueFactor = Math.max(1, (Date.now() - expectedReviewTime) / (60 * 60 * 1000));
        priority += overdueFactor * 10;

        // Low accuracy boost
        const accuracy = stats.total_correct / total_reviews;
        if (accuracy < 0.6) {
          priority += (0.6 - accuracy) * 200;
        }
      }

      // Small random factor to break ties
      priority += Math.random() * 5;

      return { card, priority };
    });

    // Sort by priority (highest first) and return top card
    scoredCards.sort((a, b) => b.priority - a.priority);
    return scoredCards[0].card;
  },

  getNextReviewInfo(cards, statsMap, direction) {
    if (!cards || cards.length === 0) {
      return null;
    }

    const now = Date.now();
    let earliestNextReview = Infinity;
    const nextReviewTimes = [];

    cards.forEach(card => {
      const stats = statsMap[card.card_id]?.[direction];
      if (!stats) return;

      // Skip new cards (no reviews yet)
      if (!stats.last_correct_at && !stats.last_incorrect_at) return;

      const lastReview = Math.max(stats.last_correct_at || 0, stats.last_incorrect_at || 0);
      const intervalHours = this.calculateNextReviewInterval(stats);
      const nextReviewTime = lastReview + (intervalHours * 60 * 60 * 1000);

      if (nextReviewTime > now) {
        nextReviewTimes.push(nextReviewTime);
        if (nextReviewTime < earliestNextReview) {
          earliestNextReview = nextReviewTime;
        }
      }
    });

    if (nextReviewTimes.length === 0) {
      return null;
    }

    const timeDiffMs = earliestNextReview - now;
    const timeDiffHours = timeDiffMs / (60 * 60 * 1000);

    let timeString;
    if (timeDiffHours < 2) {
      const minutes = Math.ceil(timeDiffMs / (60 * 1000))
      timeString = `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (timeDiffHours < 24) {
      const hours = Math.ceil(timeDiffHours);
      timeString = `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.ceil(timeDiffHours / 24);
      timeString = `${days} day${days > 1 ? 's' : ''}`;
    }

    const oneHourLater = earliestNextReview + (60 * 60 * 1000);
    const cardsInWindow = nextReviewTimes.filter(time => time <= oneHourLater).length;

    return {
      timeString,
      cardsInWindow
    };
  },
};
// Message module
const Message = {
    show(containerId, text, type = 'info') {
        const msgDiv = document.getElementById(containerId + '-message');
        if (msgDiv) {
            msgDiv.textContent = text;
            msgDiv.className = `system-message ${type}`;
            msgDiv.classList.add('active');
            msgDiv.style.display = 'block';
            // Hide buttons when showing message in card-container
            if (containerId === 'card-container') {
                const buttons = document.getElementById('card-buttons');
                if (buttons) {
                    buttons.style.display = 'none';
                }
            }
        }
    },

    hide(containerId) {
        const msgDiv = document.getElementById(containerId + '-message');
        if (msgDiv) {
            msgDiv.style.display = 'none';
            msgDiv.classList.remove('active');
            // Buttons will be shown by applyDirectionAndFlip when card is rendered
        }
    }
};

// Normalizer module
const Normalizer = {
  normalizePinyin(pinyin) {
    // Convert to lowercase first
    let normalized = pinyin.toLowerCase();

    // Normalize to NFD (decomposed) form to separate base characters from diacritics
    normalized = normalized.normalize("NFD");

    // Remove diacritical marks (combining characters)
    normalized = normalized.replace(/[\u0300-\u036f]/g, "");

    return normalized;
  },

  augmentCardsWithNormalizedPinyin(cards) {
    return cards.map((card) => ({
      ...card,
      pinyin_normalized: this.normalizePinyin(card.pinyin),
    }));
  },
};

// Validator module
const Validator = {
  validate(deckJson) {
    const errors = [];
    const validCards = [];
    const seenIds = new Set();

    if (!Array.isArray(deckJson)) {
      errors.push({
        type: "structure",
        message: "Deck must be an array of cards",
      });
      return { validCards, errors };
    }

    deckJson.forEach((card, index) => {
      const cardErrors = this.validateCard(card, index, seenIds);
      if (cardErrors.length === 0) {
        validCards.push(card);
      } else {
        errors.push(...cardErrors);
      }
    });

    return { validCards, errors };
  },

  validateCard(card, index, seenIds) {
    const errors = [];

    // Check required fields
    if (!card.card_id) {
      errors.push({
        type: "missing_field",
        cardIndex: index,
        field: "card_id",
        message: "Missing card_id",
      });
    }
    if (!card.hanzi) {
      errors.push({
        type: "missing_field",
        cardIndex: index,
        field: "hanzi",
        message: "Missing hanzi",
      });
    }
    if (!card.pinyin) {
      errors.push({
        type: "missing_field",
        cardIndex: index,
        field: "pinyin",
        message: "Missing pinyin",
      });
    }
    if (!card.en_words) {
      errors.push({
        type: "missing_field",
        cardIndex: index,
        field: "en_words",
        message: "Missing en_words",
      });
    }
    if (!card.english) {
      errors.push({
        type: "missing_field",
        cardIndex: index,
        field: "english",
        message: "Missing english",
      });
    }

    // Skip further validation if required fields are missing
    if (errors.length > 0) {
      return errors;
    }

    // Check card_id uniqueness
    if (seenIds.has(card.card_id)) {
      errors.push({
        type: "duplicate_id",
        cardIndex: index,
        cardId: card.card_id,
        message: `Duplicate card_id: ${card.card_id}`,
      });
    } else {
      seenIds.add(card.card_id);
    }

    // Tokenize fields and check token count equality
    const hanziTokens = this.tokenize(card.hanzi);
    const pinyinTokens = this.tokenize(card.pinyin);
    const enWordsTokens = Array.isArray(card.en_words)
      ? card.en_words
      : this.tokenize(card.en_words);

    if (
      hanziTokens.length !== pinyinTokens.length ||
      hanziTokens.length !== enWordsTokens.length
    ) {
      errors.push({
        type: "token_mismatch",
        cardIndex: index,
        cardId: card.card_id,
        message: `Token count mismatch - hanzi: ${hanziTokens.length}, pinyin: ${pinyinTokens.length}, en_words: ${enWordsTokens.length}`,
      });
    }

    return errors;
  },

  tokenize(text) {
    // Split on whitespace and filter out empty strings
    return text.split(/\s+/).filter((token) => token.length > 0);
  },

  showValidationErrors(deckId, errors) {
    if (errors.length === 0) {
      this.hideValidationBanner();
      return;
    }

    let banner = document.getElementById("validation-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "validation-banner";
      banner.className = "validation-banner";
      document.body.insertBefore(banner, document.body.firstChild);
    }

    const errorSummary = errors
      .slice(0, 5)
      .map((error) => `Card ${error.cardIndex + 1}: ${error.message}`)
      .join("<br>");

    const remainingCount = Math.max(0, errors.length - 5);
    const remainingText =
      remainingCount > 0 ? `<br>... and ${remainingCount} more errors` : "";

    banner.innerHTML = `
            <div class="validation-content">
                <span class="validation-message">
                    <strong>${DECKS[deckId].label} validation:</strong> ${errors.length} errors found<br>
                    ${errorSummary}${remainingText}
                </span>
            </div>
        `;
    banner.style.display = "block";
  },

  hideValidationBanner() {
    const banner = document.getElementById("validation-banner");
    if (banner) {
      banner.style.display = "none";
    }
  },
};

// DeckLoader module
const DeckLoader = {
  currentDeck: null,
  currentDeckId: null,

  async fetch(deckId) {
    const deck = DECKS[deckId];
    if (!deck) {
      throw new Error(`Unknown deck: ${deckId}`);
    }

    try {
      this.hideErrorBanner();
      const response = await this.fetchWithTimeout(deck.url, 10000); // 10 second timeout

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.currentDeck = data;
      this.currentDeckId = deckId;
      return data;
    } catch (error) {
      console.error(`Failed to load deck ${deckId}:`, error);
      this.showErrorBanner(deckId, error.message);
      throw error;
    }
  },

  async fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Request timed out");
      }
      throw error;
    }
  },

  showErrorBanner(deckId, errorMessage) {
    let banner = document.getElementById("error-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "error-banner";
      banner.className = "error-banner";
      document.body.insertBefore(banner, document.body.firstChild);
    }

    banner.innerHTML = `
            <div class="error-content">
                <span class="error-message">Failed to load ${DECKS[deckId].label}: ${errorMessage}</span>
                <button class="retry-btn" onclick="DeckLoader.retryFetch('${deckId}')">Retry</button>
            </div>
        `;
    banner.style.display = "block";
  },

  hideErrorBanner() {
    const banner = document.getElementById("error-banner");
    if (banner) {
      banner.style.display = "none";
    }
  },

  retryFetch(deckId) {
    this.fetch(deckId).catch(() => {
      // Error already handled in fetch method
    });
  },
};

// DeckSelector module
const DeckSelector = {
  isLoading: false,
  currentDeckId: null,

  async init() {
    await this.populateOptions();
    await this.loadSelectedDeck();
    this.bindSelector();
  },

  async populateOptions() {
    const selector = document.getElementById("deck-selector");
    if (!selector) return;

    this.setStatusMessage("Loading deck list...", "info");

    // Clear existing options except the first one
    while (selector.options.length > 1) {
      selector.remove(1);
    }

    // Add deck options with names from JSON
    for (const deckId of Object.keys(DECKS)) {
      try {
        const deckData = await this.fetchDeckData(deckId);
        const deckName = deckData.deck_name || DECKS[deckId].label;

        const option = document.createElement("option");
        option.value = deckId;
        option.textContent = deckName;
        selector.appendChild(option);
      } catch (error) {
        console.warn(
          `Failed to load deck name for ${deckId}, using fallback:`,
          error,
        );
        // Fallback to hardcoded label if fetch fails
        const option = document.createElement("option");
        option.value = deckId;
        option.textContent = DECKS[deckId].label;
        selector.appendChild(option);
      }
    }

    this.setStatusMessage(
      `${Object.keys(DECKS).length} decks available`,
      "success",
    );
  },

  async fetchDeckData(deckId) {
    const deck = DECKS[deckId];
    if (!deck) {
      throw new Error(`Unknown deck: ${deckId}`);
    }

    const response = await fetch(deck.url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  async loadSelectedDeck() {
    const settings = Storage.getSettings();
    const selector = document.getElementById("deck-selector");
    if (selector && settings.selected_deck) {
      selector.value = settings.selected_deck;
      this.currentDeckId = settings.selected_deck;
      // Load the default deck
      try {
        await this.loadDeck(settings.selected_deck);
      } catch (error) {
        console.error("Failed to load default deck:", error);
        // If default deck fails, try to load the first available deck
        const firstDeckId = Object.keys(DECKS)[0];
        if (firstDeckId && firstDeckId !== settings.selected_deck) {
          console.log("Falling back to first available deck:", firstDeckId);
          await this.loadDeck(firstDeckId);
        }
      }
    }
  },

  bindSelector() {
    const selector = document.getElementById("deck-selector");
    if (selector) {
      selector.addEventListener("change", (e) => {
        const selectedDeck = e.target.value;
        if (selectedDeck && selectedDeck !== this.currentDeckId) {
          console.log(`Switching to deck: ${selectedDeck}`);
          this.loadDeck(selectedDeck).catch(() => {
            // If loading fails, revert selector to current deck
            if (this.currentDeckId) {
              selector.value = this.currentDeckId;
            }
          });
        } else if (!selectedDeck) {
          // If user selects empty option, revert to current deck
          if (this.currentDeckId) {
            selector.value = this.currentDeckId;
          }
        }
      });
    }
  },

  async loadDeck(deckId) {
    if (this.isLoading) {
      console.log("Deck loading already in progress, ignoring request");
      return;
    }

    this.isLoading = true;
    this.setLoadingState(true);

    try {
      console.log(`Loading deck: ${deckId}`);
      const deckData = await DeckLoader.fetch(deckId);

      // Extract cards array from deck object
      const cards = deckData.cards || [];

      // Validate the cards
      const { validCards, errors } = Validator.validate(cards);

      if (errors.length > 0) {
        console.warn(`Validation errors in deck ${deckId}:`, errors);
        Validator.showValidationErrors(deckId, errors);
        // Store error count
        const deckStats = Storage.getDeckStats(deckId);
        deckStats.errorCount = errors.length;
        Storage.setDeckStats(deckId, deckStats);
        return;
      }

      // Hide any previous validation errors
      Validator.hideValidationBanner();
      // Reset error count
      const deckStats = Storage.getDeckStats(deckId);
      deckStats.errorCount = 0;
      Storage.setDeckStats(deckId, deckStats);

      // Normalize and augment cards
      const augmentedCards =
        Normalizer.augmentCardsWithNormalizedPinyin(validCards);

      // Sync stats with the loaded deck
      const syncedStats = Stats.sync(deckId, augmentedCards);

      // Update storage with selected deck
      Storage.setSettings({ selected_deck: deckId });

      // Update current deck tracking
      this.currentDeckId = deckId;

       // Set app state
       App.currentCards = augmentedCards;
       App.currentStats = syncedStats;
       App.currentDirection = Storage.getSettings().direction;
       App.currentDeckId = deckId;
       App.flipped = false;
       App.currentCard = SRS.selectNextCard(
         App.currentCards,
         App.currentStats.cards,
         App.currentDirection,
       );
         if (App.currentCard) {
           Review.renderCard(App.currentCard);
         } else {
           Review.renderCard(null);
           let message;
           if (!App.currentCards || App.currentCards.length === 0) {
             message = 'No valid cards in this deck.';
           } else {
             const nextReviewInfo = SRS.getNextReviewInfo(App.currentCards, App.currentStats.cards, App.currentDirection);
             if (nextReviewInfo) {
               message = `No cards due for review. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
             } else {
               message = 'No cards due for review.';
             }
           }
           Message.show('card-container', message);
         }

      // Ensure selector shows current selection
      const selector = document.getElementById("deck-selector");
      if (selector && selector.value !== deckId) {
        selector.value = deckId;
      }

      // Reset review view to show first card
      this.resetReviewView();

      this.setStatusMessage(
        `Loaded ${DECKS[deckId].label} (${augmentedCards.length} cards)`,
        "success",
      );
      console.log(
        `Successfully loaded deck: ${DECKS[deckId].label} with ${augmentedCards.length} cards`,
      );
    } catch (error) {
      this.setStatusMessage(`Failed to load ${DECKS[deckId].label}`, "error");
      console.error(`Failed to load deck ${deckId}:`, error);
      // Error handling is done in DeckLoader.fetch()
    } finally {
      this.isLoading = false;
      this.setLoadingState(false);
    }
  },

  setLoadingState(loading) {
    const selector = document.getElementById("deck-selector");
    const statusElement = document.getElementById("deck-status");

    if (selector) {
      selector.disabled = loading;
      selector.style.opacity = loading ? "0.6" : "1";
    }

    if (statusElement) {
      if (loading) {
        statusElement.textContent = "Loading deck...";
        statusElement.className = "deck-status loading";
      } else {
        statusElement.textContent = "";
        statusElement.className = "deck-status";
      }
    }
  },

  setStatusMessage(message, type = "info") {
    const statusElement = document.getElementById("deck-status");
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `deck-status ${type}`;
    }
  },

  resetReviewView() {
    App.flipped = false;
    if (App.currentCard) {
      Review.renderCard(App.currentCard);
    }
  },
};

// Settings module
const Settings = {
  init() {
    this.loadDirection();
    this.bindDirectionToggle();
  },

  loadDirection() {
    const settings = Storage.getSettings();
    this.applyDirection(settings.direction);
  },

   applyDirection(direction) {
     console.log("🔄 applyDirection called with direction:", direction);

     const button = document.getElementById("direction-toggle");
     if (button) {
       button.textContent = direction;
       button.dataset.direction = direction;
       console.log("✅ Button text updated to:", direction);
     } else {
       console.warn("❌ Direction toggle button not found");
     }

     App.currentDirection = direction;
     App.flipped = false;
     console.log("📍 App.currentDirection set to:", direction);

    // Debug current app state
    console.log("📊 App.currentCards:", App.currentCards ? `Array with ${App.currentCards.length} cards` : "null/undefined");
    console.log("📊 App.currentStats:", App.currentStats ? "Object with cards property" : "null/undefined");
    if (App.currentStats && App.currentStats.cards) {
      console.log("📊 App.currentStats.cards keys:", Object.keys(App.currentStats.cards));
    }

    // Only select/render card if data is available (not during initialization)
    if (App.currentCards && App.currentStats) {
      console.log("✅ Conditional check passed, selecting card...");

      // Select a new card for the new direction
      App.currentCard = SRS.selectNextCard(
        App.currentCards,
        App.currentStats.cards,
        App.currentDirection,
      );

      console.log("🎯 SRS.selectNextCard result:", App.currentCard ? `Card ${App.currentCard.card_id}` : "null");

        if (App.currentCard) {
          console.log("🎨 Rendering card:", App.currentCard.card_id);
          Review.renderCard(App.currentCard);
        } else {
          console.log("📝 No cards due, updating message");
          Review.renderCard(null);
          const nextReviewInfo = SRS.getNextReviewInfo(App.currentCards, App.currentStats.cards, App.currentDirection);
          let message;
          if (nextReviewInfo) {
               message = `No cards due for review. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
          } else {
            message = 'No cards due for review in this direction.';
          }
          Message.show('card-container', message);
          console.log("✅ Message updated successfully");
        }
    } else {
      console.warn("❌ Conditional check failed - app data not available");
      console.log("   App.currentCards:", !!App.currentCards);
      console.log("   App.currentStats:", !!App.currentStats);

      // Still try to update the message to indicate direction change
      const cardContainer = document.getElementById("card-container");
      if (cardContainer) {
        cardContainer.innerHTML = `<p>Switched to ${direction} direction.</p>`;
        console.log("ℹ️ Updated message with direction change info");
      }
    }
  },

  toggleDirection() {
    const currentDirection = Storage.getSettings().direction;
    const newDirection = currentDirection === "CH->EN" ? "EN->CH" : "CH->EN";
    Storage.setSettings({ direction: newDirection });
    this.applyDirection(newDirection);
  },

  bindDirectionToggle() {
    const button = document.getElementById("direction-toggle");
    if (button) {
      button.addEventListener("click", () => {
        this.toggleDirection();
      });
      button.disabled = false;
    }
  },
};

// TM-Flash Application
const App = {
  currentCards: null,
  currentStats: null,
  currentCard: null,
  flipped: false,
  currentDirection: "CH->EN",
  currentDeckId: null,

  async init() {
    console.log("TM-Flash initialized");
    console.log("Deck registry:", DECKS);
    // Initialize storage
    Storage.loadState();
    // Initialize deck selector FIRST (loads deck data)
    await DeckSelector.init();
    // Initialize settings (now safe to call applyDirection)
    Settings.init();
    // Initialize navigation
    Nav.init();
    // Initialize review (now safe to bind events)
    Review.init();
    // Initialize stats view
    StatsView.init();
    // Initialize search
    Search.init();
  },
};

// Navigation module
const Nav = {
  init() {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const viewId = e.target.dataset.view;
        this.show(viewId);
      });
    });
  },

  show(viewId) {
    // Hide all views
    const views = document.querySelectorAll(".view");
    views.forEach((view) => view.classList.add("is-hidden"));

    // Show selected view
    const selectedView = document.getElementById(`view-${viewId}`);
    if (selectedView) {
      selectedView.classList.remove("is-hidden");
      if (viewId === "search") {
        document.getElementById("search-query").focus();
      }
    }

    // Update active tab
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => tab.classList.remove("active"));

    const activeTab = document.querySelector(`[data-view="${viewId}"]`);
    if (activeTab) {
      activeTab.classList.add("active");
    }

    // Render stats if showing stats view
    if (viewId === "stats") {
      StatsView.render();
    }
      // Refresh review card if showing review view
      if (viewId === "review") {
        App.currentCard = SRS.selectNextCard(
          App.currentCards,
          App.currentStats.cards,
          App.currentDirection,
        );
        if (App.currentCard) {
          Review.renderCard(App.currentCard);
        } else {
          let message;
          if (!App.currentCards || App.currentCards.length === 0) {
            message = 'No valid cards in this deck.';
          } else {
            const nextReviewInfo = SRS.getNextReviewInfo(App.currentCards, App.currentStats.cards, App.currentDirection);
            if (nextReviewInfo) {
               message = `No cards due for review. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
            } else {
              message = 'No cards due for review.';
            }
          }
          Message.show('card-container', message);
        }
      }
  },
};

// Review module
const Review = {
  init() {
    this.bindEvents();
    // Recalculate scale on window resize
    window.addEventListener('resize', () => {
      if (App.currentCard) {
        this.renderCard(App.currentCard);
      }
    });
  },

  renderCard(card) {
    Message.hide('card-container');
    if (!card) {
      const table = document.getElementById("card-table");
      if (table) {
        table.innerHTML = "";
      }
      return;
    }
    const hanziTokens = card.hanzi.split(" ");
    const pinyinTokens = card.pinyin.split(" ");
    const enWords = card.en_words;
    const table = document.getElementById("card-table");
    if (!table) return;
    table.innerHTML = `
            <tr class="row-hanzi">
                ${hanziTokens.map((token) => `<td>${this.escapeHtml(token)}</td>`).join("")}
            </tr>
            <tr class="row-pinyin">
                ${pinyinTokens.map((token) => `<td>${this.escapeHtml(token)}</td>`).join("")}
            </tr>
            <tr class="row-en-words">
                ${enWords.map((word) => `<td>${this.escapeHtml(word)}</td>`).join("")}
            </tr>
            <tr class="row-english">
                <td colspan="${hanziTokens.length}">${this.escapeHtml(card.english)}</td>
            </tr>
        `;

    // Dynamic font scaling based on content and available space
    const columns = hanziTokens.length;
    const totalChars = hanziTokens.reduce((sum, token) => sum + token.length, 0);
    const container = document.getElementById('card-container');
    const containerPadding = parseFloat(getComputedStyle(container).paddingLeft) + parseFloat(getComputedStyle(container).paddingRight);
    const availableWidth = container.clientWidth - containerPadding;
    const baseCharSize = 4 * 16; // 4rem in px per hanzi char
    const cellPadding = 0.75 * 2 * 16; // 0.75rem * 2 sides in px
    const borderSpacing = 0.5 * 16; // 0.5rem in px
    const estimatedWidth = totalChars * baseCharSize + (columns - 1) * borderSpacing + columns * cellPadding;
    const scale = Math.max(0.5, Math.min(1, availableWidth / estimatedWidth));
    console.log('Columns:', columns, 'Total Chars:', totalChars, 'Available Width:', availableWidth, 'Estimated Width:', estimatedWidth, 'Scale:', scale);
    table.style.setProperty('--scale-factor', scale);

    this.applyDirectionAndFlip();
  },

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  applyDirectionAndFlip() {
    const table = document.getElementById("card-table");
    const direction = App.currentDirection;
    const flipped = App.flipped;
    table.className = `direction-${direction.toLowerCase().replace("->", "-")} ${flipped ? "flipped" : ""}`;

    const buttons = document.getElementById("card-buttons");
    if (buttons) {
      buttons.style.display = flipped ? "flex" : "none";
    }
  },

  toggleFlip() {
    App.flipped = !App.flipped;
    this.applyDirectionAndFlip();
  },

  onCorrect() {
    console.log("onCorrect called");
    if (!App.currentCard) {
      console.log("No current card");
      return;
    }
    Stats.updateCardStats(
      App.currentDeckId,
      App.currentCard.card_id,
      App.currentDirection,
      true,
    );
    this.advanceToNextCard();
  },

  onIncorrect() {
    console.log("onIncorrect called");
    if (!App.currentCard) {
      console.log("No current card");
      return;
    }
    Stats.updateCardStats(
      App.currentDeckId,
      App.currentCard.card_id,
      App.currentDirection,
      false,
    );
    this.advanceToNextCard();
  },

   advanceToNextCard() {
     App.flipped = false;
     App.currentCard = SRS.selectNextCard(
       App.currentCards,
       App.currentStats.cards,
       App.currentDirection,
     );
      if (App.currentCard) {
        this.renderCard(App.currentCard);
      } else {
        this.renderCard(null); // Clear the table
        const nextReviewInfo = SRS.getNextReviewInfo(App.currentCards, App.currentStats.cards, App.currentDirection);
        let message;
        if (nextReviewInfo) {
               message = `No cards due for review. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
        } else {
          message = 'No more cards to review.';
        }
        Message.show('card-container', message);
      }
   },

  bindEvents() {
    console.log("Binding review events");
    const btnCorrect = document.getElementById("btn-correct");
    const btnIncorrect = document.getElementById("btn-incorrect");
    console.log("btnCorrect:", btnCorrect);
    console.log("btnIncorrect:", btnIncorrect);

    if (!btnCorrect || !btnIncorrect) {
      console.error("Review buttons not found, cannot bind events");
      return;
    }

    btnCorrect.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("btn-correct clicked");
      this.onCorrect();
    });
    btnIncorrect.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("btn-incorrect clicked");
      this.onIncorrect();
    });

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "SELECT"
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        if (!App.flipped) {
          this.toggleFlip();
        }
      } else if (e.code === "ArrowRight") {
        if (App.flipped) {
          console.log("ArrowRight pressed");
          e.preventDefault();
          this.onCorrect();
        }
      } else if (e.code === "ArrowLeft") {
        if (App.flipped) {
          console.log("ArrowLeft pressed");
          e.preventDefault();
          this.onIncorrect();
        }
      }
    });

    // Swipe and click
    let startX = 0;
    let startY = 0;
    const cardContainer = document.getElementById("card-container");
    cardContainer.addEventListener("click", () => {
      if (!App.flipped) {
        this.toggleFlip();
      }
    });
    cardContainer.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    cardContainer.addEventListener("touchend", (e) => {
      if (!App.flipped) return;
      if (!startX || !startY) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.onCorrect();
        } else {
          this.onIncorrect();
        }
      }
      startX = 0;
      startY = 0;
    });
  },
};

// StatsView module
const StatsView = {
  currentDirection: "CH->EN",

  init() {
    this.bindEvents();
    this.currentDirection = Storage.getSettings().direction;
  },

  bindEvents() {
    const toggle = document.getElementById("stats-direction-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        this.currentDirection =
          this.currentDirection === "CH->EN" ? "EN->CH" : "CH->EN";
        this.render();
      });
    }
    const resetBtn = document.getElementById("reset-stats-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetCurrentDeckStats();
      });
    }
  },

  render() {
    const toggle = document.getElementById("stats-direction-toggle");
    if (toggle) {
      toggle.textContent = this.currentDirection;
    }
    const content = document.getElementById("stats-content");
    if (!content) return;
    if (!App.currentDeckId) {
      content.innerHTML = "<p>No deck loaded.</p>";
      return;
    }
    const metrics = Stats.computeMetrics(
      App.currentDeckId,
      this.currentDirection,
    );

    // Compute histogram and top lists
    const deckStats = Storage.getDeckStats(App.currentDeckId);
    const cardMap = new Map(
      App.currentCards.map((card) => [card.card_id, card]),
    );
    const cardData = [];
    Object.entries(deckStats.cards).forEach(([cardId, cardStats]) => {
      const dirStat = cardStats[this.currentDirection];
      if (!dirStat) return;
      const total = dirStat.total_correct + dirStat.total_incorrect;
      if (total === 0) return;
      const ratio = dirStat.total_correct / total;
      const card = cardMap.get(cardId);
      if (!card) return;
      cardData.push({
        cardId,
        hanzi: card.hanzi,
        english: card.english,
        correct: dirStat.total_correct,
        incorrect: dirStat.total_incorrect,
        total,
        ratio,
      });
    });

    // Histogram buckets
    const buckets = [0, 0, 0, 0, 0];
    cardData.forEach((data) => {
      const pct = Math.floor(data.ratio * 100);
      let bucket;
      if (pct <= 20) bucket = 0;
      else if (pct <= 40) bucket = 1;
      else if (pct <= 60) bucket = 2;
      else if (pct <= 80) bucket = 3;
      else bucket = 4;
      buckets[bucket]++;
    });

    // Top 10 best and worst
    const sortedByRatioDesc = cardData.sort(
      (a, b) => b.ratio - a.ratio || b.total - a.total,
    );
    const best = sortedByRatioDesc.slice(0, 10);
    const sortedByRatioAsc = cardData.sort(
      (a, b) => a.ratio - b.ratio || b.total - a.total,
    );
    const worst = sortedByRatioAsc.slice(0, 10);

    content.innerHTML = `
      <div class="stats-metrics">
        <p>Total Cards: ${metrics.totalCards}</p>
        <p>Reviewed: ${metrics.reviewedCount}</p>
        <p>New: ${metrics.newCount}</p>
        <p>Errors: ${metrics.deckErrors}</p>
      </div>
      <div class="stats-histogram">
        <h3>Correct Ratio Histogram</h3>
        <div class="histogram-bars">
          <div class="bar">0-20%: ${buckets[0]}</div>
          <div class="bar">21-40%: ${buckets[1]}</div>
          <div class="bar">41-60%: ${buckets[2]}</div>
          <div class="bar">61-80%: ${buckets[3]}</div>
          <div class="bar">81-100%: ${buckets[4]}</div>
        </div>
      </div>
      <div class="stats-top-lists">
        <div class="top-best">
          <h3>Top 10 Best</h3>
          <ul>
            ${best.map((data) => `<li>${data.hanzi} - ${data.english} (${data.correct}/${data.total})</li>`).join("")}
          </ul>
        </div>
        <div class="top-worst">
          <h3>Top 10 Worst</h3>
          <ul>
            ${worst.map((data) => `<li>${data.hanzi} - ${data.english} (${data.correct}/${data.total})</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  },

  resetCurrentDeckStats() {
    if (!App.currentDeckId) return;
    if (
      !confirm(
        `Reset all stats for ${DECKS[App.currentDeckId].label} in ${this.currentDirection} direction? This cannot be undone.`,
      )
    )
      return;
    const deckStats = Storage.getDeckStats(App.currentDeckId);
    Object.values(deckStats.cards).forEach((cardStats) => {
      if (cardStats[this.currentDirection]) {
        cardStats[this.currentDirection] = {
          total_correct: 0,
          total_incorrect: 0,
          last_correct_at: null,
          last_incorrect_at: null,
          correct_streak_len: 0,
          incorrect_streak_len: 0,
          correct_streak_started_at: null,
          incorrect_streak_started_at: null
        };
      }
    });
    Storage.setDeckStats(App.currentDeckId, deckStats);
    // Update app state
    App.currentStats = deckStats;
    // Rerender stats
    this.render();
  },
};

// Search module
const Search = {
  currentType: "pinyin",

  init() {
    this.updateToggleButton();
    this.bindEvents();
  },

  bindEvents() {
    const queryInput = document.getElementById("search-query");
    const typeToggle = document.getElementById("search-type-toggle");
    queryInput.addEventListener("input", () => {
      this.performSearch();
    });
    typeToggle.addEventListener("click", () => {
      this.toggleType();
      this.performSearch();
    });
  },

  toggleType() {
    this.currentType = this.currentType === "pinyin" ? "english" : "pinyin";
    this.updateToggleButton();
    document.getElementById("search-query").focus();
    console.log("focus");
  },

  updateToggleButton() {
    const toggle = document.getElementById("search-type-toggle");
    const label = document.getElementById("search-label");
    if (this.currentType === "pinyin") {
      label.textContent = "Pinyin:";
      toggle.textContent = "switch to English search";
    } else {
      label.textContent = "English:";
      toggle.textContent = "switch to Pinyin search";
    }
  },

  performSearch() {
    const query = document.getElementById("search-query").value.trim();
    const results = this.filter(query, this.currentType);
    this.renderResults(results);
  },

  filter(query, type) {
    if (!App.currentCards) return [];
    return App.currentCards.filter((card) => {
      if (type === "pinyin") {
        return !query || card.pinyin_normalized.includes(query.toLowerCase());
      } else if (type === "english") {
        return (
          !query || card.english.toLowerCase().includes(query.toLowerCase())
        );
      }
      return false;
    });
  },

  renderResults(results) {
    const container = document.getElementById("search-results");
    if (results.length === 0) {
      container.innerHTML = "<p>No results found.</p>";
      return;
    }
    const list = results
      .map(
        (card) => `
      <div class="search-result" data-card-id="${card.card_id}">
        <div class="result-hanzi">${card.hanzi}</div>
        <div class="result-pinyin">${card.pinyin}</div>
        <div class="result-english">${card.english}</div>
      </div>
    `,
      )
      .join("");
    container.innerHTML = `<div class="search-results-list">${list}</div>`;
    // Bind click events
    container.querySelectorAll(".search-result").forEach((el) => {
      el.addEventListener("click", () => {
        const cardId = el.dataset.cardId;
        this.selectCard(cardId);
      });
    });
  },

   selectCard(cardId) {
     const card = App.currentCards.find((c) => c.card_id === cardId);
     if (card) {
       App.currentCard = card;
       App.flipped = false;
       Review.renderCard(card);
       Nav.show("review");
     }
   },
  };

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  await App.init();
});
