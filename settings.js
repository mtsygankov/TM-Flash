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
          App.starredToggle,
          App.ignoredToggle,
        );

       console.log("🎯 SRS.selectNextCard result:", App.currentCard ? `Card ${App.currentCard.card_id}` : "null");

         if (App.currentCard) {
           console.log("🎨 Rendering card:", App.currentCard.card_id);
           Review.renderCard(App.currentCard);
         } else {
           console.log("📝 No cards due, updating message");
           Review.renderCard(null);
            const nextReviewInfo = SRS.getNextReviewInfo(App.currentCards, App.currentStats.cards, App.currentDirection, App.starredToggle, App.ignoredToggle);
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
      button.textContent = starredToggle ? "★" : "☆";
      button.dataset.starred = starredToggle;
    }
    App.starredToggle = starredToggle;
  },

  applyIgnoredToggle(ignoredToggle) {
    const button = document.getElementById("ignored-toggle");
    if (button) {
      button.textContent = ignoredToggle ? "🚫" : "○";
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
          message = 'No more cards to review.';
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