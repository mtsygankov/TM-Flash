// SRS module
const SRS = {
  calculateNextReviewInterval(cardStats) {
    const {
      total_correct,
      total_incorrect,
      last_correct_at,
      last_incorrect_at,
      correct_streak_len,
      incorrect_streak_len,
      correct_streak_started_at,
      incorrect_streak_started_at
    } = cardStats;

    const total_reviews = total_correct + total_incorrect;
    const accuracy = total_reviews > 0 ? total_correct / total_reviews : 0;
    const now = Date.now();

    // Base intervals (in hours)
    const BASE_INTERVALS = [0.5, 4, 24, 72, 168, 336, 720, 1440]; // 30min to 60 days

    // Determine base interval index based on correct streak
    let intervalIndex = Math.min(correct_streak_len, BASE_INTERVALS.length - 1);
    let baseInterval = BASE_INTERVALS[intervalIndex];

    // Modifiers based on performance
    let modifier = 1.0;

    // Recent performance modifier
    if (last_incorrect_at && last_correct_at) {
      const recentlyIncorrect = last_incorrect_at > last_correct_at;
      if (recentlyIncorrect) {
        modifier *= 0.3; // Much shorter interval after mistake
      }
    }

    // Accuracy modifier
    if (total_reviews >= 3) {
      if (accuracy >= 0.9) modifier *= 1.3;
      else if (accuracy >= 0.7) modifier *= 1.0;
      else if (accuracy >= 0.5) modifier *= 0.7;
      else modifier *= 0.4;
    }

    // Incorrect streak penalty
    if (incorrect_streak_len > 0) {
      modifier *= Math.pow(0.5, incorrect_streak_len); // Exponential penalty
    }

    // Long correct streak bonus (but cap it)
    if (correct_streak_len > 5) {
      modifier *= Math.min(2.0, 1 + (correct_streak_len - 5) * 0.1);
    }

    const finalInterval = baseInterval * modifier;
    return Math.max(0.5, Math.min(finalInterval, 2160)); // Min 30min, max 90 days
  },

  shouldReviewCard(cardStats) {
    if (!cardStats.last_correct_at && !cardStats.last_incorrect_at) {
      return true; // New card
    }

    const lastReview = Math.max(cardStats.last_correct_at || 0, cardStats.last_incorrect_at || 0);
    const intervalHours = this.calculateNextReviewInterval(cardStats);
    const nextReviewTime = lastReview + (intervalHours * 60 * 60 * 1000);
    const now = Date.now();
    const isDue = now >= nextReviewTime;

    return isDue;
  },

  selectNextCard(cards, statsMap, mode) {
    if (!cards || cards.length === 0) {
     console.warn("❌ No cards array or empty array");
      return null;
    }

    const dueCards = cards.filter(card => {
      const cardStats = statsMap[card.card_id];
      const stats = cardStats?.[mode];
      const isDue = this.shouldReviewCard(stats || {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      });

      return isDue;
    });

    dueCards.forEach(card => {
      const cardStats = statsMap[card.card_id];
    });

    const excludedCards = cards.filter(card => !dueCards.includes(card));
    excludedCards.forEach(card => {
      const cardStats = statsMap[card.card_id];
      const stats = cardStats?.[mode];
      const isDue = this.shouldReviewCard(stats || {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      });
    });

    if (dueCards.length === 0) {
      console.warn("❌ No due cards found");
      return null;
    }

    // Priority scoring for due cards
    const scoredCards = dueCards.map(card => {
      const stats = statsMap[card.card_id]?.[mode] || {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      };

      const total_reviews = stats.total_correct + stats.total_incorrect;

      let priority = 0;

      // New cards get highest priority
      if (total_reviews === 0) {
        priority = 1500;
      } else {
        // Recently failed cards
        if (stats.incorrect_streak_len > 0) {
          priority = 500 + (stats.incorrect_streak_len * 100);
        }

        // Overdue factor
        const lastReview = Math.max(stats.last_correct_at || 0, stats.last_incorrect_at || 0);
        const intervalHours = this.calculateNextReviewInterval(stats);
        const expectedReviewTime = lastReview + (intervalHours * 60 * 60 * 1000);
        const overdueFactor = Math.max(1, (Date.now() - expectedReviewTime) / (60 * 60 * 1000));
        priority += overdueFactor * 10;

        // Low accuracy boost
        const accuracy = stats.total_correct / total_reviews;
        if (accuracy < 0.6) {
          priority += (0.6 - accuracy) * 200;
        }
      }

      // Small random factor to break ties
      priority += Math.random() * 5;

      return { card, priority };
    });

    // Sort by priority (highest first) and return top card
    scoredCards.sort((a, b) => b.priority - a.priority);
    const top = scoredCards[0];
    const topStats = statsMap?.[top.card.card_id]?.[mode] || null;
    const lastReview = topStats
      ? Math.max(topStats.last_correct_at || 0, topStats.last_incorrect_at || 0)
      : 0;
    const minsSince = lastReview ? ((Date.now() - lastReview) / 60000).toFixed(1) : "NEVER";
    return scoredCards[0].card;
  },

  countDueCards(cards, statsMap, mode) {
    return cards.filter(card => {
      const cardStats = statsMap[card.card_id];
      const stats = cardStats?.[mode];
      const isDue = this.shouldReviewCard(stats || {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      });
      return isDue
    }).length;
  },

  countFilteredCards(cards, statsMap, mode) {
    if (!cards || cards.length === 0) {
      return { total: 0, overdue: 0 };
    }

    let total = 0;
    let overdue = 0;

    cards.forEach(card => {
      const cardStats = statsMap[card.card_id];
      total++;

      // Check if overdue
      const stats = cardStats?.[mode];
      const isDue = this.shouldReviewCard(stats || {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      });

      if (isDue) {
        overdue++;
      }
    });

    return { total, overdue };
  },

  getDueCountsByTime(cards, statsMap, mode) {
    if (!cards || cards.length === 0) {
      return { overdue: 0, dueSoon15min: 0, dueSoon1h: 0, dueSoon6h: 0, dueSoon24h: 0, dueLater: 0 };
    }

    const now = Date.now();
    const buckets = {
      overdue: 0,      // already due
      dueSoon15min: 0, // due in <15min
      dueSoon1h: 0,    // due in <1h
      dueSoon6h: 0,    // due in <6h
      dueSoon24h: 0,   // due in <24h
      dueLater: 0      // due in >=24h or never
    };

    cards.forEach(card => {
      const cardStats = statsMap[card.card_id];
      const stats = cardStats?.[mode] || {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      };

      // Calculate next review time
      let nextReviewTime;
      if (!stats.last_correct_at && !stats.last_incorrect_at) {
        // New card - due now
        nextReviewTime = now;
      } else {
        const lastReview = Math.max(stats.last_correct_at || 0, stats.last_incorrect_at || 0);
        const intervalHours = this.calculateNextReviewInterval(stats);
        nextReviewTime = lastReview + (intervalHours * 60 * 60 * 1000);
      }

      const timeUntilDue = nextReviewTime - now;
      const hoursUntilDue = timeUntilDue / (60 * 60 * 1000);

      if (timeUntilDue <= 0) {
        buckets.overdue++;
      } else if (hoursUntilDue < 0.25) { // <15min
        buckets.dueSoon15min++;
      } else if (hoursUntilDue < 1) { // <1h
        buckets.dueSoon1h++;
      } else if (hoursUntilDue < 6) { // <6h
        buckets.dueSoon6h++;
      } else if (hoursUntilDue < 24) { // <24h
        buckets.dueSoon24h++;
      } else {
        buckets.dueLater++;
      }
    });

    return buckets;
  },

  getNextReviewInfo(cards, statsMap, mode) {
    if (!cards || cards.length === 0) {
      return null;
    }

    const now = Date.now();
    let earliestNextReview = Infinity;
    const nextReviewTimes = [];

    cards.forEach(card => {
      const cardStats = statsMap[card.card_id];
      const stats = cardStats?.[mode];
      if (!stats) return;

      // Skip new cards (no reviews yet)
      if (!stats.last_correct_at && !stats.last_incorrect_at) return;

      const lastReview = Math.max(stats.last_correct_at || 0, stats.last_incorrect_at || 0);
      const intervalHours = this.calculateNextReviewInterval(stats);
      const nextReviewTime = lastReview + (intervalHours * 60 * 60 * 1000);

      if (nextReviewTime > now) {
        nextReviewTimes.push(nextReviewTime);
        if (nextReviewTime < earliestNextReview) {
          earliestNextReview = nextReviewTime;
        }
      }
    });

    if (nextReviewTimes.length === 0) {
      return null;
    }

    const timeDiffMs = earliestNextReview - now;
    const timeDiffHours = timeDiffMs / (60 * 60 * 1000);

    let timeString;
    if (timeDiffHours < 2) {
      const minutes = Math.ceil(timeDiffMs / (60 * 1000))
      timeString = `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (timeDiffHours < 24) {
      const hours = Math.ceil(timeDiffHours);
      timeString = `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.ceil(timeDiffHours / 24);
      timeString = `${days} day${days > 1 ? 's' : ''}`;
    }

    const oneHourLater = earliestNextReview + (60 * 60 * 1000);
    const cardsInWindow = nextReviewTimes.filter(time => time <= oneHourLater).length;

    return {
      timeString,
      cardsInWindow
    };
  },
};
