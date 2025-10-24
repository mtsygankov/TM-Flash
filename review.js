// Review module
const Review = {
  init() {
    this.bindEvents();
    // Recalculate scale on window resize
    window.addEventListener('resize', () => {
      if (App.currentCard) {
        this.renderCard(App.currentCard);
      }
    });
  },

  renderCard(card) {
    Message.hide('card-container');
    if (!card) {
      const table = document.getElementById("card-table");
      const englishSection = document.getElementById("card-english");
      if (table) {
        table.innerHTML = "";
      }
      if (englishSection) {
        englishSection.querySelector('.pos-prefix').textContent = '';
        englishSection.querySelector('.english-text').textContent = '';
      }
      return;
    }
    const hanziTokens = card.hanzi.split(" ");
    const pinyinTokens = card.pinyin.split(" ");
    const enWords = card.en_words || [];
    const table = document.getElementById("card-table");
    const englishSection = document.getElementById("card-english");
    if (!table || !englishSection) return;
    
    // Render table with only hanzi, pinyin, and en-words rows
    table.innerHTML = `
            <tr class="row-hanzi">
                ${hanziTokens.map((token) => `<td>${this.escapeHtml(token)}</td>`).join("")}
            </tr>
            <tr class="row-pinyin">
                ${pinyinTokens.map((token) => `<td>${this.escapeHtml(token)}</td>`).join("")}
            </tr>
            <tr class="row-en-words">
                ${enWords.map((word) => `<td>${this.escapeHtml(word)}</td>`).join("")}
            </tr>
        `;

    // Render english section separately
    const posPrefix = englishSection.querySelector('.pos-prefix');
    const englishText = englishSection.querySelector('.english-text');
    posPrefix.textContent = card.pos ? `[ ${this.escapeHtml(card.pos)} ] ` : '';
    englishText.textContent = this.escapeHtml(card.english);

    // Dynamic font scaling for hanzi/pinyin table (more accurate now)
    const columns = hanziTokens.length;
    const totalChars = hanziTokens.reduce((sum, token) => sum + token.length, 0);
    const tableWrapper = document.getElementById('card-table-wrapper');
    const tableWrapperPadding = parseFloat(getComputedStyle(tableWrapper).paddingLeft) + parseFloat(getComputedStyle(tableWrapper).paddingRight);
    const availableWidth = tableWrapper.clientWidth - tableWrapperPadding;
    const baseCharSize = 4 * 16; // 4rem in px per hanzi char
    const cellPadding = 0.75 * 2 * 16; // 0.75rem * 2 sides in px
    const borderSpacing = 0.5 * 16; // 0.5rem in px
    const estimatedWidth = totalChars * baseCharSize + (columns - 1) * borderSpacing + columns * cellPadding;
    const scale = Math.max(0.5, Math.min(1, availableWidth / estimatedWidth));
    table.style.setProperty('--scale-factor', scale);

    // Independent font scaling for english section
    const container = document.getElementById('card-container');
    const containerPadding = parseFloat(getComputedStyle(container).paddingLeft) + parseFloat(getComputedStyle(container).paddingRight);
    const englishAvailableWidth = container.clientWidth - containerPadding;
    const englishTextLength = card.english.length + (card.pos ? card.pos.length : 0);
    const englishBaseCharSize = 3 * 16; // 3rem in px per english char
    const englishEstimatedWidth = englishTextLength * englishBaseCharSize * 0.6; // English chars are narrower
    const englishScale = Math.max(0.6, Math.min(1, englishAvailableWidth / englishEstimatedWidth));
    englishSection.style.setProperty('--english-scale-factor', englishScale);

    // Add click handlers for search
    const hanziCells = table.querySelectorAll('.row-hanzi td');
    hanziCells.forEach(cell => {
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById("search-query").value = cell.textContent;
        Search.currentType = "pinyin";
        Search.updateToggleButton();
        Nav.show("search");
        Search.performSearch();
      });
    });

    const pinyinCells = table.querySelectorAll('.row-pinyin td');
    pinyinCells.forEach(cell => {
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById("search-query").value = Normalizer.normalizePinyin(cell.textContent);
        Search.currentType = "pinyin";
        Search.updateToggleButton();
        Nav.show("search");
        Search.performSearch();
      });
    });

    const enWordsCells = table.querySelectorAll('.row-en-words td');
    enWordsCells.forEach(cell => {
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById("search-query").value = cell.textContent;
        Search.currentType = "english";
        Search.updateToggleButton();
        Nav.show("search");
        Search.performSearch();
      });
    });

    // Add click handler for english text
    englishText.style.cursor = 'pointer';
    englishText.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById("search-query").value = englishText.textContent;
      Search.currentType = "english";
      Search.updateToggleButton();
      Nav.show("search");
      Search.performSearch();
     });

     this.applyDirectionAndFlip();
  },

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },



  updateReviewTogglesDisplay() {
    const counts = SRS.countFilteredCards(
      Filters.getFilteredCards(),
      App.currentStats.cards,
      App.currentDirection
    );

    const future = counts.total - counts.overdue;
    const displayText = `${counts.overdue} / ${future} / ${counts.total}`;

    const numbersSpan = document.getElementById("review-toggles-numbers");
    if (numbersSpan) {
      numbersSpan.textContent = displayText;
    }
  },

  applyDirectionAndFlip() {
    const table = document.getElementById("card-table");
    const englishSection = document.getElementById("card-english");
    const direction = App.currentDirection;
    const flipped = App.flipped;
    
    // Apply classes to both table and english section
    const className = `direction-${direction.toLowerCase().replace("->", "-")} ${flipped ? "flipped" : ""}`;
    table.className = className;
    englishSection.className = className;

    const buttons = document.getElementById("card-buttons");
    if (buttons) {
      buttons.style.display = flipped ? "flex" : "none";
    }
  },

  toggleFlip() {
    App.flipped = !App.flipped;
    this.applyDirectionAndFlip();
  },



  onCorrect() {
    if (!App.currentCard) {
      console.log("onCorrect: No current card");
      return;
    }
    Stats.updateCardStats(
      App.currentDeckId,
      App.currentCard.card_id,
      App.currentDirection,
      true,
    );
    this.advanceToNextCard();
  },

  onIncorrect() {
    if (!App.currentCard) {
      console.log("onIncorrect: No current card");
      return;
    }
    Stats.updateCardStats(
      App.currentDeckId,
      App.currentCard.card_id,
      App.currentDirection,
      false,
    );
    this.advanceToNextCard();
  },

  advanceToNextCard() {
    App.flipped = false;
      App.currentCard = SRS.selectNextCard(
        Filters.getFilteredCards(),
        App.currentStats.cards,
        App.currentDirection
      );
        this.updateReviewTogglesDisplay();
        if (App.currentCard) {
          this.renderCard(App.currentCard);
          } else {
          this.renderCard(null); // Clear the table
           const nextReviewInfo = SRS.getNextReviewInfo(Filters.getFilteredCards(), App.currentStats.cards, App.currentDirection);
          let message;
          if (nextReviewInfo) {
                 message = `No cards due for review with current filters. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
           } else {
             message = 'No cards due for review with current filters.';
           }



          Message.show('card-container', message);
       }
    },

  bindEvents() {
    const btnCorrect = document.getElementById("btn-correct");
    const btnIncorrect = document.getElementById("btn-incorrect");

    if (!btnCorrect || !btnIncorrect) {
      console.error("Review buttons not found, cannot bind events");
      return;
    }

    btnCorrect.addEventListener("click", (e) => {
      e.stopPropagation();
      this.onCorrect();
    });
    btnIncorrect.addEventListener("click", (e) => {
      e.stopPropagation();
      this.onIncorrect();
    });



    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "SELECT"
      )
        return;
       if (e.code === "Space") {
         e.preventDefault();
         if (!App.flipped) {
           this.toggleFlip();
         }
      } else if (e.code === "ArrowRight") {
        if (App.flipped) {
          e.preventDefault();
          this.onCorrect();
        }
      } else if (e.code === "ArrowLeft") {
        if (App.flipped) {
          e.preventDefault();
          this.onIncorrect();
        }
      }
    });

    // Swipe and click
    let startX = 0;
    let startY = 0;
    const cardContainer = document.getElementById("card-container");
    cardContainer.addEventListener("click", () => {
      if (!App.flipped) {
        this.toggleFlip();
      }
    });
    cardContainer.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, {passive: true});
    cardContainer.addEventListener("touchend", (e) => {
      if (!App.flipped) return;
      if (!startX || !startY) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.onCorrect();
        } else {
          this.onIncorrect();
        }
      }
      startX = 0;
      startY = 0;
    });
  },
};
