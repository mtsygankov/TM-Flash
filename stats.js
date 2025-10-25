// Stats module
const Stats = {
  sync(deckId, cards) {
    const deckStats = Storage.getDeckStats(deckId);
    const validCardIds = new Set(cards.map((card) => card.card_id));
    const syncedCards = {};

      // Add missing entries for valid cards
     cards.forEach((card) => {
       if (!deckStats.cards[card.card_id]) {
         syncedCards[card.card_id] = {
           "CH->EN": {
             total_correct: 0,
             total_incorrect: 0,
             last_correct_at: null,
             last_incorrect_at: null,
             correct_streak_len: 0,
             incorrect_streak_len: 0,
             correct_streak_started_at: null,
             incorrect_streak_started_at: null
           },
           "EN->CH": {
             total_correct: 0,
             total_incorrect: 0,
             last_correct_at: null,
             last_incorrect_at: null,
             correct_streak_len: 0,
             incorrect_streak_len: 0,
             correct_streak_started_at: null,
             incorrect_streak_started_at: null
           },
         };
       } else {
         syncedCards[card.card_id] = deckStats.cards[card.card_id];
       }
     });

    // Remove orphaned entries (cards that no longer exist in the deck)
    Object.keys(deckStats.cards).forEach((cardId) => {
      if (!validCardIds.has(cardId)) {
        console.log(`Removing orphaned stats for card: ${cardId}`);
      } else {
        syncedCards[cardId] = deckStats.cards[cardId];
      }
    });

    const syncedStats = { cards: syncedCards };
    Storage.setDeckStats(deckId, syncedStats);

    console.log(`Stats sync complete for ${deckId}: ${Object.keys(syncedCards).length} cards`);
    return syncedStats;
  },

  getCardStats(deckId, cardId, direction) {
    const deckStats = Storage.getDeckStats(deckId);
    return (
      deckStats.cards[cardId]?.[direction] || {
        total_correct: 0,
        total_incorrect: 0,
        last_correct_at: null,
        last_incorrect_at: null,
        correct_streak_len: 0,
        incorrect_streak_len: 0,
        correct_streak_started_at: null,
        incorrect_streak_started_at: null
      }
    );
  },

   updateCardStats(deckId, cardId, direction, isCorrect) {
     const deckStats = Storage.getDeckStats(deckId);
     const cardStats = deckStats.cards[cardId] || {
       "CH->EN": {
         total_correct: 0,
         total_incorrect: 0,
         last_correct_at: null,
         last_incorrect_at: null,
         correct_streak_len: 0,
         incorrect_streak_len: 0,
         correct_streak_started_at: null,
         incorrect_streak_started_at: null
       },
       "EN->CH": {
         total_correct: 0,
         total_incorrect: 0,
         last_correct_at: null,
         last_incorrect_at: null,
         correct_streak_len: 0,
         incorrect_streak_len: 0,
         correct_streak_started_at: null,
         incorrect_streak_started_at: null
       },
     };

    if (!cardStats[direction]) {
      cardStats[direction] = {
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

    const now = Date.now();

    if (isCorrect) {
      cardStats[direction].total_correct++;
      cardStats[direction].last_correct_at = now;

      if (cardStats[direction].incorrect_streak_len > 0) {
        // Reset incorrect streak
        cardStats[direction].incorrect_streak_len = 0;
        cardStats[direction].correct_streak_len = 1;
        cardStats[direction].correct_streak_started_at = now;
      } else {
        // Starting or continuing correct streak
        if (cardStats[direction].correct_streak_len === 0) {
          cardStats[direction].correct_streak_started_at = now;
        }
        cardStats[direction].correct_streak_len++;
      }
    } else {
      cardStats[direction].total_incorrect++;
      cardStats[direction].last_incorrect_at = now;

      if (cardStats[direction].correct_streak_len > 0) {
        // Reset correct streak
        cardStats[direction].correct_streak_len = 0;
        cardStats[direction].incorrect_streak_len = 1;
        cardStats[direction].incorrect_streak_started_at = now;
      } else {
        // Starting or continuing incorrect streak
        if (cardStats[direction].incorrect_streak_len === 0) {
          cardStats[direction].incorrect_streak_started_at = now;
        }
        cardStats[direction].incorrect_streak_len++;
      }
    }

    deckStats.cards[cardId] = cardStats;
    Storage.setDeckStats(deckId, deckStats);
    // Update in-memory stats
    App.currentStats = deckStats;
  },

   computeMetrics(deckId, direction, cards = null) {
     const deckStats = Storage.getDeckStats(deckId);
     let totalCards = 0;
     let reviewedCount = 0;
     const cardList = cards || Object.keys(deckStats.cards).map(id => ({ card_id: id }));
     cardList.forEach((card) => {
       totalCards++;
       const dirStat = deckStats.cards[card.card_id]?.[direction];
       if (dirStat && dirStat.total_correct + dirStat.total_incorrect > 0) reviewedCount++;
     });
     const newCount = totalCards - reviewedCount;
     const deckErrors = deckStats.errorCount || 0;
     return { totalCards, reviewedCount, newCount, deckErrors };
   },
};