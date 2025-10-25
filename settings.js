// Settings module
const Settings = {
  init() {
    this.bindDirectionToggle();
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
            App.currentDirection
          );

          if (App.currentCard) {
            Review.renderCard(App.currentCard);
          } else {
            Review.renderCard(null);
              const nextReviewInfo = SRS.getNextReviewInfo(App.currentCards, App.currentStats.cards, App.currentDirection);
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

       // Rerender stats if in stats view
       if (Nav.currentView === 'stats') {
         StatsView.render();
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