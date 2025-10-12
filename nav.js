// Navigation module
const Nav = {
  currentView: "review",  // Track active view for keyboard shortcuts
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
    if (viewId === 'review') {
      reviewToggles.classList.remove('is-hidden');
    } else {
      reviewToggles.classList.add('is-hidden');
    }

    // Render stats if showing stats view
    if (viewId === "stats") {
      StatsView.render();
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
          const card = App.currentCards.find(c => c.card_id === App.savedReviewCardId);
          if (card) {
            App.currentCard = card;
            App.flipped = App.savedReviewFlipped;
            Review.renderCard(card);
            // Clear saved state after restore
            App.savedReviewCardId = null;
            App.savedReviewFlipped = false;
          } else {
            // Card not found, select next
            App.currentCard = SRS.selectNextCard(
              App.currentCards,
              App.currentStats.cards,
              App.currentDirection,
              App.starredToggle,
              App.ignoredToggle,
            );
            App.flipped = false;
            Review.renderCard(App.currentCard);
          }
        } else {
          // No saved state, just render current
          Review.renderCard(App.currentCard);
        }
      }
    }
  },
};