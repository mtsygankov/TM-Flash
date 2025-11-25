// Navigation module
const Nav = {
  currentView: "start",  // Track active view for keyboard shortcuts
  init() {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const viewId = e.target.dataset.view;
        this.show(viewId);
      });
    });

    // Global escape key listener for tab switching
    document.addEventListener("keydown", (e) => {
      // Ignore if user is typing in form elements
      /*if ( document.activeElement.tagName === "INPUT" || 
          document.activeElement.tagName === "TEXTAREA" || 
          document.activeElement.tagName === "SELECT") {
        return;
      }*/
      // Switch to review tab if not already there
      if (e.code === "Escape" && this.currentView !== "review") {
        e.preventDefault();  // Prevent any default escape behavior
        this.show("review");
        // Blur active form elements to allow review keyboard shortcuts
        if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT")) {
          document.activeElement.blur();
        }
      }
    });
  },

  async show(viewId) {
    this.currentView = viewId;  // Update current view tracker
    // Save review state if switching away from review
    if (viewId !== "review" && App.currentCard) {
      App.savedReviewCardId = App.currentCard.card_id;
      App.savedReviewFlipped = App.flipped;
    }

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

    // Toggle visibility of review toggles
    const reviewToggles = document.getElementById('review-toggles');
    if (viewId === 'review' || viewId === 'stats') {
      reviewToggles.classList.remove('is-hidden');
    } else {
      reviewToggles.classList.add('is-hidden');
    }

    // Render stats if showing stats view
    if (viewId === "stats") {
      StatsView.render();
    }

    // Render start screen if showing start view
    if (viewId === "start") {
      Start.render();
    }

    // Handle review view
    if (viewId === "review") {
      const deckToLoad = App.currentDeckId || 'deck_a';
      if (!App.currentCards || App.currentDeckId !== deckToLoad) {
        // Deck not loaded or changed, load it
        await DeckSelector.loadDeck(deckToLoad);
      } else {
        // Deck already loaded, restore saved state if exists
        if (App.savedReviewCardId) {
          const filteredCards = Filters.getFilteredCards();
          const card = filteredCards.find(c => c.card_id === App.savedReviewCardId);
          if (card) {
            App.currentCard = card;
            App.flipped = App.savedReviewFlipped;
            Review.updateReviewTogglesDisplay();
            Review.renderCard(card);
            // Clear saved state after restore
            App.savedReviewCardId = null;
            App.savedReviewFlipped = false;
          } else {
            // Card not in filtered set, select next from filtered
            App.currentCard = SRS.selectNextCard(
              filteredCards,
              App.currentStats.cards,
              App.currentMode,
            );
            App.flipped = false;
            Review.updateReviewTogglesDisplay();
            if (App.currentCard) {
              Review.renderCard(App.currentCard);
            } else {
              this.showNoCardsMessage();
            }
          }
        } else {
          // No saved state, ensure current card is valid for filters
          const filteredCards = Filters.getFilteredCards();
          if (!App.currentCard || !filteredCards.find(card => card.card_id === App.currentCard.card_id)) {
            App.currentCard = SRS.selectNextCard(
              filteredCards,
              App.currentStats.cards,
              App.currentMode,
            );
          }
          if (App.currentCard) {
            Review.renderCard(App.currentCard);
          } else {
            this.showNoCardsMessage();
          }
        }
      }
    }
  },

  showNoCardsMessage() {
    const filteredCards = Filters.getFilteredCards();
    const nextReviewInfo = SRS.getNextReviewInfo(filteredCards, App.currentStats.cards, App.currentMode);
    let message;
    if (nextReviewInfo) {
      message = `No cards due for review with current filters. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
    } else {
      message = 'No cards due for review with current filters.';
    }
    Message.show('card-container', message);
  },
};