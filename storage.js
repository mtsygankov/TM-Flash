// Storage module
const Storage = {
  STORAGE_KEY: "tmFlash",
  CURRENT_SCHEMA_VERSION: 3,

  getDefaultState() {
    return {
      schema_version: this.CURRENT_SCHEMA_VERSION,
      settings: {
        direction: "CH->EN",
        selected_deck: DEFAULT_SELECTED_DECK,
        theme: "light",
      },
      decks: {
        deck_a: { cards: {} },
        deck_b: { cards: {} },
        deck_c: { cards: {} },
        deck_d: { cards: {} },
      },
    };
  },

  loadState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        const defaultState = this.getDefaultState();
        this.saveState(defaultState);
        return defaultState;
      }
      const state = JSON.parse(stored);
      // Ensure schema version is current
      if (state.schema_version !== this.CURRENT_SCHEMA_VERSION) {
        console.warn("Schema version mismatch, using defaults");
        const defaultState = this.getDefaultState();
        this.saveState(defaultState);
        return defaultState;
      }
      return state;
    } catch (error) {
      console.error("Error loading state:", error);
      const defaultState = this.getDefaultState();
      this.saveState(defaultState);
      return defaultState;
    }
  },

  saveState(state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving state:", error);
    }
  },

  getSettings() {
    const state = this.loadState();
    return state.settings;
  },

  setSettings(settings) {
    const state = this.loadState();
    state.settings = { ...state.settings, ...settings };
    this.saveState(state);
  },

  getDeckStats(deckId) {
    const state = this.loadState();
    return state.decks[deckId] || { cards: {} };
  },

  setDeckStats(deckId, statsObj) {
    const state = this.loadState();
    state.decks[deckId] = statsObj;
    this.saveState(state);
  },
};