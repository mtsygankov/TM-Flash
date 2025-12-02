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
  isInitializing: true,  // Flag to track initialization phase

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
    DeckSelector.updateLoadingProgress(25, "Loading deck list...");

    // Initialize deck selector
    await DeckSelector.init();
    // Initialize settings and load saved mode (now deck data is available)
    Settings.init();
    // Load saved mode
    Settings.loadMode();
    console.log("App.currentMode after load:", App.currentMode);
    DeckSelector.updateLoadingProgress(50, "Initializing interface...");

    // Initialize navigation
    Nav.init();
    // Initialize start screen
    Start.init();
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

    // Show start screen after initialization
    Nav.show('start');

    // Mark initialization as complete
    App.isInitializing = false;
   },
};