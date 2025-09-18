// Constants
const SRS_WEIGHTS = {
    NEW: 5.0,
    ERROR: 3.0,
    DAYS: 0.25
};

const SRS_MAX_DAYS = 14;

const DEFAULT_SELECTED_DECK = 'deck_a';

// Deck registry
const DECKS = {
    deck_a: {
        label: 'Deck A',
        url: 'decks/deck_a.json'
    },
    deck_b: {
        label: 'Deck B',
        url: 'decks/deck_b.json'
    },
    deck_c: {
        label: 'Deck C',
        url: 'decks/deck_c.json'
    },
    deck_d: {
        label: 'Deck D',
        url: 'decks/deck_d.json'
    }
};

// Storage module
const Storage = {
    STORAGE_KEY: 'tmFlash',

    getDefaultState() {
        return {
            schema_version: 1,
            settings: {
                direction: "CH->EN",
                selected_deck: DEFAULT_SELECTED_DECK,
                theme: "light"
            },
            decks: {
                deck_a: { cards: {} },
                deck_b: { cards: {} },
                deck_c: { cards: {} },
                deck_d: { cards: {} }
            }
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
            if (state.schema_version !== 1) {
                console.warn('Schema version mismatch, using defaults');
                const defaultState = this.getDefaultState();
                this.saveState(defaultState);
                return defaultState;
            }
            return state;
        } catch (error) {
            console.error('Error loading state:', error);
            const defaultState = this.getDefaultState();
            this.saveState(defaultState);
            return defaultState;
        }
    },

    saveState(state) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Error saving state:', error);
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
    }
};

// Stats module
const Stats = {
    sync(deckId, cards) {
        const deckStats = Storage.getDeckStats(deckId);
        const validCardIds = new Set(cards.map(card => card.card_id));
        const syncedCards = {};

        // Add missing entries for valid cards
        cards.forEach(card => {
            if (!deckStats.cards[card.card_id]) {
                syncedCards[card.card_id] = {
                    "CH->EN": { correct: 0, incorrect: 0, last_reviewed: null },
                    "EN->CH": { correct: 0, incorrect: 0, last_reviewed: null }
                };
            } else {
                syncedCards[card.card_id] = deckStats.cards[card.card_id];
            }
        });

        // Remove orphaned entries (cards that no longer exist in the deck)
        Object.keys(deckStats.cards).forEach(cardId => {
            if (!validCardIds.has(cardId)) {
                console.log(`Removing orphaned stats for card: ${cardId}`);
            } else {
                syncedCards[cardId] = deckStats.cards[cardId];
            }
        });

        const syncedStats = { cards: syncedCards };
        Storage.setDeckStats(deckId, syncedStats);

        console.log(`Stats sync complete for ${deckId}: ${Object.keys(syncedCards).length} cards`);
        return syncedStats;
    },

    getCardStats(deckId, cardId, direction) {
        const deckStats = Storage.getDeckStats(deckId);
        return deckStats.cards[cardId]?.[direction] || { correct: 0, incorrect: 0, last_reviewed: null };
    },

    updateCardStats(deckId, cardId, direction, isCorrect) {
        const deckStats = Storage.getDeckStats(deckId);
        const cardStats = deckStats.cards[cardId] || {
            "CH->EN": { correct: 0, incorrect: 0, last_reviewed: null },
            "EN->CH": { correct: 0, incorrect: 0, last_reviewed: null }
        };

        if (!cardStats[direction]) {
            cardStats[direction] = { correct: 0, incorrect: 0, last_reviewed: null };
        }

        if (isCorrect) {
            cardStats[direction].correct++;
        } else {
            cardStats[direction].incorrect++;
        }

        cardStats[direction].last_reviewed = Date.now();
        deckStats.cards[cardId] = cardStats;
        Storage.setDeckStats(deckId, deckStats);
    }
};

// SRS module
const SRS = {
    scoreCard(stat, nowMs = Date.now()) {
        const { correct, incorrect, last_reviewed } = stat;
        const total = correct + incorrect;
        const is_new = total === 0 ? 1 : 0;
        const error_rate = is_new ? 1 : (1 - (correct / total));
        let days_since;
        if (is_new) {
            days_since = 14;
        } else {
            days_since = Math.min(14, (nowMs - last_reviewed) / 86400000);
        }
        const score = 5.0 * is_new + 3.0 * error_rate + 0.25 * days_since + Math.random() * 0.01;
        return score;
    },

    selectNextCard(cards, statsMap, direction) {
        if (!cards || cards.length === 0) return null;
        let maxScore = -Infinity;
        let selectedCard = null;
        cards.forEach(card => {
            const stat = statsMap[card.card_id]?.[direction];
            const score = this.scoreCard(stat || { correct: 0, incorrect: 0, last_reviewed: null });
            if (score > maxScore) {
                maxScore = score;
                selectedCard = card;
            }
        });
        return selectedCard;
    }
};

