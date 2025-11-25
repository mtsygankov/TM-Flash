// Settings module
const Settings = {
  init() {
    this.bindModeToggle();
  },

  loadMode() {
    const settings = Storage.getSettings();
    this.applyMode(settings.mode);
  },

       applyMode(mode) {
       // Check if mode is a valid learning mode id
       const validMode = Object.values(LEARNING_MODES).find(m => m.id === mode);
       if (!validMode) {
         console.warn(`Invalid mode '${mode}', using default`);
         mode = DEFAULT_MODE.id;
       }
       App.currentMode = mode;
       App.flipped = false;


       // Only select/render card if data is available and in review view (not during initialization)
       if (App.currentCards && App.currentStats && Nav.currentView === 'review') {
          // Select a new card for the new mode
           App.currentCard = SRS.selectNextCard(
             Filters.getFilteredCards(),
             App.currentStats.cards,
             App.currentMode
           );

           if (App.currentCard) {
             Review.renderCard(App.currentCard);
           } else {
             Review.renderCard(null);
               const nextReviewInfo = SRS.getNextReviewInfo(App.currentCards, App.currentStats.cards, App.currentMode);
             let message;
             if (nextReviewInfo) {
                  message = `No cards due for review. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
             } else {
               message = 'No cards due for review in this mode.';
             }
             Message.show('card-container', message);
           }

           // Update review toggles display after mode change
           Review.updateReviewTogglesDisplay();
       } else {
         console.warn("❌ Conditional check failed - app data not available or not in review view");
       }

       // Rerender stats if in stats view
       if (Nav.currentView === 'stats') {
         StatsView.render();
       }

       // Check if start screen should be shown after mode change
       Start.checkAndShow();
   },

   toggleMode() {
     const modes = Object.values(LEARNING_MODES);
     const currentMode = Storage.getSettings().mode;
     const currentIndex = modes.findIndex(m => m.id === currentMode);
     const nextIndex = (currentIndex + 1) % modes.length;
     const newMode = modes[nextIndex].id;
     Storage.setSettings({ mode: newMode });
     this.applyMode(newMode);
   },

    bindModeToggle() {
      // For potential future use, e.g., keyboard shortcut
    },










};