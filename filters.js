// Filters module
const Filters = {
  selectedTags: new Set(),
  selectedHskLevels: new Set(),
  availableTags: new Set(),
  availableHskLevels: new Set(),
  isInitialized: false,

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.bindEvents();
  },

  bindEvents() {
    // No longer needed since filters are in modal
  },


  extractAvailableFilters(cards) {
    this.availableTags.clear();
    this.availableHskLevels.clear();

    cards.forEach(card => {
      // Extract tags
      if (card.tags && Array.isArray(card.tags)) {
        card.tags.forEach(tag => this.availableTags.add(tag));
      }

      // Extract HSK levels
      if (card.hsk) {
        this.availableHskLevels.add(card.hsk);
      }
    });

    // Sort for consistent ordering
    this.availableTags = new Set([...this.availableTags].sort());
    this.availableHskLevels = new Set([...this.availableHskLevels].sort());
  },






  applyFilters() {
    if (!App.currentCards || !App.currentCards.length) return;

    let filteredCards = App.currentCards;

    // Apply tag filter
    if (this.selectedTags.size > 0) {
      filteredCards = filteredCards.filter(card =>
        card.tags && card.tags.some(tag => this.selectedTags.has(tag))
      );
    }

    // Apply HSK filter
    if (this.selectedHskLevels.size > 0) {
      filteredCards = filteredCards.filter(card =>
        card.hsk && this.selectedHskLevels.has(card.hsk)
      );
    }

    // Update app state with filtered cards
    App.currentFilteredCards = filteredCards;

    // Update review display
    Review.updateReviewTogglesDisplay();

    // Rerender stats if in stats view
    if (Nav.currentView === 'stats') {
      StatsView.render();
    }

    // If no card is currently selected or it's not in filtered set, select next
    if (!App.currentCard || !filteredCards.find(card => card.card_id === App.currentCard.card_id)) {
      App.flipped = false;
      App.currentCard = SRS.selectNextCard(
        filteredCards,
        App.currentStats.cards,
        App.currentDirection
      );
      if (App.currentCard) {
        Review.renderCard(App.currentCard);
      } else {
        Review.renderCard(null);
        const nextReviewInfo = SRS.getNextReviewInfo(filteredCards, App.currentStats.cards, App.currentDirection);
        let message;
        if (nextReviewInfo) {
          message = `No cards due for review with current filters. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
        } else {
          message = 'No cards due for review with current filters.';
        }
        Message.show('card-container', message);
      }
    }
  },

  clearFilters() {
    this.selectedTags.clear();
    this.selectedHskLevels.clear();
    this.saveFilters();
    this.applyFilters();
  },

  loadSavedFilters() {
    const settings = Storage.getSettings();
    const deckId = App.currentDeckId;

    if (settings.filters && settings.filters[deckId]) {
      const deckFilters = settings.filters[deckId];
      this.selectedTags = new Set(deckFilters.tags || []);
      this.selectedHskLevels = new Set(deckFilters.hsk || []);
    } else {
      this.selectedTags.clear();
      this.selectedHskLevels.clear();
    }
  },

  saveFilters() {
    const settings = Storage.getSettings();
    const deckId = App.currentDeckId;

    if (!settings.filters) {
      settings.filters = {};
    }

    settings.filters[deckId] = {
      tags: Array.from(this.selectedTags),
      hsk: Array.from(this.selectedHskLevels)
    };

    Storage.setSettings(settings);
  },


  // Utility method to get filtered cards for SRS functions
  getFilteredCards() {
    return App.currentFilteredCards || App.currentCards || [];
  }
};