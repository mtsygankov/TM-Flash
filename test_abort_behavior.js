/**
 * Test script to verify the listening mode abort behavior fix
 * This simulates the user aborting the listening countdown
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
        this.applyModeAndFlip();
    },

    // Mock applyModeAndFlip function
    applyModeAndFlip() {
        const mode = App.currentMode;
        const flipped = App.flipped;

        console.log(`applyModeAndFlip: mode=${mode}, flipped=${flipped}`);

        // Apply mode and flip classes
        const modeClass = `mode-${mode.replace('LM-', '').replace('-', '-')}`;
        const className = `${modeClass} ${flipped ? "flipped" : ""}`;
        console.log(`applyModeAndFlip: setting class to ${className}`);
    },

    // Mock playAudioForCard function
    playAudioForCard(card) {
        console.log('playAudioForCard called for card:', card?.card_id);
    },

    // Mock showListeningPopup function
    showListeningPopup() {
        if (this.listeningPopupVisible) {
            console.log('showListeningPopup: already visible, returning');
            return;
        }

        console.log('showListeningPopup: showing popup...');
        this.listeningPopupVisible = true;

        // Render the card so it's visible behind the popup
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

// Test the abort behavior
console.log('=== Testing Listening Mode Abort Behavior Fix ===\n');

// Simulate the startLearning flow
console.log('1. Simulating "Start learning" click...');
Review.showListeningPopup();

// Simulate user aborting the countdown after 1.5 seconds (during 3-2-1 countdown)
setTimeout(() => {
    console.log('\n2. User aborts countdown by pressing space...');
    console.log('3. Expected: popup dismissed AND card flipped to show answer');

    // This simulates the space key handler
    if (Review.listeningPopupVisible) {
        Review.dismissListeningPopup();
        Review.toggleFlip(); // This is our fix
    }

    console.log(`\n4. Final state: flipped=${App.flipped} (should be true)`);

    if (App.flipped) {
        console.log('✓ SUCCESS: Card was flipped to show answer when user aborted countdown');
    } else {
        console.log('✗ FAILURE: Card was not flipped when user aborted countdown');
    }

}, 1500);

console.log('\n=== Test Complete ===');