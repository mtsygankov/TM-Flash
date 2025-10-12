// TM-Flash Application
const App = {
  currentCards: null,
  currentStats: null,
  currentCard: null,
  flipped: false,
  currentDirection: "CH->EN",
  currentDeckId: null,
  starredToggle: false,
  ignoredToggle: false,

  async init() {
    console.log("TM-Flash initialized");
    console.log("Deck registry:", DECKS);
    // Initialize storage
    Storage.loadState();
    // Initialize settings FIRST (loads toggles)
    Settings.init();
    // Initialize deck selector (now toggles are loaded)
    await DeckSelector.init();
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