// Normalizer module
const Normalizer = {
    normalizePinyin(pinyin) {
        // Convert to lowercase first
        let normalized = pinyin.toLowerCase();

        // Normalize to NFD (decomposed) form to separate base characters from diacritics
        normalized = normalized.normalize('NFD');

        // Remove diacritical marks (combining characters)
        normalized = normalized.replace(/[\u0300-\u036f]/g, '');

        return normalized;
    },

    augmentCardsWithNormalizedPinyin(cards) {
        return cards.map(card => ({
            ...card,
            pinyin_normalized: this.normalizePinyin(card.pinyin)
        }));
    }
};

// Validator module
const Validator = {
    validate(deckJson) {
        const errors = [];
        const validCards = [];
        const seenIds = new Set();

        if (!Array.isArray(deckJson)) {
            errors.push({ type: 'structure', message: 'Deck must be an array of cards' });
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
            errors.push({ type: 'missing_field', cardIndex: index, field: 'card_id', message: 'Missing card_id' });
        }
        if (!card.hanzi) {
            errors.push({ type: 'missing_field', cardIndex: index, field: 'hanzi', message: 'Missing hanzi' });
        }
        if (!card.pinyin) {
            errors.push({ type: 'missing_field', cardIndex: index, field: 'pinyin', message: 'Missing pinyin' });
        }
        if (!card.en_words) {
            errors.push({ type: 'missing_field', cardIndex: index, field: 'en_words', message: 'Missing en_words' });
        }
        if (!card.english) {
            errors.push({ type: 'missing_field', cardIndex: index, field: 'english', message: 'Missing english' });
        }

        // Skip further validation if required fields are missing
        if (errors.length > 0) {
            return errors;
        }

        // Check card_id uniqueness
        if (seenIds.has(card.card_id)) {
            errors.push({ type: 'duplicate_id', cardIndex: index, cardId: card.card_id, message: `Duplicate card_id: ${card.card_id}` });
        } else {
            seenIds.add(card.card_id);
        }

        // Tokenize fields and check token count equality
        const hanziTokens = this.tokenize(card.hanzi);
        const pinyinTokens = this.tokenize(card.pinyin);
        const enWordsTokens = Array.isArray(card.en_words) ? card.en_words : this.tokenize(card.en_words);

        if (hanziTokens.length !== pinyinTokens.length || hanziTokens.length !== enWordsTokens.length) {
            errors.push({
                type: 'token_mismatch',
                cardIndex: index,
                cardId: card.card_id,
                message: `Token count mismatch - hanzi: ${hanziTokens.length}, pinyin: ${pinyinTokens.length}, en_words: ${enWordsTokens.length}`
            });
        }

        return errors;
    },

    tokenize(text) {
        // Split on whitespace and filter out empty strings
        return text.split(/\s+/).filter(token => token.length > 0);
    },

    showValidationErrors(deckId, errors) {
        if (errors.length === 0) {
            this.hideValidationBanner();
            return;
        }

        let banner = document.getElementById('validation-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'validation-banner';
            banner.className = 'validation-banner';
            document.body.insertBefore(banner, document.body.firstChild);
        }

        const errorSummary = errors.slice(0, 5).map(error =>
            `Card ${error.cardIndex + 1}: ${error.message}`
        ).join('<br>');

        const remainingCount = Math.max(0, errors.length - 5);
        const remainingText = remainingCount > 0 ? `<br>... and ${remainingCount} more errors` : '';

        banner.innerHTML = `
            <div class="validation-content">
                <span class="validation-message">
                    <strong>${DECKS[deckId].label} validation:</strong> ${errors.length} errors found<br>
                    ${errorSummary}${remainingText}
                </span>
            </div>
        `;
        banner.style.display = 'block';
    },

    hideValidationBanner() {
        const banner = document.getElementById('validation-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    }
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
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw error;
        }
    },

    showErrorBanner(deckId, errorMessage) {
        let banner = document.getElementById('error-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'error-banner';
            banner.className = 'error-banner';
            document.body.insertBefore(banner, document.body.firstChild);
        }

        banner.innerHTML = `
            <div class="error-content">
                <span class="error-message">Failed to load ${DECKS[deckId].label}: ${errorMessage}</span>
                <button class="retry-btn" onclick="DeckLoader.retryFetch('${deckId}')">Retry</button>
            </div>
        `;
        banner.style.display = 'block';
    },

    hideErrorBanner() {
        const banner = document.getElementById('error-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    },

    retryFetch(deckId) {
        this.fetch(deckId).catch(() => {
            // Error already handled in fetch method
        });
    }
};

// DeckSelector module
const DeckSelector = {
    isLoading: false,
    currentDeckId: null,

    async init() {
        await this.populateOptions();
        this.loadSelectedDeck();
        this.bindSelector();
    },

    async populateOptions() {
        const selector = document.getElementById('deck-selector');
        if (!selector) return;

        this.setStatusMessage('Loading deck list...', 'info');

        // Clear existing options except the first one
        while (selector.options.length > 1) {
            selector.remove(1);
        }

        // Add deck options with names from JSON
        for (const deckId of Object.keys(DECKS)) {
            try {
                const deckData = await this.fetchDeckData(deckId);
                const deckName = deckData.deck_name || DECKS[deckId].label;

                const option = document.createElement('option');
                option.value = deckId;
                option.textContent = deckName;
                selector.appendChild(option);
            } catch (error) {
                console.warn(`Failed to load deck name for ${deckId}, using fallback:`, error);
                // Fallback to hardcoded label if fetch fails
                const option = document.createElement('option');
                option.value = deckId;
                option.textContent = DECKS[deckId].label;
                selector.appendChild(option);
            }
        }

        this.setStatusMessage(`${Object.keys(DECKS).length} decks available`, 'success');
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

    loadSelectedDeck() {
        const settings = Storage.getSettings();
        const selector = document.getElementById('deck-selector');
        if (selector && settings.selected_deck) {
            selector.value = settings.selected_deck;
            this.currentDeckId = settings.selected_deck;
            // Load the default deck
            this.loadDeck(settings.selected_deck).catch(error => {
                console.error('Failed to load default deck:', error);
                // If default deck fails, try to load the first available deck
                const firstDeckId = Object.keys(DECKS)[0];
                if (firstDeckId && firstDeckId !== settings.selected_deck) {
                    console.log('Falling back to first available deck:', firstDeckId);
                    this.loadDeck(firstDeckId);
                }
            });
        }
    },

    bindSelector() {
        const selector = document.getElementById('deck-selector');
        if (selector) {
            selector.addEventListener('change', (e) => {
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
            console.log('Deck loading already in progress, ignoring request');
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
                return;
            }

            // Hide any previous validation errors
            Validator.hideValidationBanner();

            // Normalize and augment cards
            const augmentedCards = Normalizer.augmentCardsWithNormalizedPinyin(validCards);

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
            App.currentCard = SRS.selectNextCard(App.currentCards, App.currentStats.cards, App.currentDirection);
            if (App.currentCard) {
                Review.renderCard(App.currentCard);
            } else {
                document.getElementById('card-container').innerHTML = '<p>No valid cards in this deck.</p>';
            }

            // Ensure selector shows current selection
            const selector = document.getElementById('deck-selector');
            if (selector && selector.value !== deckId) {
                selector.value = deckId;
            }

            // Reset review view to show first card
            this.resetReviewView();

            this.setStatusMessage(`Loaded ${DECKS[deckId].label} (${augmentedCards.length} cards)`, 'success');
            console.log(`Successfully loaded deck: ${DECKS[deckId].label} with ${augmentedCards.length} cards`);

        } catch (error) {
            this.setStatusMessage(`Failed to load ${DECKS[deckId].label}`, 'error');
            console.error(`Failed to load deck ${deckId}:`, error);
            // Error handling is done in DeckLoader.fetch()
        } finally {
            this.isLoading = false;
            this.setLoadingState(false);
        }
    },

    setLoadingState(loading) {
        const selector = document.getElementById('deck-selector');
        const statusElement = document.getElementById('deck-status');

        if (selector) {
            selector.disabled = loading;
            selector.style.opacity = loading ? '0.6' : '1';
        }

        if (statusElement) {
            if (loading) {
                statusElement.textContent = 'Loading deck...';
                statusElement.className = 'deck-status loading';
            } else {
                statusElement.textContent = '';
                statusElement.className = 'deck-status';
            }
        }
    },

    setStatusMessage(message, type = 'info') {
        const statusElement = document.getElementById('deck-status');
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
    }
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
        const button = document.getElementById('direction-toggle');
        if (button) {
            button.textContent = direction;
            button.dataset.direction = direction;
        }
        App.currentDirection = direction;
        if (App.currentCard) {
            Review.applyDirectionAndFlip();
        }
    },

    toggleDirection() {
        const currentDirection = Storage.getSettings().direction;
        const newDirection = currentDirection === "CH->EN" ? "EN->CH" : "CH->EN";
        Storage.setSettings({ direction: newDirection });
        this.applyDirection(newDirection);
    },

    bindDirectionToggle() {
        const button = document.getElementById('direction-toggle');
        if (button) {
            button.addEventListener('click', () => {
                this.toggleDirection();
            });
            button.disabled = false;
        }
    }
};

// TM-Flash Application
const App = {
    currentCards: null,
    currentStats: null,
    currentCard: null,
    flipped: false,
    currentDirection: 'CH->EN',
    currentDeckId: null,

    async init() {
        console.log('TM-Flash initialized');
        console.log('Deck registry:', DECKS);
        // Initialize storage
        Storage.loadState();
        // Initialize settings
        Settings.init();
        // Initialize deck selector
        await DeckSelector.init();
        // Initialize navigation
        Nav.init();
        // Initialize review
        Review.init();
    }
};

// Navigation module
const Nav = {
    init() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const viewId = e.target.dataset.view;
                this.show(viewId);
            });
        });
    },

    show(viewId) {
        // Hide all views
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.add('is-hidden'));

        // Show selected view
        const selectedView = document.getElementById(`view-${viewId}`);
        if (selectedView) {
            selectedView.classList.remove('is-hidden');
        }

        // Update active tab
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => tab.classList.remove('active'));

        const activeTab = document.querySelector(`[data-view="${viewId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
};

// Review module
const Review = {
    init() {
        this.bindEvents();
    },

    renderCard(card) {
        if (!card) return;
        const hanziTokens = card.hanzi.split(' ');
        const pinyinTokens = card.pinyin.split(' ');
        const enWords = card.en_words;
        const table = document.getElementById('card-table');
        table.innerHTML = `
            <tr class="row-hanzi">
                ${hanziTokens.map(token => `<td>${this.escapeHtml(token)}</td>`).join('')}
            </tr>
            <tr class="row-pinyin">
                ${pinyinTokens.map(token => `<td>${this.escapeHtml(token)}</td>`).join('')}
            </tr>
            <tr class="row-en-words">
                ${enWords.map(word => `<td>${this.escapeHtml(word)}</td>`).join('')}
            </tr>
            <tr class="row-english">
                <td colspan="${hanziTokens.length}">${this.escapeHtml(card.english)}</td>
            </tr>
        `;
        this.applyDirectionAndFlip();
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    applyDirectionAndFlip() {
        const table = document.getElementById('card-table');
        const direction = App.currentDirection;
        const flipped = App.flipped;
        table.className = `direction-${direction.toLowerCase().replace('->', '-')} ${flipped ? 'flipped' : ''}`;

        const buttons = document.getElementById('card-buttons');
        if (buttons) {
            buttons.style.display = flipped ? 'flex' : 'none';
        }
    },

    toggleFlip() {
        App.flipped = !App.flipped;
        this.applyDirectionAndFlip();
    },

    onCorrect() {
        console.log('onCorrect called');
        if (!App.currentCard) {
            console.log('No current card');
            return;
        }
        Stats.updateCardStats(App.currentDeckId, App.currentCard.card_id, App.currentDirection, true);
        this.advanceToNextCard();
    },

    onIncorrect() {
        console.log('onIncorrect called');
        if (!App.currentCard) {
            console.log('No current card');
            return;
        }
        Stats.updateCardStats(App.currentDeckId, App.currentCard.card_id, App.currentDirection, false);
        this.advanceToNextCard();
    },

    advanceToNextCard() {
        App.flipped = false;
        App.currentCard = SRS.selectNextCard(App.currentCards, App.currentStats.cards, App.currentDirection);
        if (App.currentCard) {
            this.renderCard(App.currentCard);
        } else {
            document.getElementById('card-container').innerHTML = '<p>No more cards to review.</p>';
        }
    },

  bindEvents() {
    document.getElementById('btn-correct').addEventListener('click', () => this.onCorrect());
    document.getElementById('btn-incorrect').addEventListener('click', () => this.onIncorrect());

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!App.flipped) {
          this.toggleFlip();
        }
      } else if (e.code === 'ArrowRight') {
        if (App.flipped) {
          e.preventDefault();
          this.onCorrect();
        }
      } else if (e.code === 'ArrowLeft') {
        if (App.flipped) {
          e.preventDefault();
          this.onIncorrect();
        }
      }
    });

    // Swipe and click
    let startX = 0;
    let startY = 0;
    const cardContainer = document.getElementById('card-container');
    cardContainer.addEventListener('click', () => {
      if (!App.flipped) {
        this.toggleFlip();
      }
    });
    cardContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    cardContainer.addEventListener('touchend', (e) => {
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
  }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await App.init();
});