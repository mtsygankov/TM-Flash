// Search module
const Search = {
  currentType: "pinyin",

  init() {
    this.updateToggleButton();
    this.bindEvents();
  },

  bindEvents() {
    const queryInput = document.getElementById("search-query");
    const typeToggle = document.getElementById("search-type-toggle");
    queryInput.addEventListener("input", () => {
      this.performSearch();
    });
    typeToggle.addEventListener("click", () => {
      this.toggleType();
      this.performSearch();
    });
  },

  toggleType() {
    this.currentType = this.currentType === "pinyin" ? "english" : "pinyin";
    this.updateToggleButton();
    document.getElementById("search-query").focus();
    console.log("focus");
  },

  updateToggleButton() {
    const toggle = document.getElementById("search-type-toggle");
    const label = document.getElementById("search-label");
    if (this.currentType === "pinyin") {
      label.textContent = "Pinyin:";
      toggle.textContent = "switch to English search";
    } else {
      label.textContent = "English:";
      toggle.textContent = "switch to Pinyin search";
    }
  },

  performSearch() {
    const query = document.getElementById("search-query").value.trim();
    const results = this.filter(query, this.currentType);
    this.renderResults(results);
  },

  filter(query, type) {
    if (!App.currentCards) return [];
    return App.currentCards.filter((card) => {
      if (type === "pinyin") {
        const lowerQuery = query.toLowerCase();
        return !query || card.pinyin_normalized.includes(lowerQuery) || card.hanzi.includes(query);
      } else if (type === "english") {
        return (
          !query || card.english.toLowerCase().includes(query.toLowerCase())
        );
      }
      return false;
    });
  },

  renderResults(results) {
    const container = document.getElementById("search-results");
    if (results.length === 0) {
      container.innerHTML = "<p>No results found.</p>";
      return;
    }
    const list = results
      .map(
        (card) => `
      <div class="search-result" data-card-id="${card.card_id}">
        <div class="result-hanzi">${card.hanzi}</div>
        <div class="result-pinyin">${card.pinyin}</div>
        <div class="result-english">${card.english}</div>
      </div>
    `,
      )
      .join("");
    container.innerHTML = `<div class="search-results-list">${list}</div>`;
    // Bind click events
    container.querySelectorAll(".search-result").forEach((el) => {
      el.addEventListener("click", () => {
        const cardId = el.dataset.cardId;
        this.selectCard(cardId);
      });
    });
  },

    selectCard(cardId) {
      const card = App.currentCards.find((c) => c.card_id === cardId);
      if (card) {
        App.currentCard = card;
        App.flipped = false;
        Review.renderCard(card);
        Nav.show("review");
      }
    },
};