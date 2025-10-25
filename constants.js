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

const DIRECTION_DISPLAY = {
  [DIRECTION_KEYS.CH_TO_EN]: "CH⇆EN",
  [DIRECTION_KEYS.EN_TO_CH]: "EN⇆CH",
};

// Deck registry
const DECKS = {
  deck_a: {
    label: "Deck A",
    url: "decks/deck_a.json",
  },
  deck_b: {
    label: "Deck B",
    url: "decks/deck_b.json",
  },
  deck_c: {
    label: "Deck C",
    url: "decks/deck_c.json",
  },
  deck_d: {
    label: "Deck D",
    url: "decks/deck_d.json",
  },
};