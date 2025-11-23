// ConfigLoader module - loads deck configuration from config.json
const ConfigLoader = {

  async load() {
    try {
      console.log("Loading deck configuration from config.json...");
      const response = await fetch('decks/config.json', { cache: 'no-cache' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const config = await response.json();

      // Validate config structure
      if (!this.isValidConfig(config)) {
        throw new Error("Invalid config.json structure");
      }

      // Filter enabled decks only
      const enabledDecks = {};
      for (const [deckId, deckConfig] of Object.entries(config.decks)) {
        if (deckConfig.enabled !== false) { // Default to enabled if not specified
          enabledDecks[deckId] = {
            url: deckConfig.url,
          };
        }
      }

      // Set global DECKS variable
      window.DECKS = enabledDecks;
      console.log(`Loaded ${Object.keys(enabledDecks).length} decks from config.json`);

      return enabledDecks;

    } catch (error) {
      console.warn("Failed to load config.json, using fallback configuration:", error);
      // Set global DECKS to fallback
      window.DECKS = FALLBACK_DECKS;
      console.log(`Using fallback configuration with ${Object.keys(FALLBACK_DECKS).length} decks`);
      return FALLBACK_DECKS;
    }
  },

  isValidConfig(config) {
    // Basic validation of config structure
    if (!config || typeof config !== 'object') {
      return false;
    }

    if (!config.decks || typeof config.decks !== 'object') {
      return false;
    }

    // Validate each deck entry
    for (const [deckId, deckConfig] of Object.entries(config.decks)) {
      if (!deckConfig.url) {
        console.warn(`Deck ${deckId} missing required field (url)`);
        return false;
      }
    }

    return true;
  },

  // Get current DECKS (for modules that need synchronous access after loading)
  getDecks() {
    return window.DECKS || FALLBACK_DECKS;
  }
};