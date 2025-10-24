// TM-Flash Application
const App = {
  currentCards: null,
  currentFilteredCards: null,
  currentStats: null,
  currentCard: null,
  flipped: false,
  currentDirection: "CH->EN",
  currentDeckId: null,
  savedReviewCardId: null,
  savedReviewFlipped: false,

  async init() {
    console.log("Deck registry:", DECKS);
    // Initialize storage
    Storage.loadState();
    // Initialize settings FIRST (loads toggles)
    Settings.init();
    // Initialize deck selector (now toggles are loaded)
    await DeckSelector.init();
    // Load direction now that deck is loaded
    Settings.loadDirection();
    // Initialize navigation
    Nav.init();
    // Initialize review (now safe to bind events)
    Review.init();
    // Initialize stats view
    StatsView.init();
    // Initialize search
    Search.init();
  },
};