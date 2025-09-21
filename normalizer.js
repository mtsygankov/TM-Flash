// Normalizer module
const Normalizer = {
  normalizePinyin(pinyin) {
    // Convert to lowercase first
    let normalized = pinyin.toLowerCase();

    // Normalize to NFD (decomposed) form to separate base characters from diacritics
    normalized = normalized.normalize("NFD");

    // Remove diacritical marks (combining characters)
    normalized = normalized.replace(/[\u0300-\u036f]/g, "");

    return normalized;
  },

  augmentCardsWithNormalizedPinyin(cards) {
    return cards.map((card) => ({
      ...card,
      pinyin_normalized: this.normalizePinyin(card.pinyin),
    }));
  },
};