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
         button.textContent = DIRECTION_DISPLAY[direction];
         button.dataset.direction = direction;
       } else {
         console.warn("❌ Direction toggle button not found");
       }

      App.currentDirection = direction;
      App.flipped = false;


       // Only select/render card if data is available (not during initialization)
       if (App.currentCards && App.currentStats) {
          // Select a new card for the new direction
           App.currentCard = SRS.selectNextCard(
             Filters.getFilteredCards(),
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

           // Update review toggles display after direction change
           Review.updateReviewTogglesDisplay();
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
     const newDirection = currentDirection === DIRECTION_KEYS.CH_TO_EN ? DIRECTION_KEYS.EN_TO_CH : DIRECTION_KEYS.CH_TO_EN;
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