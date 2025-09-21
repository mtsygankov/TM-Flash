// Validator module
const Validator = {
  validate(deckJson) {
    const errors = [];
    const validCards = [];
    const seenIds = new Set();

    if (!Array.isArray(deckJson)) {
      errors.push({
        type: "structure",
        message: "Deck must be an array of cards",
      });
      return { validCards, errors };
    }

    deckJson.forEach((card, index) => {
      const cardErrors = this.validateCard(card, index, seenIds);
      if (cardErrors.length === 0) {
        validCards.push(card);
      } else {
        errors.push(...cardErrors);
      }
    });

    return { validCards, errors };
  },

  validateCard(card, index, seenIds) {
    const errors = [];

    // Check required fields
    if (!card.card_id) {
      errors.push({
        type: "missing_field",
        cardIndex: index,
        field: "card_id",
        message: "Missing card_id",
      });
    }
    if (!card.hanzi) {
      errors.push({
        type: "missing_field",
        cardIndex: index,
        field: "hanzi",
        message: "Missing hanzi",
      });
    }
    if (!card.pinyin) {
      errors.push({
        type: "missing_field",
        cardIndex: index,
        field: "pinyin",
        message: "Missing pinyin",
      });
    }
    if (!card.en_words) {
      errors.push({
        type: "missing_field",
        cardIndex: index,
        field: "en_words",
        message: "Missing en_words",
      });
    }
    if (!card.english) {
      errors.push({
        type: "missing_field",
        cardIndex: index,
        field: "english",
        message: "Missing english",
      });
    }

    // Skip further validation if required fields are missing
    if (errors.length > 0) {
      return errors;
    }

    // Check card_id uniqueness
    if (seenIds.has(card.card_id)) {
      errors.push({
        type: "duplicate_id",
        cardIndex: index,
        cardId: card.card_id,
        message: `Duplicate card_id: ${card.card_id}`,
      });
    } else {
      seenIds.add(card.card_id);
    }

    // Tokenize fields and check token count equality
    const hanziTokens = this.tokenize(card.hanzi);
    const pinyinTokens = this.tokenize(card.pinyin);
    const enWordsTokens = Array.isArray(card.en_words)
      ? card.en_words
      : this.tokenize(card.en_words);

    if (
      hanziTokens.length !== pinyinTokens.length ||
      hanziTokens.length !== enWordsTokens.length
    ) {
      errors.push({
        type: "token_mismatch",
        cardIndex: index,
        cardId: card.card_id,
        message: `Token count mismatch - hanzi: ${hanziTokens.length}, pinyin: ${pinyinTokens.length}, en_words: ${enWordsTokens.length}`,
      });
    }

    return errors;
  },

  tokenize(text) {
    // Split on whitespace and filter out empty strings
    return text.split(/\s+/).filter((token) => token.length > 0);
  },

  showValidationErrors(deckId, errors) {
    if (errors.length === 0) {
      this.hideValidationBanner();
      return;
    }

    let banner = document.getElementById("validation-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "validation-banner";
      banner.className = "validation-banner";
      document.body.insertBefore(banner, document.body.firstChild);
    }

    const errorSummary = errors
      .slice(0, 5)
      .map((error) => `Card ${error.cardIndex + 1}: ${error.message}`)
      .join("<br>");

    const remainingCount = Math.max(0, errors.length - 5);
    const remainingText =
      remainingCount > 0 ? `<br>... and ${remainingCount} more errors` : "";

    banner.innerHTML = `
            <div class="validation-content">
                <span class="validation-message">
                    <strong>${DECKS[deckId].label} validation:</strong> ${errors.length} errors found<br>
                    ${errorSummary}${remainingText}
                </span>
            </div>
        `;
    banner.style.display = "block";
  },

  hideValidationBanner() {
    const banner = document.getElementById("validation-banner");
    if (banner) {
      banner.style.display = "none";
    }
  },
};