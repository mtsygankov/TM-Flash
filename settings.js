// Settings module
const Settings = {
  init() {
    this.loadDirection();
    this.bindDirectionToggle();
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
       );

       console.log("🎯 SRS.selectNextCard result:", App.currentCard ? `Card ${App.currentCard.card_id}` : "null");

         if (App.currentCard) {
           console.log("🎨 Rendering card:", App.currentCard.card_id);
           Review.renderCard(App.currentCard);
         } else {
           console.log("📝 No cards due, updating message");
           Review.renderCard(null);
           const nextReviewInfo = SRS.getNextReviewInfo(App.currentCards, App.currentStats.cards, App.currentDirection);
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

       // Still try to update the message to indicate direction change
       const cardContainer = document.getElementById("card-container");
       if (cardContainer) {
         cardContainer.innerHTML = `<p>Switched to ${direction} direction.</p>`;
         console.log("ℹ️ Updated message with direction change info");
       }
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