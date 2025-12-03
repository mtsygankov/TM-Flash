// AudioPlayer module - Manages audio playback with prevention of overlapping sounds
const AudioPlayer = {
  isPlaying: false,
  currentAudio: null,
  currentButton: null,

  // Play audio with prevention of overlaps and visual feedback
  play(url, button) {
    // If already playing, ignore the click completely
    if (this.isPlaying && this.currentAudio) {
      return;
    }

    // Set visual feedback on the button
    if (button) {
      button.classList.add('playing');
      this.currentButton = button;
    }

    // Create and play new audio
    this.currentAudio = new Audio(url);
    this.isPlaying = true;

    // Handle successful playback start
    this.currentAudio.play().catch(error => {
      console.error("Error playing audio:", error);
      this.reset();
    });

    // Handle playback end
    this.currentAudio.addEventListener('ended', () => {
      this.reset();
    }, { once: true });

    // Handle playback errors
    this.currentAudio.addEventListener('error', () => {
      console.error("Audio playback error");
      this.reset();
    }, { once: true });

    // Also check for pause events that might indicate end of playback
    this.currentAudio.addEventListener('pause', () => {
      // Only reset if we've reached the end (not just paused by user)
      if (this.currentAudio.currentTime >= this.currentAudio.duration - 0.1) {
        this.reset();
      }
    }, { once: true });
  },

  // Stop current playback and reset state
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.reset();
  },

  // Reset state and visual feedback
  reset() {
    this.isPlaying = false;
    if (this.currentButton) {
      this.currentButton.classList.remove('playing');
      // Force style reset by ensuring base styles are applied
      this.currentButton.style.backgroundColor = '';
      this.currentButton.style.color = '';
      this.currentButton.style.borderColor = '';
      this.currentButton = null;
    }
  }
};