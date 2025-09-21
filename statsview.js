// StatsView module
const StatsView = {
  currentDirection: "CH->EN",

  init() {
    this.bindEvents();
    this.currentDirection = Storage.getSettings().direction;
  },

  bindEvents() {
    const toggle = document.getElementById("stats-direction-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        this.currentDirection =
          this.currentDirection === "CH->EN" ? "EN->CH" : "CH->EN";
        this.render();
      });
    }
    const resetBtn = document.getElementById("reset-stats-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetCurrentDeckStats();
      });
    }
  },

  render() {
    const toggle = document.getElementById("stats-direction-toggle");
    if (toggle) {
      toggle.textContent = this.currentDirection;
    }
    const content = document.getElementById("stats-content");
    if (!content) return;
    if (!App.currentDeckId) {
      content.innerHTML = "<p>No deck loaded.</p>";
      return;
    }
    const metrics = Stats.computeMetrics(
      App.currentDeckId,
      this.currentDirection,
    );

    // Compute histogram and top lists
    const deckStats = Storage.getDeckStats(App.currentDeckId);
    const cardMap = new Map(
      App.currentCards.map((card) => [card.card_id, card]),
    );
    const cardData = [];
    Object.entries(deckStats.cards).forEach(([cardId, cardStats]) => {
      const dirStat = cardStats[this.currentDirection];
      if (!dirStat) return;
      const total = dirStat.total_correct + dirStat.total_incorrect;
      if (total === 0) return;
      const ratio = dirStat.total_correct / total;
      const card = cardMap.get(cardId);
      if (!card) return;
      cardData.push({
        cardId,
        hanzi: card.hanzi,
        english: card.english,
        correct: dirStat.total_correct,
        incorrect: dirStat.total_incorrect,
        total,
        ratio,
      });
    });

    // Histogram buckets
    const buckets = [0, 0, 0, 0, 0];
    cardData.forEach((data) => {
      const pct = Math.floor(data.ratio * 100);
      let bucket;
      if (pct <= 20) bucket = 0;
      else if (pct <= 40) bucket = 1;
      else if (pct <= 60) bucket = 2;
      else if (pct <= 80) bucket = 3;
      else bucket = 4;
      buckets[bucket]++;
    });

    // Top 10 best and worst
    const sortedByRatioDesc = cardData.sort(
      (a, b) => b.ratio - a.ratio || b.total - a.total,
    );
    const best = sortedByRatioDesc.slice(0, 10);
    const sortedByRatioAsc = cardData.sort(
      (a, b) => a.ratio - b.ratio || b.total - a.total,
    );
    const worst = sortedByRatioAsc.slice(0, 10);

    content.innerHTML = `
      <div class="stats-metrics">
        <p>Total Cards: ${metrics.totalCards}</p>
        <p>Reviewed: ${metrics.reviewedCount}</p>
        <p>New: ${metrics.newCount}</p>
        <p>Errors: ${metrics.deckErrors}</p>
      </div>
      <div class="stats-histogram">
        <h3>Correct Ratio Histogram</h3>
        <div class="histogram-bars">
          <div class="bar">0-20%: ${buckets[0]}</div>
          <div class="bar">21-40%: ${buckets[1]}</div>
          <div class="bar">41-60%: ${buckets[2]}</div>
          <div class="bar">61-80%: ${buckets[3]}</div>
          <div class="bar">81-100%: ${buckets[4]}</div>
        </div>
      </div>
      <div class="stats-top-lists">
        <div class="top-best">
          <h3>Top 10 Best</h3>
          <ul>
            ${best.map((data) => `<li>${data.hanzi} - ${data.english} (${data.correct}/${data.total})</li>`).join("")}
          </ul>
        </div>
        <div class="top-worst">
          <h3>Top 10 Worst</h3>
          <ul>
            ${worst.map((data) => `<li>${data.hanzi} - ${data.english} (${data.correct}/${data.total})</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  },

  resetCurrentDeckStats() {
    if (!App.currentDeckId) return;
    if (
      !confirm(
        `Reset all stats for ${DECKS[App.currentDeckId].label} in ${this.currentDirection} direction? This cannot be undone.`,
      )
    )
      return;
    const deckStats = Storage.getDeckStats(App.currentDeckId);
    Object.values(deckStats.cards).forEach((cardStats) => {
      if (cardStats[this.currentDirection]) {
        cardStats[this.currentDirection] = {
          total_correct: 0,
          total_incorrect: 0,
          last_correct_at: null,
          last_incorrect_at: null,
          correct_streak_len: 0,
          incorrect_streak_len: 0,
          correct_streak_started_at: null,
          incorrect_streak_started_at: null
        };
      }
    });
    Storage.setDeckStats(App.currentDeckId, deckStats);
    // Update app state
    App.currentStats = deckStats;
    // Rerender stats
    this.render();
  },
};