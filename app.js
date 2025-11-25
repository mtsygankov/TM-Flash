// TM-Flash Application
const App = {
  currentCards: null,
  currentFilteredCards: null,
  currentStats: null,
  currentCard: null,
  flipped: false,
   currentMode: DEFAULT_MODE.id,
  currentDeckId: null,
  savedReviewCardId: null,
  savedReviewFlipped: false,

  async init() {
    // Show loading progress from the start
    DeckSelector.showLoadingProgress();
    DeckSelector.updateLoadingProgress(5, "Loading configuration...");

    // Load deck configuration first
    await ConfigLoader.load();
    console.log("Deck registry:", DECKS);
    DeckSelector.updateLoadingProgress(15, "Initializing storage...");

    // Initialize storage
    Storage.loadState();
    // Initialize settings FIRST (loads toggles)
    Settings.init();
    DeckSelector.updateLoadingProgress(25, "Loading deck list...");

    // Initialize deck selector (now toggles are loaded)
    await DeckSelector.init();
    // Load mode now that deck is loaded
    Settings.loadMode();
    DeckSelector.updateLoadingProgress(50, "Initializing interface...");

    // Initialize navigation
    Nav.init();
    // Initialize review (now safe to bind events)
    Review.init();
    // Initialize stats view
    StatsView.init();
     // Initialize search
     Search.init();
     // Initialize modal
     Modal.init();

    DeckSelector.updateLoadingProgress(100, "Ready!");
    DeckSelector.hideLoadingProgress();
   },
};