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
    // Periodic update of review toggles display
    this.updateInterval = setInterval(() => {
      this.updateReviewTogglesDisplay();
    }, 5 * 60 * 1000); // 5 minutes
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
                ${hanziTokens.map((token) => `<td><span class="word-text hanzi-word">${this.escapeHtml(token)}</span></td>`).join("")}
            </tr>
            <tr class="row-pinyin">
                ${pinyinTokens.map((token) => `<td><span class="word-text pinyin-word">${this.escapeHtml(token)}</span></td>`).join("")}
            </tr>
            <tr class="row-en-words">
                ${enWords.map((word) => `<td><span class="word-text en-word">${this.escapeHtml(word)}</span></td>`).join("")}
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

    // Add click handlers for individual word search
    const hanziWords = table.querySelectorAll('.hanzi-word');
    hanziWords.forEach(span => {
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById("search-query").value = span.textContent;
        Search.currentType = "pinyin";
        Search.updateToggleButton();
        Nav.show("search");
        Search.performSearch();
      });
      span.addEventListener('mouseenter', () => {
        const tr = span.closest('tr');
        tr.classList.remove('space-hover');
        span.classList.add('word-hover');
      });
      span.addEventListener('mouseleave', () => {
        span.classList.remove('word-hover');
        const tr = span.closest('tr');
        tr.classList.add('space-hover');
      });
    });

    const pinyinWords = table.querySelectorAll('.pinyin-word');
    pinyinWords.forEach(span => {
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById("search-query").value = Normalizer.normalizePinyin(span.textContent);
        Search.currentType = "pinyin";
        Search.updateToggleButton();
        Nav.show("search");
        Search.performSearch();
      });
      span.addEventListener('mouseenter', () => {
        const tr = span.closest('tr');
        tr.classList.remove('space-hover');
        span.classList.add('word-hover');
      });
      span.addEventListener('mouseleave', () => {
        span.classList.remove('word-hover');
        const tr = span.closest('tr');
        tr.classList.add('space-hover');
      });
    });

    const enWordSpans = table.querySelectorAll('.en-word');
    enWordSpans.forEach(span => {
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById("search-query").value = span.textContent;
        Search.currentType = "english";
        Search.updateToggleButton();
        Nav.show("search");
        Search.performSearch();
      });
      span.addEventListener('mouseenter', () => {
        const tr = span.closest('tr');
        tr.classList.remove('space-hover');
        span.classList.add('word-hover');
      });
      span.addEventListener('mouseleave', () => {
        span.classList.remove('word-hover');
        const tr = span.closest('tr');
        tr.classList.add('space-hover');
      });
    });

    // Add hover management for td padding (space between words)
    const tableCells = table.querySelectorAll('td');
    tableCells.forEach(td => {
      const tr = td.closest('tr');
      td.addEventListener('mouseenter', () => {
        tr.classList.add('space-hover');
      });
    });

    // Add click handler for whole expression search on td elements
    tableCells.forEach(td => {
      td.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling to card-container flip handler
        // Only handle if not clicking on word text
        if (!e.target.classList.contains('word-text')) {
          const hanziTokens = App.currentCard.hanzi.split(' ');
          const query = hanziTokens.join(''); // Remove spaces for whole expression search
          document.getElementById("search-query").value = query;
          Search.currentType = "pinyin";
          Search.updateToggleButton();
          Nav.show("search");
          Search.performSearch();
        }
      });
    });

    // Add hover management for space highlighting (additional coverage)
    const tableRows = table.querySelectorAll('tr');
    tableRows.forEach(tr => {
      tr.addEventListener('mouseenter', () => {
        tr.classList.add('space-hover');
      });
      tr.addEventListener('mouseleave', () => {
        tr.classList.remove('space-hover');
      });
    });

     this.applyDirectionAndFlip();
  },

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },



  updateReviewTogglesDisplay() {
    const dueCounts = SRS.getDueCountsByTime(
      Filters.getFilteredCards(),
      App.currentStats.cards,
      App.currentDirection
    );

    const progressBar = document.getElementById("review-progress-bar");
    if (!progressBar) return;

    // Clear existing segments
    progressBar.innerHTML = '';

    // Define segment border colors for gradient
    
    const SEGMENT_COLORS = [
      '#e63946', // vivid red (balanced brightness)
      '#f8961e', // orange (slightly deeper for even value)
      '#ffd60a', // yellow (warmer, not too pale)
      '#2ea44f', // green (slightly lighter & vibrant)
      '#18a999', // teal (darker + richer than before)
      '#0077ff', // blue (vivid, slightly lighter)
      '#9d4edd', // purple (lighter & more saturated)
    ];

    // Define segments with colors and labels
    const segments = [
      { key: 'overdue', color: SEGMENT_COLORS[0], label: 'Overdue' },
      { key: 'dueSoon15min', color: SEGMENT_COLORS[1], label: 'Due <15min' },
      { key: 'dueSoon1h', color: SEGMENT_COLORS[2], label: 'Due <1h' },
      { key: 'dueSoon6h', color: SEGMENT_COLORS[3], label: 'Due <6h' },
      { key: 'dueSoon24h', color: SEGMENT_COLORS[4], label: 'Due <24h' },
      { key: 'dueLater', color: SEGMENT_COLORS[5], label: 'Due >=24h' }
    ];

    segments.forEach((segment, i) => {
      const count = dueCounts[segment.key];
      const segmentDiv = document.createElement('div');
      segmentDiv.className = 'progress-segment';
      const nextColor = SEGMENT_COLORS[i + 1];
      segmentDiv.style.background = `linear-gradient(to right, ${segment.color}, ${nextColor})`;
      segmentDiv.title = `${segment.label}: ${count}`;

      // Add number overlay only if count > 0
      if (count > 0) {
        const numberSpan = document.createElement('span');
        numberSpan.className = 'segment-number';
        numberSpan.textContent = count;
        segmentDiv.appendChild(numberSpan);
      }

      progressBar.appendChild(segmentDiv);
    });
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
