// StatsView module
const StatsView = {

  init() {
    this.bindEvents();
  },

  bindEvents() {
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
    const content = document.getElementById("stats-content");
    if (!content) return;
    if (!App.currentDeckId) {
      content.innerHTML = "<p>No deck loaded.</p>";
      return;
    }
    const metrics = Stats.computeMetrics(App.currentDeckId, App.currentDirection, App.currentFilteredCards || App.currentCards);

     // Compute histogram and top lists
      const deckStats = Storage.getDeckStats(App.currentDeckId) || { cards: {} };
       const cardMap = new Map(((App.currentFilteredCards || App.currentCards) || []).map((card) => [card.card_id.toString(), card]));
      const cardData = [];
        Object.entries(deckStats.cards || {}).forEach(([cardId, cardStats]) => {
          // Only include cards present in the current filtered selection
          if (!cardMap.has(cardId)) return;
          const dirStat = cardStats[App.currentDirection];
         if (!dirStat) return;
         const total = (dirStat.total_correct || 0) + (dirStat.total_incorrect || 0);
         if (total === 0) return;
         const ratio = (dirStat.total_correct || 0) / total;
          const card = cardMap.get(cardId) || { hanzi: cardId, pinyin: "", english: "" };

          cardData.push({
            cardId,
            hanzi: card.hanzi,
            pinyin: card.pinyin,
            english: card.english,
            correct: dirStat.total_correct,
            incorrect: dirStat.total_incorrect,
            total,
            ratio,
          });
       });



     // Top 10 best and worst
     const sortedByRatioDesc = cardData.slice().sort((a, b) => b.ratio - a.ratio || b.total - a.total);
     const best = sortedByRatioDesc.slice(0, 10);
     const sortedByRatioAsc = cardData.slice().sort((a, b) => a.ratio - b.ratio || b.total - a.total);
     const worst = sortedByRatioAsc.slice(0, 10);

       // Compute due timeline with buckets: Overdue, <=30m, <=1h, <=4h, <=12h, <=24h, <=7d, <=30d, >30d
        const dueBuckets = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        ((App.currentFilteredCards || App.currentCards) || []).forEach((card) => {
         const cardStats = deckStats.cards?.[card.card_id];
          const stats = deckStats.cards?.[card.card_id]?.[App.currentDirection];
        if (!stats) {
          // new card, due now -> count in first bucket (<=30m)
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
        if (diffHours <= 0) dueBuckets[0]++; // overdue
        else if (diffHours <= 0.5) dueBuckets[1]++; // <=30m
        else if (diffHours <= 1) dueBuckets[2]++;
        else if (diffHours <= 4) dueBuckets[3]++;
        else if (diffHours <= 12) dueBuckets[4]++;
        else if (diffHours <= 24) dueBuckets[5]++;
        else if (diffHours <= 168) dueBuckets[6]++; // <=7d
        else if (diffHours <= 720) dueBuckets[7]++; // <=30d
        else dueBuckets[8]++; // >30d
     });
    const maxDue = Math.max(...dueBuckets) || 1;

      // Time buckets for due rate: overdue + 15-min intervals for next 24 hours (95 intervals, last removed)
      const numTimeBuckets = 95; // 1440/15 -1 =95
      const timeBuckets = new Array(numTimeBuckets).fill(0); // 95
      ((App.currentFilteredCards || App.currentCards) || []).forEach((card) => {
        const cardStats = deckStats.cards?.[card.card_id];
        const stats = deckStats.cards?.[card.card_id]?.[App.currentDirection];
        if (!stats) {
          // New card, due now
          timeBuckets[0]++;
          return;
        }
        const lastReview = Math.max(stats.last_correct_at || 0, stats.last_incorrect_at || 0);
        if (lastReview === 0) {
          timeBuckets[0]++;
          return;
        }
        const intervalHours = SRS.calculateNextReviewInterval(stats);
        const nextReview = lastReview + intervalHours * 60 * 60 * 1000;
        const now = Date.now();
        const diffMin = (nextReview - now) / (60 * 1000);
        if (diffMin <= 0) {
          timeBuckets[0]++; // overdue -> first bucket
        } else if (diffMin < 15) {
          timeBuckets[0]++; // 0-15m -> first bucket
        } else if (diffMin < 1425) { // Exclude last 15-min bucket (1425-1440)
          const bucketIndex = Math.floor(diffMin / 15);
          if (bucketIndex < numTimeBuckets) timeBuckets[bucketIndex]++;
        }
        // Ignore cards due after 24 hours
      });

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
        const stats = deckStats.cards[data.cardId][App.currentDirection];
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
       const stats = deckStats.cards?.[data.cardId]?.[App.currentDirection] || {};
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
        <div class="metric-card" align="center">
        <div class="metric-title">Total Cards</div>
        <div class="metric-value large">${metrics.totalCards}</div>
        </div>
        <div class="metric-card" align="center">
        <div class="metric-title">Reviewed</div>
        <div class="metric-value large">${this.formatPct(metrics.reviewedCount / metrics.totalCards)}</div>
        </div>
        <div class="metric-card"  align="center">
          <div class="metric-title">Overall Accuracy</div>
          <div class="metric-value large">${this.formatPct(overallAccuracy)}</div>
        </div>
        <div class="metric-card" align="center">
          <div class="metric-title">Max Streaks</div>
          <div class="metric-value large"><span style="color: green;">${maxCorrectStreak}</span> <span style="color: black;">/</span> <span style="color: red;">${maxIncorrectStreak}</span></div>
        </div>
        <div class="metric-card" align="center">
          <div class="metric-title">Avg. Correct Streak</div>
          <div class="metric-value large"><span style="color: green;">${avgStreak}</span></div>
        </div>

      </div>
        
        <div class="panel-grid">
        <div class="panel">
         <h3>Cards Due Rate (15-min intervals)</h3>
         <canvas id="histogram-chart" width="400" height="200"></canvas>
         </div>
        
        <div class="panel">
        <h3>Cards Due Timeline</h3>
        <canvas id="timeline-chart" width="400" height="200"></canvas>
        </div>
        
        <div class="panel">
        <h3>Correct Streak Distribution</h3>
        <canvas id="streak-chart" width="400" height="200"></canvas>
        </div>
        
        <!--div class="panel">
        <h3>Top 10 Best</h3>
        <ul class="small-list">
        ${best.length ? best.map((data) => `<li class="small-item"><span class="mini-hanzi">${data.hanzi}</span><span class="mini-eng">${data.english}</span><span class="mini-stats">${data.correct}/${data.total} (${(data.ratio*100).toFixed(0)}%)</span></li>`).join("") : "<li class='small-item'>No data</li>"}
        </ul>
        </div-->
        </div>
        
        <div class="panel-grid">
        <div class="panel" width="300">
          <h3>Top 10 Worst</h3>
          <ul class="small-list">
             ${worst.length ? worst.map((data) => `<li class="small-item"><span class="mini-hanzi">${data.hanzi}</span><span class="mini-pinyin">${data.pinyin}</span><span class="mini-eng">${data.english}</span><span class="mini-stats">${data.correct}/${data.total} (${(data.ratio*100).toFixed(0)}%)</span></li>`).join("") : "<li class='small-item'>No data</li>"}
          </ul>
        </div>

      </div>
    `;

    // Initialize Chart.js charts
    this.initCharts(timeBuckets, dueBuckets, streakBuckets, overallAccuracy);
  },

  resetCurrentDeckStats() {
    if (!App.currentDeckId) return;
    let filterDesc = '';
    if (Filters.selectedHskLevels.size > 0) {
      filterDesc += `${Array.from(Filters.selectedHskLevels).join(', ')}`;
    }
    if (Filters.selectedTags.size > 0) {
      if (filterDesc) filterDesc += ', ';
      filterDesc += `${Array.from(Filters.selectedTags).join(', ')}`;
    }
    if (!filterDesc) {
      filterDesc = 'all cards';
    } else {
      filterDesc = `filtered by ${filterDesc}`;
    }
    if (
      !confirm(
        `Reset all stats for ${DECKS[App.currentDeckId].label} in ${App.currentDirection} direction (${filterDesc})? This cannot be undone.`,
      )
    )
      return;
    const deckStats = Storage.getDeckStats(App.currentDeckId);
    const filteredCards = App.currentFilteredCards || App.currentCards;
    const filteredCardIds = new Set(filteredCards.map(card => card.card_id.toString()));
    filteredCardIds.forEach(cardId => {
      const cardStats = deckStats.cards[cardId];
      if (cardStats && cardStats[App.currentDirection]) {
        cardStats[App.currentDirection] = {
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

  initCharts(timeBuckets, dueBuckets, streakBuckets, overallAccuracy) {
    // Cards Due Rate (15-min intervals)
    const histCtx = document.getElementById('histogram-chart');
    if (histCtx) {
      const labels = [];
      for (let i = 0; i < 95; i++) {
        labels.push(`${i*15}-${(i+1)*15}m`);
      }
      new Chart(histCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cards Due',
            data: timeBuckets,
            backgroundColor: 'rgba(0, 123, 255, 0.6)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            x: {
              ticks: {
                font: { size: 10 },
                maxTicksLimit: 24,
                 callback: function(value, index) {
                   if (index % 4 === 0) {
                     return Math.floor(index / 4) + 'h';
                   }
                   return '';
                 }
              }
            },
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Cards Due Timeline
    const dueCtx = document.getElementById('timeline-chart');
    if (dueCtx) {
      new Chart(dueCtx, {
        type: 'bar',
        data: {
          labels: ['now', '30m', '1h', '4h', '12h', '24h', '7d', '30d', '>1mth'],
          datasets: [{
            label: 'Cards Due',
            data: dueBuckets,
            backgroundColor: 'rgba(40, 167, 69, 0.6)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            x: {
              ticks: {
                font: { size: 11 },
                maxRotation: 0,
                minRotation: 0
              }
            },
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Correct Streak Distribution
    const streakCtx = document.getElementById('streak-chart');
    if (streakCtx) {
      new Chart(streakCtx, {
        type: 'bar',
        data: {
          labels: ['0', '1', '2-3', '4-5', '6+'],
          datasets: [{
            label: 'Cards',
            data: streakBuckets,
            backgroundColor: 'rgba(255, 193, 7, 0.6)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    };
  }
};