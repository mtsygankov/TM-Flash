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
        (card) => {
          const cardStats = App.currentStats?.cards[card.card_id] || {};
          const starred = cardStats.starred || false;
          const ignored = cardStats.ignored || false;
          const tagsHtml = this.renderTags(card.tags || []);
          return `
      <div class="search-result" data-card-id="${card.card_id}">
        ${tagsHtml}
        <div class="search-result-content">
          <div class="result-hanzi">${card.hanzi}</div>
          <div class="result-pinyin">${card.pinyin}</div>
          <div class="result-english-row">
            ${card.pos ? `<span class="result-pos">[ ${card.pos} ]</span>` : ''}
            <div class="result-english">${card.english}</div>
          </div>
        </div>
      </div>
    `;
        },
      )
      .join("");
    container.innerHTML = `<div class="search-results-list">${list}</div>`;

  },

  renderTags(tags) {
    if (!tags || tags.length === 0) return '';

    const tagBadges = tags.map(tag => {
      const colorClass = this.getTagColorClass(tag);
      return `<span class="tag-badge ${colorClass}">${tag}</span>`;
    }).join('');

    return `<div class="search-result-tags">${tagBadges}</div>`;
  },

  getTagColorClass(tag) {
    const colorMap = {
      'Daily Life': 'tag-daily-life',
      'Descriptions': 'tag-descriptions',
      'Grammar': 'tag-grammar',
      'Location': 'tag-location',
      'Objects': 'tag-objects',
      'People': 'tag-people',
      'Numbers': 'tag-numbers',
      'Time': 'tag-time',
      'Nature': 'tag-nature',
      'Expressions': 'tag-expressions'
    };
    return colorMap[tag] || 'tag-default';
  },

    toggleStarFlag(cardId) {
      const cardStats = App.currentStats.cards[cardId];
      if (!cardStats) return;
      const current = cardStats.starred || false;
      cardStats.starred = !current;
      Storage.setDeckStats(App.currentDeckId, App.currentStats);
      // Update button appearance
      const resultEl = document.querySelector(`.search-result[data-card-id="${cardId}"]`);
      if (resultEl) {
        const btn = resultEl.querySelector(".search-star-btn");
        if (btn) {
          btn.dataset.starred = cardStats.starred;
        }
      }
    },

    toggleIgnoreFlag(cardId) {
      const cardStats = App.currentStats.cards[cardId];
      if (!cardStats) return;
      const current = cardStats.ignored || false;
      cardStats.ignored = !current;
      Storage.setDeckStats(App.currentDeckId, App.currentStats);
      // Update button appearance
      const resultEl = document.querySelector(`.search-result[data-card-id="${cardId}"]`);
      if (resultEl) {
        const btn = resultEl.querySelector(".search-ignore-btn");
        if (btn) {
          btn.dataset.ignored = cardStats.ignored;
        }
      }
    },
};
