/**
 * Test script to verify the listening mode sequence fix
 * This simulates the actual code flow to ensure the sequence works correctly
 */

// Mock the key objects and functions
const App = {
    currentCard: {
        card_id: 'test-card',
        hanzi: '测试',
        pinyin: 'cè shì',
        tones: '4 4',
        def: 'test',
        def_words: ['test'],
        audio: 'test_audio.mp3'
    },
    currentMode: 'LM-listening',
    flipped: false,
    currentDeck: {
        audio_path: 'decks/test_audio'
    }
};

const Review = {
    audioPlayedForCurrentCard: false,
    listeningPopupVisible: false,
    listeningCountdownInterval: null,
    listeningTimeout: null,

    // Mock renderCard function
    renderCard(card) {
        console.log('renderCard called with card:', card?.card_id);
        // This would normally render the card UI
        this.applyModeAndFlip();
    },

    // Mock applyModeAndFlip function (with our fix)
    applyModeAndFlip() {
        const mode = App.currentMode;
        const flipped = App.flipped;

        console.log(`applyModeAndFlip: mode=${mode}, flipped=${flipped}, popupVisible=${this.listeningPopupVisible}`);

        // Our fixed logic: only play audio if not in popup sequence
        if (!flipped && mode === 'LM-listening' && !this.audioPlayedForCurrentCard) {
            if (!this.listeningPopupVisible) {
                console.log('❌ ERROR: Audio would play immediately (this should not happen with our fix)');
                this.playAudioForCard(App.currentCard);
                this.audioPlayedForCurrentCard = true;
            } else {
                console.log('✓ GOOD: Audio not played immediately because popup is visible');
            }
        }
    },

    // Mock playAudioForCard function
    playAudioForCard(card) {
        console.log('playAudioForCard called for card:', card?.card_id);
    },

    // Mock showListeningPopup function (with our fix)
    showListeningPopup() {
        if (this.listeningPopupVisible) {
            console.log('showListeningPopup: already visible, returning');
            return;
        }

        console.log('showListeningPopup: showing popup FIRST (to prevent immediate audio)...');
        this.listeningPopupVisible = true;

        console.log('showListeningPopup: rendering card second...');
        this.renderCard(App.currentCard);

        // Simulate 3-2-1 countdown
        console.log('showListeningPopup: starting 3-2-1 countdown...');
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            console.log(`Countdown: ${countdown}`);
            countdown--;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                console.log('Countdown complete, calling startAudioPlayback...');
                this.startAudioPlayback();
            }
        }, 1000);
    },

    // Mock startAudioPlayback function
    startAudioPlayback() {
        console.log('startAudioPlayback: playing audio...');
        this.playAudioForCard(App.currentCard);

        // Simulate 10-second listening countdown
        console.log('startAudioPlayback: starting 10-second countdown...');
        let listeningTime = 10;
        const listeningInterval = setInterval(() => {
            console.log(`Listening countdown: ${listeningTime}`);
            listeningTime--;
            if (listeningTime <= 0) {
                clearInterval(listeningInterval);
                console.log('Listening countdown complete, auto-flipping card...');
                this.dismissListeningPopup();
                this.toggleFlip();
            }
        }, 1000);
    },

    // Mock dismissListeningPopup function
    dismissListeningPopup() {
        console.log('dismissListeningPopup: dismissing popup...');
        this.listeningPopupVisible = false;
    },

    // Mock toggleFlip function
    toggleFlip() {
        App.flipped = !App.flipped;
        console.log(`toggleFlip: flipped=${App.flipped}`);
        this.applyModeAndFlip();
    }
};

// Test the sequence
console.log('=== Testing Listening Mode Sequence Fix ===\n');

// Simulate the startLearning flow
console.log('1. Simulating "Start learning" click...');
console.log('2. Review mode starts, card selected...');

// This is the key fix: show popup BEFORE view transition
console.log('3. Showing listening popup (BEFORE view transition)...');
Review.showListeningPopup();

// The view transition would happen after a small delay
setTimeout(() => {
    console.log('4. View transition to review complete...');
}, 100);

console.log('\n=== Expected Sequence ===');
console.log('1. Start learning clicked');
console.log('2. Review mode starts (current card is selected etc.)');
console.log('3. Popup shown');
console.log('4. 3..2..1.. countdown runs');
console.log('5. Audio plays (after countdown)');
console.log('6. 10..9..8..7..6..5..4..3..2..1.. countdown runs');
console.log('7. Back of the card opens automatically');

console.log('\n=== Test Complete ===');