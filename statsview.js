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
     const maxBucket = Math.max(...buckets);

     // Top 10 best and worst
     const sortedByRatioDesc = cardData.sort(
       (a, b) => b.ratio - a.ratio || b.total - a.total,
     );
     const best = sortedByRatioDesc.slice(0, 10);
     const sortedByRatioAsc = cardData.sort(
       (a, b) => a.ratio - b.ratio || b.total - a.total,
     );
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
     const maxDue = Math.max(...dueBuckets);

     // Overall accuracy
     let totalCorrect = 0, totalIncorrect = 0;
     cardData.forEach((data) => {
       totalCorrect += data.correct;
       totalIncorrect += data.incorrect;
     });

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
     const maxStreak = Math.max(...streakBuckets);

     // Streak records
     let maxCorrectStreak = 0, maxIncorrectStreak = 0, totalStreak = 0, count = 0;
     cardData.forEach((data) => {
       const stats = deckStats.cards[data.cardId][this.currentDirection];
       maxCorrectStreak = Math.max(maxCorrectStreak, stats.correct_streak_len);
       maxIncorrectStreak = Math.max(maxIncorrectStreak, stats.incorrect_streak_len);
       totalStreak += stats.correct_streak_len;
       count++;
     });
     const avgStreak = count > 0 ? (totalStreak / count).toFixed(1) : 0;

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
           ${buckets.map((val, i) => `<div class="bar" style="height: ${(val / maxBucket) * 200}px">${['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'][i]}<br>${val}</div>`).join('')}
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
       <div class="stats-due-timeline">
         <h3>Cards Due Timeline</h3>
         <div class="timeline-bars">
           ${dueBuckets.map((val, i) => `<div class="bar" style="height: ${(val / maxDue) * 200}px">${['&lt;1h', '1-6h', '6-24h', '1-7d', '7-30d', '&gt;30d'][i]}<br>${val}</div>`).join('')}
         </div>
       </div>
       <div class="stats-overall-accuracy">
         <h3>Overall Accuracy</h3>
         <div class="pie-chart">
           <div class="pie" style="--correct: ${totalCorrect}; --incorrect: ${totalIncorrect}"></div>
           <div class="legend">Correct: ${totalCorrect} (${totalCorrect + totalIncorrect > 0 ? ((totalCorrect / (totalCorrect + totalIncorrect)) * 100).toFixed(1) : 0}%) Incorrect: ${totalIncorrect} (${totalCorrect + totalIncorrect > 0 ? ((totalIncorrect / (totalCorrect + totalIncorrect)) * 100).toFixed(1) : 0}%)</div>
         </div>
       </div>
       <div class="stats-streak-histogram">
         <h3>Current Correct Streak Distribution</h3>
         <div class="histogram-bars">
           ${streakBuckets.map((val, i) => `<div class="bar" style="height: ${(val / maxStreak) * 150}px">${['0', '1', '2-3', '4-5', '6+'][i]}<br>${val}</div>`).join('')}
         </div>
       </div>
       <div class="stats-streak-records">
         <h3>Streak Records</h3>
         <p>Max Correct Streak: ${maxCorrectStreak}</p>
         <p>Max Incorrect Streak: ${maxIncorrectStreak}</p>
         <p>Average Correct Streak: ${avgStreak}</p>
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