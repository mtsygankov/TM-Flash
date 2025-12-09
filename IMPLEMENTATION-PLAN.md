# Implementation Plan: Play Audio After Card Flipping Feature

## Overview
This document outlines the implementation plan for adding a "Play audio after card flipping" setting to TM-Flash.

## Current State Analysis

### Audio Playback System
- **AudioPlayer module** (`audio.js`): Handles audio playback with overlap prevention
- **Review module** (`review.js`): Contains `playAudioForCard()` method
- **Current triggers**: Manual play button, Down arrow key, Listening mode auto-play

### Settings System
- **Storage module** (`storage.js`): Schema version 5, manages localStorage
- **Modal module** (`modal.js`): Handles settings UI and persistence
- **Current settings**: `showPinyin`, `showProgress`, `mode`, `selected_deck`, `theme`

## Implementation Steps

### 1. Storage Schema Update
**File**: `storage.js`
**Changes**:
- Bump `CURRENT_SCHEMA_VERSION` from 5 to 6
- Add `playAudioOnFlip: false` to default settings in `getDefaultState()`

### 2. HTML UI Update
**File**: `index.html`
**Changes**:
- Add new checkbox in modal settings section:
```html
<label class="setting-item">
    <input type="checkbox" id="setting-play-audio-on-flip">
    <span>Play audio after card flipping</span>
</label>
```

### 3. Modal Module Update
**File**: `modal.js`
**Changes**:
- Add `'setting-play-audio-on-flip'` to `settingIds` array
- Update `loadSettings()` to load the new setting
- Update `saveSettings()` to save the new setting
- Update `applySettings()` if needed

### 4. Review Module Update
**File**: `review.js`
**Changes**:
- Modify `toggleFlip()` method to play audio after flipping:
```javascript
toggleFlip() {
    App.flipped = !App.flipped;
    // Reset audio flag when flipping back to front for listening mode
    if (!App.flipped && App.currentMode === 'LM-listening') {
        this.audioPlayedForCurrentCard = false;
    }
    this.applyModeAndFlip();

    // Play audio after flipping if setting is enabled
    if (App.flipped && App.currentCard && App.currentCard.audio) {
        const settings = Storage.getSettings();
        if (settings.playAudioOnFlip) {
            // Find the play audio button for visual feedback
            const playAudioBtn = document.querySelector('.play-audio-btn');
            this.playAudioForCard(App.currentCard, playAudioBtn);
        }
    }
}
```

## Testing Plan

### Test Cases
1. **Basic functionality**: Enable setting, flip card, verify audio plays
2. **Cards without audio**: Enable setting, flip card without audio, verify no error
3. **Setting persistence**: Enable/disable setting, refresh page, verify persistence
4. **Interaction with existing features**: Test with Down arrow key, manual play button
5. **Different learning modes**: Test in all 4 learning modes
6. **Mobile/desktop**: Test on different devices

### Expected Behavior
- Audio plays automatically when card is flipped (if setting enabled and audio available)
- No audio plays if card has no audio file
- Setting persists across page refreshes
- Works alongside existing audio controls
- Visual feedback on play button when audio plays automatically

## Migration Strategy
- Schema version bump to 6 will trigger migration
- Existing users will get default value `false` (disabled)
- No data loss expected

## Error Handling
- Check for card audio existence before attempting playback
- Graceful handling if audio file is missing
- No impact on existing functionality if setting is disabled

## Documentation Updates
- Update USER-GUIDE.md with new setting description
- Update TECHNICAL-NOTES.md with implementation details
- Add to settings section in documentation

## Rollback Plan
- If issues arise, users can disable the setting
- Schema migration is non-destructive
- Easy to revert code changes if needed