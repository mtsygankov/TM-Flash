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
      if (table) {
        table.innerHTML = "";
      }
      return;
    }
    const hanziTokens = card.hanzi.split(" ");
    const pinyinTokens = card.pinyin.split(" ");
    const enWords = card.en_words;
    const table = document.getElementById("card-table");
    if (!table) return;
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
            <tr class="row-english">
                <td colspan="${hanziTokens.length}">${this.escapeHtml(card.english)}</td>
            </tr>
        `;

    // Dynamic font scaling based on content and available space
    const columns = hanziTokens.length;
    const totalChars = hanziTokens.reduce((sum, token) => sum + token.length, 0);
    const container = document.getElementById('card-container');
    const containerPadding = parseFloat(getComputedStyle(container).paddingLeft) + parseFloat(getComputedStyle(container).paddingRight);
    const availableWidth = container.clientWidth - containerPadding;
    const baseCharSize = 4 * 16; // 4rem in px per hanzi char
    const cellPadding = 0.75 * 2 * 16; // 0.75rem * 2 sides in px
    const borderSpacing = 0.5 * 16; // 0.5rem in px
    const estimatedWidth = totalChars * baseCharSize + (columns - 1) * borderSpacing + columns * cellPadding;
    const scale = Math.max(0.5, Math.min(1, availableWidth / estimatedWidth));
    console.log('Columns:', columns, 'Total Chars:', totalChars, 'Available Width:', availableWidth, 'Estimated Width:', estimatedWidth, 'Scale:', scale);
    table.style.setProperty('--scale-factor', scale);

    this.applyDirectionAndFlip();
  },

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  applyDirectionAndFlip() {
    const table = document.getElementById("card-table");
    const direction = App.currentDirection;
    const flipped = App.flipped;
    table.className = `direction-${direction.toLowerCase().replace("->", "-")} ${flipped ? "flipped" : ""}`;

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
    console.log("onCorrect called");
    if (!App.currentCard) {
      console.log("No current card");
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
    console.log("onIncorrect called");
    if (!App.currentCard) {
      console.log("No current card");
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
        App.currentCards,
        App.currentStats.cards,
        App.currentDirection,
      );
       if (App.currentCard) {
         this.renderCard(App.currentCard);
       } else {
         this.renderCard(null); // Clear the table
         const nextReviewInfo = SRS.getNextReviewInfo(App.currentCards, App.currentStats.cards, App.currentDirection);
         let message;
         if (nextReviewInfo) {
                message = `No cards due for review. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
         } else {
           message = 'No more cards to review.';
         }
         Message.show('card-container', message);
       }
    },

  bindEvents() {
    console.log("Binding review events");
    const btnCorrect = document.getElementById("btn-correct");
    const btnIncorrect = document.getElementById("btn-incorrect");
    console.log("btnCorrect:", btnCorrect);
    console.log("btnIncorrect:", btnIncorrect);

    if (!btnCorrect || !btnIncorrect) {
      console.error("Review buttons not found, cannot bind events");
      return;
    }

    btnCorrect.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("btn-correct clicked");
      this.onCorrect();
    });
    btnIncorrect.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("btn-incorrect clicked");
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
          console.log("ArrowRight pressed");
          e.preventDefault();
          this.onCorrect();
        }
      } else if (e.code === "ArrowLeft") {
        if (App.flipped) {
          console.log("ArrowLeft pressed");
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
    });
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