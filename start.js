// Start screen module
const Start = {
  lastStateHash: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const startBtn = document.getElementById('start-learning-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.startLearning();
      });
    }
  },

  shouldShowStartScreen() {
    if (!App.currentCards || !App.currentStats) {
      return false;
    }

    const filteredCards = Filters.getFilteredCards();
    const dueCount = SRS.countDueCards(filteredCards, App.currentStats.cards, App.currentDirection);

    // Don't show if no cards due
    if (dueCount === 0) {
      return false;
    }

    // Create a hash of current state
    const stateHash = this.getStateHash();

    // Show if state has changed or this is first time
    const shouldShow = this.lastStateHash !== stateHash;
    this.lastStateHash = stateHash;

    return shouldShow;
  },

  getStateHash() {
    // Create a simple hash of current deck, filters, and mode
    const deckId = App.currentDeckId || '';
    const mode = App.currentMode || '';
    const tags = Array.from(Filters.selectedTags).sort().join(',');
    const hskLevels = Array.from(Filters.selectedHskLevels).sort().join(',');

    return `${deckId}|${mode}|${tags}|${hskLevels}`;
  },

  render() {
    if (!App.currentDeck || !App.currentCards || !App.currentStats) {
      return;
    }

    const filteredCards = Filters.getFilteredCards();
    const dueCount = SRS.countDueCards(filteredCards, App.currentStats.cards, App.currentDirection);

    // Deck info
    const deckInfo = document.getElementById('start-deck-info');
    if (deckInfo) {
      deckInfo.textContent = `Current deck is '${App.currentDeck.deck_name}'`;
    }

    // Filters info
    const filtersInfo = document.getElementById('start-filters-info');
    if (filtersInfo) {
      const filterParts = [];
      if (Filters.selectedTags.size > 0) {
        filterParts.push(`Tags: ${Array.from(Filters.selectedTags).join(', ')}`);
      }
      if (Filters.selectedHskLevels.size > 0) {
        filterParts.push(`HSK: ${Array.from(Filters.selectedHskLevels).join(', ')}`);
      }
      filtersInfo.textContent = filterParts.length > 0 ? `Filters applied: ${filterParts.join(', ')}` : 'No filters applied';
    }

    // Mode info
    const modeInfo = document.getElementById('start-mode-info');
    if (modeInfo) {
      const mode = LEARNING_MODES[App.currentMode];
      if (mode) {
        modeInfo.textContent = `Learning mode: ${mode.name} ${mode.description}`;
      }
    }

    // Cards due info
    const cardsDue = document.getElementById('start-cards-due');
    if (cardsDue) {
      cardsDue.textContent = `There are ${dueCount} cards due now.`;
    }

    // Start button
    const startBtn = document.getElementById('start-learning-btn');
    if (startBtn) {
      if (dueCount > 0) {
        startBtn.style.display = 'block';
        startBtn.textContent = 'Start learning now';
      } else {
        startBtn.style.display = 'none';
      }
    }
  },

  startLearning() {
    // Transition to review view
    Nav.show('review');
  },

  // Called when deck/filters/mode changes to potentially show start screen
  checkAndShow() {
    if (this.shouldShowStartScreen()) {
      Nav.show('start');
    }
  }
};