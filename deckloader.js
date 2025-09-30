// DeckLoader module
const DeckLoader = {
  currentDeck: null,
  currentDeckId: null,

  async fetch(deckId) {
    const deck = DECKS[deckId];
    if (!deck) {
      throw new Error(`Unknown deck: ${deckId}`);
    }

    try {
      this.hideErrorBanner();
      const response = await this.fetchWithTimeout(deck.url, 10000); // 10 second timeout

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.currentDeck = data;
      this.currentDeckId = deckId;
      return data;
    } catch (error) {
      console.error(`Failed to load deck ${deckId}:`, error);
      this.showErrorBanner(deckId, error.message);
      throw error;
    }
  },

  async fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-cache',
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Request timed out");
      }
      throw error;
    }
  },

  showErrorBanner(deckId, errorMessage) {
    let banner = document.getElementById("error-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "error-banner";
      banner.className = "error-banner";
      document.body.insertBefore(banner, document.body.firstChild);
    }

    banner.innerHTML = `
            <div class="error-content">
                <span class="error-message">Failed to load ${DECKS[deckId].label}: ${errorMessage}</span>
                <button class="retry-btn" onclick="DeckLoader.retryFetch('${deckId}')">Retry</button>
            </div>
        `;
    banner.style.display = "block";
  },

  hideErrorBanner() {
    const banner = document.getElementById("error-banner");
    if (banner) {
      banner.style.display = "none";
    }
  },

  retryFetch(deckId) {
    this.fetch(deckId).catch(() => {
      // Error already handled in fetch method
    });
  },
};