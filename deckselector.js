// DeckSelector module
const DeckSelector = {
  isLoading: false,
  currentDeckId: null,

  async init() {
    await this.populateOptions();
    await this.loadSelectedDeck();
    this.bindSelector();
  },

  async populateOptions() {
    const selector = document.getElementById("deck-selector");
    if (!selector) return;

    this.setStatusMessage("Loading deck list...", "info");

    // Clear existing options except the first one
    while (selector.options.length > 1) {
      selector.remove(1);
    }

    // Add deck options with names from JSON
    for (const deckId of Object.keys(DECKS)) {
      try {
        const deckData = await this.fetchDeckData(deckId);
        const deckName = deckData.deck_name || DECKS[deckId].label;

        const option = document.createElement("option");
        option.value = deckId;
        option.textContent = deckName;
        selector.appendChild(option);
      } catch (error) {
        console.warn(
          `Failed to load deck name for ${deckId}, using fallback:`,
          error,
        );
        // Fallback to hardcoded label if fetch fails
        const option = document.createElement("option");
        option.value = deckId;
        option.textContent = DECKS[deckId].label;
        selector.appendChild(option);
      }
    }

    this.setStatusMessage(
      `${Object.keys(DECKS).length} decks available`,
      "success",
    );
  },

  async fetchDeckData(deckId) {
    const deck = DECKS[deckId];
    if (!deck) {
      throw new Error(`Unknown deck: ${deckId}`);
    }

    const response = await fetch(deck.url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  async loadSelectedDeck() {
    const settings = Storage.getSettings();
    const selector = document.getElementById("deck-selector");
    if (selector && settings.selected_deck) {
      selector.value = settings.selected_deck;
      this.currentDeckId = settings.selected_deck;
      // Load the default deck
      try {
        await this.loadDeck(settings.selected_deck);
      } catch (error) {
        console.error("Failed to load default deck:", error);
        // If default deck fails, try to load the first available deck
        const firstDeckId = Object.keys(DECKS)[0];
        if (firstDeckId && firstDeckId !== settings.selected_deck) {
          console.log("Falling back to first available deck:", firstDeckId);
          await this.loadDeck(firstDeckId);
        }
      }
    }
  },

  bindSelector() {
    const selector = document.getElementById("deck-selector");
    if (selector) {
      selector.addEventListener("change", (e) => {
        const selectedDeck = e.target.value;
        if (selectedDeck && selectedDeck !== this.currentDeckId) {
          console.log(`Switching to deck: ${selectedDeck}`);
          this.loadDeck(selectedDeck).catch(() => {
            // If loading fails, revert selector to current deck
            if (this.currentDeckId) {
              selector.value = this.currentDeckId;
            }
          });
        } else if (!selectedDeck) {
          // If user selects empty option, revert to current deck
          if (this.currentDeckId) {
            selector.value = this.currentDeckId;
          }
        }
      });
    }
  },

  async loadDeck(deckId) {
    if (this.isLoading) {
      console.log("Deck loading already in progress, ignoring request");
      return;
    }

    this.isLoading = true;
    this.setLoadingState(true);

    try {
      console.log(`Loading deck: ${deckId}`);
      const deckData = await DeckLoader.fetch(deckId);

      // Extract cards array from deck object
      const cards = deckData.cards || [];

      // Validate the cards
      const { validCards, errors } = Validator.validate(cards);

      if (errors.length > 0) {
        console.warn(`Validation errors in deck ${deckId}:`, errors);
        Validator.showValidationErrors(deckId, errors);
        // Store error count
        const deckStats = Storage.getDeckStats(deckId);
        deckStats.errorCount = errors.length;
        Storage.setDeckStats(deckId, deckStats);
        return;
      }

      // Hide any previous validation errors
      Validator.hideValidationBanner();
      // Reset error count
      const deckStats = Storage.getDeckStats(deckId);
      deckStats.errorCount = 0;
      Storage.setDeckStats(deckId, deckStats);

      // Normalize and augment cards
      const augmentedCards =
        Normalizer.augmentCardsWithNormalizedPinyin(validCards);

      // Sync stats with the loaded deck
      const syncedStats = Stats.sync(deckId, augmentedCards);

      // Update storage with selected deck
      Storage.setSettings({ selected_deck: deckId });

      // Update current deck tracking
      this.currentDeckId = deckId;

        // Set app state
        App.currentCards = augmentedCards;
        App.currentStats = syncedStats;
        App.currentDirection = Storage.getSettings().direction;
        App.currentDeckId = deckId;
        App.flipped = false;
        App.currentCard = SRS.selectNextCard(
          App.currentCards,
          App.currentStats.cards,
          App.currentDirection,
        );
          if (App.currentCard) {
            Review.renderCard(App.currentCard);
          } else {
            Review.renderCard(null);
            let message;
            if (!App.currentCards || App.currentCards.length === 0) {
              message = 'No valid cards in this deck.';
            } else {
              const nextReviewInfo = SRS.getNextReviewInfo(App.currentCards, App.currentStats.cards, App.currentDirection);
              if (nextReviewInfo) {
                message = `No cards due for review. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
              } else {
                message = 'No cards due for review.';
              }
            }
            Message.show('card-container', message);
          }

      // Ensure selector shows current selection
      const selector = document.getElementById("deck-selector");
      if (selector && selector.value !== deckId) {
        selector.value = deckId;
      }

      // Reset review view to show first card
      this.resetReviewView();

      // Re-render stats view so visuals update for the newly loaded deck
      try {
        if (typeof StatsView !== 'undefined' && StatsView.render) {
          StatsView.render();
        }
      } catch (e) {
        console.warn('StatsView.render failed after deck load:', e);
      }

      this.setStatusMessage(
        `Loaded ${DECKS[deckId].label} (${augmentedCards.length} cards)`,
        "success",
      );
      console.log(
        `Successfully loaded deck: ${DECKS[deckId].label} with ${augmentedCards.length} cards`,
      );
    } catch (error) {
      this.setStatusMessage(`Failed to load ${DECKS[deckId].label}`, "error");
      console.error(`Failed to load deck ${deckId}:`, error);
      // Error handling is done in DeckLoader.fetch()
    } finally {
      this.isLoading = false;
      this.setLoadingState(false);
    }
  },

  setLoadingState(loading) {
    const selector = document.getElementById("deck-selector");
    const statusElement = document.getElementById("deck-status");

    if (selector) {
      selector.disabled = loading;
      selector.style.opacity = loading ? "0.6" : "1";
    }

    if (statusElement) {
      if (loading) {
        statusElement.textContent = "Loading deck...";
        statusElement.className = "deck-status loading";
      } else {
        statusElement.textContent = "";
        statusElement.className = "deck-status";
      }
    }
  },

  setStatusMessage(message, type = "info") {
    const statusElement = document.getElementById("deck-status");
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `deck-status ${type}`;
    }
  },

  resetReviewView() {
    App.flipped = false;
    if (App.currentCard) {
      Review.renderCard(App.currentCard);
    }
    // Ensure stats view updates if visible
    try {
      if (typeof StatsView !== 'undefined' && StatsView.render) {
        StatsView.render();
      }
    } catch (e) {
      console.warn('StatsView.render failed in resetReviewView:', e);
    }
  },
};