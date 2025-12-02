// Start screen module
const Start = {

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

  render() {
    if (!App.currentDeck || !App.currentCards || !App.currentStats) {
      return;
    }

    const filteredCards = Filters.getFilteredCards();
    const dueCount = SRS.countDueCards(filteredCards, App.currentStats.cards, App.currentMode);

    // Deck info
    const deckInfo = document.getElementById('start-deck-info');
    if (deckInfo) {
      deckInfo.textContent = `Current deck: '${App.currentDeck.deck_name}'`;
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

    // Cards due info - UPDATED to show message for both states
    const cardsDue = document.getElementById('start-cards-due');
    if (cardsDue) {
      if (dueCount > 0) {
        cardsDue.textContent = `${dueCount} card${dueCount > 1 ? 's' : ''} due now.`;
      } else {
        const nextReviewInfo = SRS.getNextReviewInfo(filteredCards, App.currentStats.cards, App.currentMode);
        if (nextReviewInfo) {
          cardsDue.textContent = `No cards due now. Next review: ${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}.`;
        } else {
          cardsDue.textContent = 'No cards due with current filters.';
        }
      }
    }

    // Start button - show/hide based on due cards
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
    // Select first due card before transitioning to review
    const filteredCards = Filters.getFilteredCards();
    App.currentCard = SRS.selectNextCard(
      filteredCards,
      App.currentStats.cards,
      App.currentMode
    );
    App.flipped = false;

    // Transition to review view
    Nav.show('review');
  },

};