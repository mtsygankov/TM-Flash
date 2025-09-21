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