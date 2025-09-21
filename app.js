// TM-Flash Application
const App = {
  currentCards: null,
  currentStats: null,
  currentCard: null,
  flipped: false,
  currentDirection: "CH->EN",
  currentDeckId: null,

  async init() {
    console.log("TM-Flash initialized");
    console.log("Deck registry:", DECKS);
    // Initialize storage
    Storage.loadState();
    // Initialize deck selector FIRST (loads deck data)
    await DeckSelector.init();
    // Initialize settings (now safe to call applyDirection)
    Settings.init();
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