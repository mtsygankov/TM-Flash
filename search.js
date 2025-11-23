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
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('hanzi-char')) {
          const char = e.target.dataset.char;
          this.currentType = "pinyin";
          this.updateToggleButton();
          document.getElementById("search-query").value = char;
          this.performSearch();
          document.getElementById("search-query").focus();
        }
        if (e.target.classList.contains('bkrs-btn')) {
          const hanzi = e.target.dataset.hanzi;
          window.open(`https://bkrs.info/slovo.php?ch=${hanzi}`, '_blank');
        }
        if (e.target.classList.contains('mdbg-btn')) {
          const hanzi = e.target.dataset.hanzi;
          window.open(`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${hanzi}`, '_blank');
        }
      });
   },

  toggleType() {
    this.currentType = this.currentType === "pinyin" ? "def" : "pinyin";
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
        const normalizedQuery = Normalizer.normalizePinyin(query).replace(/\s/g, '');
        const normalizedPinyin = card.pinyin_normalized.replace(/\s/g, '');
        const normalizedHanzi = card.hanzi.replace(/\s/g, '');
        return !query || normalizedPinyin.includes(normalizedQuery) || normalizedHanzi.includes(normalizedQuery);
      } else if (type === "def") {
        // Keep spaces for English search as words are separate
        return !query || card.def.toLowerCase().includes(query.toLowerCase());
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

    // Helper to generate colored hanzi spans
    const generateColoredHanzi = (hanzi, tones) => {
      const tokens = hanzi.split(" ");
      const wordTones = tones.split(" ");
      let tokenIndex = 0;
      let html = '';
      wordTones.forEach(wordTone => {
        const digits = wordTone.split("");
        digits.forEach(digit => {
          const color = TONE_COLORS[digit];
          const char = tokens[tokenIndex];
          html += `<span class="hanzi-char" data-char="${char}" style="color: ${color};">${char}</span>`;
          tokenIndex++;
        });
      });
      return html;
    };

    // Helper to generate colored pinyin spans
    const generateColoredPinyin = (pinyin, tones) => {
      const tokens = pinyin.split(" ");
      const wordTones = tones.split(" ");
      let tokenIndex = 0;
      let html = '';
      wordTones.forEach(wordTone => {
        const digits = wordTone.split("");
        digits.forEach(digit => {
          const color = TONE_COLORS[digit];
          const syllable = tokens[tokenIndex];
          html += `<span style="color: ${color};">${syllable}</span> `;
          tokenIndex++;
        });
      });
      return html.trim();
    };

    const list = results
      .map(
        (card) => {
          const cardStats = App.currentStats?.cards[card.card_id] || {};
          const tagsHtml = this.renderTags(card);
          const hasTags = tagsHtml !== '';
            const cleanHanzi = card.hanzi.replace(/\s/g, '');
            return `
      <div class="search-result ${hasTags ? 'has-tags' : 'no-tags'}" data-card-id="${card.card_id}">
        ${tagsHtml}
         <div class="result-hanzi-pinyin">
           <div class="result-hanzi">${generateColoredHanzi(card.hanzi, card.tones)}</div>
           <div class="result-pinyin">${generateColoredPinyin(card.pinyin, card.tones)}</div>
         </div>
        <div class="result-def-column">
          ${card.pos ? `<span class="result-pos">[ ${card.pos} ]</span>` : ''}
          <div class="result-def">${card.def}</div>
        </div>
        <div class="search-result-buttons">
          <button class="dict-btn bkrs-btn" data-hanzi="${cleanHanzi}">🔗 BKRS</button>
          <button class="dict-btn mdbg-btn" data-hanzi="${cleanHanzi}">🔗 MDBG</button>
        </div>
       </div>
     `;
        },
      )
      .join("");
    container.innerHTML = `<div class="search-results-list">${list}</div>`;

  },

  renderTags(card) {
    if (!card.hsk) return '';
    return `<div class="search-result-tags"><span class="hsk-badge">${card.hsk}</span></div>`;
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

};
