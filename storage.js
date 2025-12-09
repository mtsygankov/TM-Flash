// Storage module
const Storage = {
  STORAGE_KEY: "tmFlash",
  CURRENT_SCHEMA_VERSION: 6,

  getDefaultState() {
    const emptyStats = { cards: {} };
    const modes = {
      'LM-hanzi-first': emptyStats,
      'LM-meaning-to-chinese': emptyStats,
      'LM-listening': emptyStats,
      'LM-pronunciation': emptyStats,
    };
    return {
      schema_version: this.CURRENT_SCHEMA_VERSION,
          settings: {
            mode: DEFAULT_MODE.id,
            selected_deck: DEFAULT_SELECTED_DECK,
            theme: "light",
            showProgress: true,
            showPinyin: true,
            playAudioOnFlip: false,
          },
       decks: {
         deck_a: { modes: { ...modes } },
         deck_b: { modes: { ...modes } },
         deck_c: { modes: { ...modes } },
         deck_d: { modes: { ...modes } },
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
    const deckData = state.decks[deckId];
    if (!deckData || typeof deckData !== 'object' || !deckData.cards) {
      return { cards: {} };
    }
    return deckData;
  },

  setDeckStats(deckId, statsObj) {
    const state = this.loadState();
    state.decks[deckId] = statsObj;
    this.saveState(state);
  },
};