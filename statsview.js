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

  formatPct(num) {
    return (Number.isFinite(num) ? (num * 100).toFixed(1) : "0.0") + "%";
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
    const metrics = Stats.computeMetrics(App.currentDeckId, this.currentDirection);

     // Compute histogram and top lists
     const deckStats = Storage.getDeckStats(App.currentDeckId) || { cards: {} };
     const cardMap = new Map((App.currentCards || []).map((card) => [card.card_id, card]));
     const cardData = [];
     Object.entries(deckStats.cards || {}).forEach(([cardId, cardStats]) => {
       const dirStat = cardStats[this.currentDirection];
       if (!dirStat) return;
       const total = (dirStat.total_correct || 0) + (dirStat.total_incorrect || 0);
       if (total === 0) return;
       const ratio = (dirStat.total_correct || 0) / total;
       const card = cardMap.get(cardId) || { hanzi: cardId, english: "" };
      
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
  const maxBucket = Math.max(...buckets) || 1;

     // Top 10 best and worst
     const sortedByRatioDesc = cardData.slice().sort((a, b) => b.ratio - a.ratio || b.total - a.total);
     const best = sortedByRatioDesc.slice(0, 10);
     const sortedByRatioAsc = cardData.slice().sort((a, b) => a.ratio - b.ratio || b.total - a.total);
     const worst = sortedByRatioAsc.slice(0, 10);

     // Compute due timeline
     const dueBuckets = [0, 0, 0, 0, 0, 0]; // <1h, 1-6h, 6-24h, 1-7d, 7-30d, >30d
     App.currentCards.forEach((card) => {
       const stats = deckStats.cards[card.card_id]?.[this.currentDirection];
       if (!stats) {
         // new card, due now
         dueBuckets[0]++;
         return;
       }
       const lastReview = Math.max(stats.last_correct_at || 0, stats.last_incorrect_at || 0);
       if (lastReview === 0) {
         dueBuckets[0]++;
         return;
       }
       const intervalHours = SRS.calculateNextReviewInterval(stats);
       const nextReview = lastReview + intervalHours * 60 * 60 * 1000;
       const now = Date.now();
       const diffHours = (nextReview - now) / (60 * 60 * 1000);
       if (diffHours <= 1) dueBuckets[0]++;
       else if (diffHours <= 6) dueBuckets[1]++;
       else if (diffHours <= 24) dueBuckets[2]++;
       else if (diffHours <= 168) dueBuckets[3]++; // 7d
       else if (diffHours <= 720) dueBuckets[4]++; // 30d
       else dueBuckets[5]++;
     });
  const maxDue = Math.max(...dueBuckets) || 1;

     // Overall accuracy
     let totalCorrect = 0, totalIncorrect = 0;
     cardData.forEach((data) => {
       totalCorrect += data.correct || 0;
       totalIncorrect += data.incorrect || 0;
     });
    const overallAccuracy = totalCorrect + totalIncorrect > 0 ? totalCorrect / (totalCorrect + totalIncorrect) : 0;

     // Streak histogram
     const streakBuckets = [0, 0, 0, 0, 0]; // 0,1,2-3,4-5,6+
     cardData.forEach((data) => {
       const stats = deckStats.cards[data.cardId][this.currentDirection];
       const streak = stats.correct_streak_len;
       if (streak === 0) streakBuckets[0]++;
       else if (streak === 1) streakBuckets[1]++;
       else if (streak <= 3) streakBuckets[2]++;
       else if (streak <= 5) streakBuckets[3]++;
       else streakBuckets[4]++;
     });
  const maxStreak = Math.max(...streakBuckets) || 1;

     // Streak records
     let maxCorrectStreak = 0, maxIncorrectStreak = 0, totalStreak = 0, count = 0;
     cardData.forEach((data) => {
      const stats = deckStats.cards?.[data.cardId]?.[this.currentDirection] || {};
      const cs = stats.correct_streak_len || 0;
      const is = stats.incorrect_streak_len || 0;
      maxCorrectStreak = Math.max(maxCorrectStreak, cs);
      maxIncorrectStreak = Math.max(maxIncorrectStreak, is);
      totalStreak += cs;
      count++;
     });
     const avgStreak = count > 0 ? (totalStreak / count).toFixed(1) : "0.0";
    content.innerHTML = `
      <div class="stats-grid">
        <div class="metric-card">
          <div class="metric-title">Total Cards</div>
          <div class="metric-value">${metrics.totalCards}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Reviewed</div>
          <div class="metric-value">${metrics.reviewedCount}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">New</div>
          <div class="metric-value">${metrics.newCount}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Deck Errors</div>
          <div class="metric-value">${metrics.deckErrors}</div>
        </div>
        <div class="metric-card wide">
          <div class="metric-title">Overall Accuracy</div>
          <div class="metric-value large">${this.formatPct(overallAccuracy)}</div>
          <div class="progress">
            <div class="progress-inner" style="width: ${overallAccuracy * 100}%"></div>
          </div>
        </div>
      </div>

      <div class="panel-grid">
        <div class="panel">
          <h3>Correct Ratio Histogram</h3>
          <div class="histogram-bars">
            ${buckets.map((val, i) => `<div class="bar" style="height: ${(val / maxBucket) * 140}px"><div class="bar-label">${['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'][i]}</div><div class="bar-count">${val}</div></div>`).join('')}
          </div>
        </div>

        <div class="panel">
          <h3>Cards Due Timeline</h3>
          <div class="timeline-bars">
            ${dueBuckets.map((val, i) => `<div class="bar timeline" style="height: ${(val / maxDue) * 140}px"><div class="bar-label">${['<1h','1-6h','6-24h','1-7d','7-30d','>30d'][i]}</div><div class="bar-count">${val}</div></div>`).join('')}
          </div>
        </div>

        <div class="panel">
          <h3>Top 10 Best</h3>
          <ul class="small-list">
            ${best.length ? best.map((data) => `<li class="small-item"><span class="mini-hanzi">${data.hanzi}</span><span class="mini-eng">${data.english}</span><span class="mini-stats">${data.correct}/${data.total} (${(data.ratio*100).toFixed(0)}%)</span></li>`).join("") : "<li class='small-item'>No data</li>"}
          </ul>
        </div>

        <div class="panel">
          <h3>Top 10 Worst</h3>
          <ul class="small-list">
            ${worst.length ? worst.map((data) => `<li class="small-item"><span class="mini-hanzi">${data.hanzi}</span><span class="mini-eng">${data.english}</span><span class="mini-stats">${data.correct}/${data.total} (${(data.ratio*100).toFixed(0)}%)</span></li>`).join("") : "<li class='small-item'>No data</li>"}
          </ul>
        </div>

        <div class="panel">
          <h3>Correct Streak Distribution</h3>
          <div class="histogram-bars small">
            ${streakBuckets.map((val, i) => `<div class="bar" style="height: ${(val / maxStreak) * 120}px"><div class="bar-label">${['0','1','2-3','4-5','6+'][i]}</div><div class="bar-count">${val}</div></div>`).join('')}
          </div>
        </div>

        <div class="panel stats-records">
          <h3>Streak Records</h3>
          <p>Max Correct Streak: <strong>${maxCorrectStreak}</strong></p>
          <p>Max Incorrect Streak: <strong>${maxIncorrectStreak}</strong></p>
          <p>Average Correct Streak: <strong>${avgStreak}</strong></p>
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