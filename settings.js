// Settings module
const Settings = {
  init() {
    this.loadDirection();
    this.bindDirectionToggle();
    this.loadToggles();
    this.bindToggleButtons();
  },

  loadDirection() {
    const settings = Storage.getSettings();
    this.applyDirection(settings.direction);
  },

    applyDirection(direction) {
      const button = document.getElementById("direction-toggle");
      if (button) {
        button.textContent = direction;
        button.dataset.direction = direction;
      } else {
        console.warn("❌ Direction toggle button not found");
      }

      App.currentDirection = direction;
      App.flipped = false;

     // Debug current app state
     if (App.currentStats && App.currentStats.cards) {
     }

     // Only select/render card if data is available (not during initialization)
     if (App.currentCards && App.currentStats) {
        // Select a new card for the new direction
        App.currentCard = SRS.selectNextCard(
          App.currentCards,
          App.currentStats.cards,
          App.currentDirection,
          App.starredToggle,
          App.ignoredToggle,
        );

         if (App.currentCard) {
           Review.renderCard(App.currentCard);
         } else {
           Review.renderCard(null);
            const nextReviewInfo = SRS.getNextReviewInfo(App.currentCards, App.currentStats.cards, App.currentDirection, App.starredToggle, App.ignoredToggle);
           let message;
           if (nextReviewInfo) {
                message = `No cards due for review. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
           } else {
             message = 'No cards due for review in this direction.';
           }
           Message.show('card-container', message);
         }
      } else {
        console.warn("❌ Conditional check failed - app data not available");
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

  loadToggles() {
    const settings = Storage.getSettings();
    this.applyStarredToggle(settings.starredToggle);
    this.applyIgnoredToggle(settings.ignoredToggle);
  },

  applyStarredToggle(starredToggle) {
    const button = document.getElementById("starred-toggle");
    if (button) {
      button.textContent = "⭐️";
      button.dataset.starred = starredToggle;
    }
    App.starredToggle = starredToggle;
  },

  applyIgnoredToggle(ignoredToggle) {
    const button = document.getElementById("ignored-toggle");
    if (button) {
      button.textContent = "🚫";
      button.dataset.ignored = ignoredToggle;
    }
    App.ignoredToggle = ignoredToggle;
  },

  toggleStarred() {
    const current = Storage.getSettings().starredToggle;
    const newValue = !current;
    Storage.setSettings({ starredToggle: newValue });
    this.applyStarredToggle(newValue);
    // Reselect card with new filter
    this.reselectCard();
  },

  toggleIgnored() {
    const current = Storage.getSettings().ignoredToggle;
    const newValue = !current;
    Storage.setSettings({ ignoredToggle: newValue });
    this.applyIgnoredToggle(newValue);
    // Reselect card with new filter
    this.reselectCard();
  },

  reselectCard() {
    if (App.currentCards && App.currentStats) {
      App.currentCard = SRS.selectNextCard(
        App.currentCards,
        App.currentStats.cards,
        App.currentDirection,
        App.starredToggle,
        App.ignoredToggle,
      );
      if (App.currentCard) {
        Review.renderCard(App.currentCard);
      } else {
        Review.renderCard(null);
        const nextReviewInfo = SRS.getNextReviewInfo(App.currentCards, App.currentStats.cards, App.currentDirection, App.starredToggle, App.ignoredToggle);
        let message;
        if (nextReviewInfo) {
          message = `No cards due for review. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
        } else {
          message = 'No cards due for review.';
        }

        // Add info about starred/unstarred cards
        const starredCount = SRS.countDueCards(App.currentCards, App.currentStats.cards, App.currentDirection, true, null);
        const unstarredCount = SRS.countDueCards(App.currentCards, App.currentStats.cards, App.currentDirection, false, null);
        if (App.starredToggle) {
          if (unstarredCount > 0) {
            message += ` There are ${unstarredCount} unstarred cards due.`;
          }
        } else {
          if (starredCount > 0) {
            message += ` There are ${starredCount} starred cards due.`;
          }
        }

        Message.show('card-container', message);
      }
    }
  },

  bindToggleButtons() {
    const starredButton = document.getElementById("starred-toggle");
    if (starredButton) {
      starredButton.addEventListener("click", () => {
        this.toggleStarred();
      });
    }
    const ignoredButton = document.getElementById("ignored-toggle");
    if (ignoredButton) {
      ignoredButton.addEventListener("click", () => {
        this.toggleIgnored();
      });
    }
  },
};