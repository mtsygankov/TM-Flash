// Review module
const Review = {
   audioPlayedForCurrentCard: false,

   // Listening popup state
   listeningPopupVisible: false,
   listeningCountdownInterval: null,
   listeningTimeout: null,

  init() {
    this.bindEvents();
    // Recalculate scale on window resize
    window.addEventListener('resize', () => {
      if (App.currentCard) {
        this.renderCard(App.currentCard);
      }
    });
    // Periodic update of review progress bar
    this.updateInterval = setInterval(() => {
      this.updateReviewProgressBar();
    }, 5 * 60 * 1000); // 5 minutes
  },

  renderCard(card) {
    if (Nav.currentView !== 'review') return;
    Message.hide('card-container');
    if (!card) {
      const table = document.getElementById("card-table");
      const defSection = document.getElementById("card-def");
      if (table) {
        table.innerHTML = "";
      }
      if (defSection) {
        defSection.querySelector('.pos-prefix').textContent = '';
        defSection.querySelector('.def-text').textContent = '';
      }
      return;
    }
    const hanziTokens = card.hanzi.split(" ");
    const pinyinTokens = card.pinyin.split(" ");
    const wordTones = card.tones.split(" ");
    const enWords = card.def_words || [];
    const table = document.getElementById("card-table");
    const defSection = document.getElementById("card-def");
    if (!table || !defSection) return;

    // Helper to generate tone-classed spans for a row
    const generateColoredRow = (tokens, isHanzi) => {
      let tokenIndex = 0;
      return wordTones.map(wordTone => {
        const digits = wordTone.split("");
        let html = '';
        digits.forEach(digit => {
          const className = isHanzi ? 'hanzi-word' : 'pinyin-word';
          html += `<span class="word-text ${className} tone-${digit}">${this.escapeHtml(tokens[tokenIndex])}</span>`;
          tokenIndex++;
        });
        return `<td>${html}</td>`;
      }).join("");
    };

    // Render table with hanzi, pinyin (always included, conditionally hidden), audio play button, and def-words rows
    const pinyinRow = `
            <tr class="row-pinyin" style="visibility: hidden; pointer-events: none">
                ${generateColoredRow(pinyinTokens, false)}
            </tr>`;

    // Add audio play button row (only if card has audio)
    const audioRow = card.audio ? `
            <tr class="row-audio">
                <td colspan="${wordTones.length}" class="audio-cell">
                    <button class="play-audio-btn" title="Play audio">🔊</button>
                </td>
            </tr>` : '';

    table.innerHTML = `
            <tr class="row-hanzi">
                ${generateColoredRow(hanziTokens, true)}
            </tr>${pinyinRow}${audioRow}
            <tr class="row-def-words">
                ${enWords.map((word) => `<td><span class="word-text def-word">${this.escapeHtml(word)}</span></td>`).join("")}
            </tr>
        `;

    // Render def section separately
    const posPrefix = defSection.querySelector('.pos-prefix');
    const defText = defSection.querySelector('.def-text');
    posPrefix.textContent = card.pos ? `[ ${this.escapeHtml(card.pos)} ] ` : '';
    defText.textContent = this.escapeHtml(card.def);

    // Dynamic font scaling for hanzi/pinyin table (more accurate now)
    const columns = wordTones.length;
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

    // Independent font scaling for def section
    const container = document.getElementById('card-container');
    const containerPadding = parseFloat(getComputedStyle(container).paddingLeft) + parseFloat(getComputedStyle(container).paddingRight);
    const defAvailableWidth = container.clientWidth - containerPadding;
    const defTextLength = card.def.length + (card.pos ? card.pos.length : 0);
    const defBaseCharSize = 3 * 16; // 3rem in px per def char
    const defEstimatedWidth = defTextLength * defBaseCharSize * 0.6; // English chars are narrower
    const defScale = Math.max(0.6, Math.min(1, defAvailableWidth / defEstimatedWidth));
    defSection.style.setProperty('--def-scale-factor', defScale);

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

    const defWordSpans = table.querySelectorAll('.def-word');
    defWordSpans.forEach(span => {
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById("search-query").value = span.textContent;
        Search.currentType = "def";
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

    // Add event listener for play audio button
    const playAudioBtn = table.querySelector('.play-audio-btn');
    if (playAudioBtn) {
      playAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playAudioForCard(App.currentCard, playAudioBtn);
      });
    }

    // Add hover management for td padding (space between words)
    const tableCells = table.querySelectorAll('td');
    tableCells.forEach(td => {
      const tr = td.closest('tr');
      // Skip audio row cells to prevent yellow background
      if (!tr.classList.contains('row-audio')) {
        td.addEventListener('mouseenter', () => {
          tr.classList.add('space-hover');
        });
      }
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
      // Skip audio row to prevent yellow background
      if (!tr.classList.contains('row-audio')) {
        tr.addEventListener('mouseenter', () => {
          tr.classList.add('space-hover');
        });
        tr.addEventListener('mouseleave', () => {
          tr.classList.remove('space-hover');
        });
      }
    });

     this.applyModeAndFlip();
   },

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },



  updateReviewProgressBar() {
    const dueCounts = SRS.getDueCountsByTime(
      Filters.getFilteredCards(),
      App.currentStats.cards,
      App.currentMode
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

  applyModeAndFlip() {
    const table = document.getElementById("card-table");
    const defSection = document.getElementById("card-def");
    const mode = App.currentMode;
    const flipped = App.flipped;

    // Apply classes to both table and def section
    const modeClass = `mode-${mode.replace('LM-', '').replace('-', '-')}`;
    const className = `${modeClass} ${flipped ? "flipped" : ""}`;
    table.className = className;
    defSection.className = className;

    const buttons = document.getElementById("card-buttons");
    if (buttons) {
      buttons.style.display = flipped ? "flex" : "none";
    }

    // Dismiss listening popup when card is flipped
    if (flipped && this.listeningPopupVisible) {
      this.dismissListeningPopup();
    }

    // Remove auto-play audio behavior - audio should only play when play button is clicked
    // Keep the audioPlayedForCurrentCard flag for potential future use

    // Update pinyin visibility based on flip state and setting
    const pinyinRow = document.querySelector('.row-pinyin');
    if (pinyinRow) {
      const shouldShow = flipped && Settings.showPinyin;
      pinyinRow.style.visibility = shouldShow ? 'visible' : 'hidden';
      pinyinRow.style.pointerEvents = shouldShow ? 'auto' : 'none';
    }
  },

  playAudioForCard(card, button) {
    if (!card || !card.audio) return;

    const audioPath = App.currentDeck?.audio_path || '';
    const fullUrl = audioPath + '/' + card.audio;

    // Check if audio file exists before playing
    fetch(fullUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Use AudioPlayer to handle playback with overlap prevention
        AudioPlayer.play(fullUrl, button);
      })
      .catch(error => {
        console.error("Error loading audio:", error);
      });
  },

  toggleFlip() {
    App.flipped = !App.flipped;
    // Reset audio flag when flipping back to front for listening mode
    if (!App.flipped && App.currentMode === 'LM-listening') {
      this.audioPlayedForCurrentCard = false;
    }
    this.applyModeAndFlip();
  },



  onCorrect() {
    if (!App.currentCard) {
      console.log("onCorrect: No current card");
      return;
    }
    Stats.updateCardStats(
      App.currentDeckId,
      App.currentCard.card_id,
      App.currentMode,
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
      App.currentMode,
      false,
    );
    this.advanceToNextCard();
  },

  // Listening popup methods
  showListeningPopup() {
    if (this.listeningPopupVisible) return;

    const popup = document.getElementById('listening-popup');
    const countdownEl = document.querySelector('.countdown-timer');
    if (!popup || !countdownEl) return;

    // Mark popup as visible BEFORE rendering the card to prevent immediate audio playback
    this.listeningPopupVisible = true;
    popup.style.display = 'flex';

    // Render the card so it's visible behind the popup
    if (App.currentCard) {
      this.renderCard(App.currentCard);
    }

    let countdown = 3;
    countdownEl.textContent = countdown;

    // Clear any existing timers
    this.clearListeningTimers();

    // Make entire popup clickable to dismiss and flip card
    popup.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.listeningPopupVisible) {
        this.dismissListeningPopup();
        this.toggleFlip(); // Flip to show answer when user clicks anywhere on popup
      }
    });

    // 3-2-1 countdown
    this.listeningCountdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        countdownEl.textContent = countdown;
      } else {
        clearInterval(this.listeningCountdownInterval);
        this.startAudioPlayback();
      }
    }, 1000);
  },

  startAudioPlayback() {
   const countdownEl = document.querySelector('.countdown-timer');
   if (!countdownEl) return;

   // Play audio on the front side (during popup countdown) - this is the desired behavior for listening mode
   this.playAudioForCard(App.currentCard);

   // Start 10-second listening countdown
   let listeningTime = 10;
   countdownEl.textContent = listeningTime;

   this.listeningCountdownInterval = setInterval(() => {
     listeningTime--;
     countdownEl.textContent = listeningTime;

     if (listeningTime <= 0) {
       this.dismissListeningPopup();
       this.toggleFlip(); // Auto-flip to show answer
     }
   }, 1000);
 },

  dismissListeningPopup() {
    if (!this.listeningPopupVisible) return;

    const popup = document.getElementById('listening-popup');
    if (popup) {
      popup.style.display = 'none';
    }

    this.listeningPopupVisible = false;
    this.clearListeningTimers();

    // Render the card now that popup is dismissed
    if (App.currentCard) {
      this.renderCard(App.currentCard);
    }
  },

  clearListeningTimers() {
    if (this.listeningCountdownInterval) {
      clearInterval(this.listeningCountdownInterval);
      this.listeningCountdownInterval = null;
    }
    if (this.listeningTimeout) {
      clearTimeout(this.listeningTimeout);
      this.listeningTimeout = null;
    }
  },

  advanceToNextCard() {
    App.flipped = false;
    this.audioPlayedForCurrentCard = false; // Reset audio flag for new card
      App.currentCard = SRS.selectNextCard(
        Filters.getFilteredCards(),
        App.currentStats.cards,
        App.currentMode
      );
        this.updateReviewProgressBar();
        if (App.currentCard) {
          // Check if Listening mode - show popup instead of rendering immediately
          if (App.currentMode === 'LM-listening') {
            this.showListeningPopup();
          } else {
            this.renderCard(App.currentCard);
          }
          } else {
          this.renderCard(null); // Clear the table
           const nextReviewInfo = SRS.getNextReviewInfo(Filters.getFilteredCards(), App.currentStats.cards, App.currentMode);
          let message;
          if (nextReviewInfo) {
                 message = `No cards due for review with current filters. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
           } else {
             message = 'No cards due for review with current filters.';
           }

          Message.show('review', message);
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

    // Listening popup countdown click handler
    const countdownTimer = document.querySelector('.countdown-timer');
    if (countdownTimer) {
      countdownTimer.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.listeningPopupVisible) {
          this.dismissListeningPopup();
          this.toggleFlip(); // Flip to show answer when user aborts countdown
        }
      });

      // Keyboard navigation for countdown timer
      countdownTimer.addEventListener('keydown', (e) => {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          e.stopPropagation();
          if (this.listeningPopupVisible) {
            this.dismissListeningPopup();
            this.toggleFlip(); // Flip to show answer when user aborts countdown
          }
        }
      });
    }

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "SELECT"
      )
        return;

      // Space key: dismiss popup or flip card
      if (e.code === "Space") {
        e.preventDefault();
        if (this.listeningPopupVisible) {
          this.dismissListeningPopup();
          this.toggleFlip(); // Flip to show answer when user aborts countdown
        } else if (!App.flipped) {
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
      } else if (e.code === "ArrowUp") {
        if (App.flipped) {
          e.preventDefault();
          const pinyinRow = document.querySelector('.row-pinyin');
          if (pinyinRow) {
            const isVisible = pinyinRow.style.visibility !== 'hidden';
            pinyinRow.style.visibility = isVisible ? 'hidden' : 'visible';
            pinyinRow.style.pointerEvents = isVisible ? 'none' : 'auto';
          }
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
