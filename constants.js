// Constants
const SRS_WEIGHTS = {
  NEW: 5.0,
  ERROR: 3.0,
  DAYS: 0.25,
};

const SRS_MAX_DAYS = 14;

const DEFAULT_SELECTED_DECK = "deck_a";

// Direction constants
const DIRECTION_KEYS = {
  CH_TO_EN: "CH->EN",
  EN_TO_CH: "EN->CH",
};

// Tone color mappings
const TONE_COLORS = {
  1: 'rgb(255, 0, 0)',    // Red
  2: 'rgb(208, 144, 0)',  // Light Brown
  3: 'rgb(0, 160, 0)',    // Green
  4: 'rgb(0, 68, 255)',   // Blue
  5: 'rgb(0, 0, 0)',      // Black
};

const DIRECTION_DISPLAY = {
  [DIRECTION_KEYS.CH_TO_EN]: "CH⇆EN",
  [DIRECTION_KEYS.EN_TO_CH]: "EN⇆CH",
};

// Fallback deck configuration for backward compatibility
const FALLBACK_DECKS = {
  deck_a: { label: "Deck A", url: "decks/deck_a.json" },
  deck_b: { label: "Deck B", url: "decks/deck_b.json" },
  deck_c: { label: "Deck C", url: "decks/deck_c.json" },
  deck_d: { label: "Deck D", url: "decks/deck_d.json" },
};

// Deck registry - now loaded dynamically from decks/config.json
// DECKS is set by ConfigLoader.load() and accessible via window.DECKS
// For backward compatibility, this getter provides access with fallback
const DECKS = new Proxy({}, {
  get(target, prop) {
    const decks = window.DECKS;
    if (decks && decks[prop]) {
      return decks[prop];
    }
    // Fallback to hardcoded for compatibility during transition
    return FALLBACK_DECKS[prop];
  },
  ownKeys() {
    return Object.keys(window.DECKS || FALLBACK_DECKS);
  },
  getOwnPropertyDescriptor(target, prop) {
    return {
      enumerable: true,
      configurable: true,
      value: this.get(target, prop)
    };
  }
});