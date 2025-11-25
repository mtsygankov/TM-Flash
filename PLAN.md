# Learning Modes Refactoring Plan

## Overview
Refactor the current direction-based system into 4 pedagogically-focused learning modes that eliminate the CSS class name hack and provide better learning experiences.

## New Learning Modes

### 1. Hanzi First!
- **Front**: Only Chinese characters (no pinyin)
- **Back**: Pinyin, definition, audio
- **Purpose**: Trains essential skill of recognizing characters directly and recalling meaning/pronunciation without pinyin crutch

### 2. Listening
- **Front**: Audio only (plays automatically)
- **Back**: Hanzi, pinyin, definition
- **Purpose**: Trains pure listening comprehension for real conversations and media

### 3. Meaning to Chinese
- **Front**: Definition only
- **Back**: Hanzi, pinyin, audio
- **Purpose**: Forces active production of Chinese words/phrases from meaning (passive → active vocabulary)

### 4. Pronunciation
- **Front**: Only Chinese characters
- **Back**: Pinyin and audio only (definition hidden/small)
- **Purpose**: Specifically trains accurate recall of tones and pronunciation when seeing characters

## Implementation Steps

### Phase 1: Core Infrastructure (Foundation)

#### 1.1 Define Mode Constants (`constants.js`)
- [x] Create `LEARNING_MODES` object with mode definitions
- [x] Each mode should have: `id`, `name`, `description`, `frontFields`, `backFields`, `icon`
- [x] Define `DEFAULT_MODE` constant

#### 1.2 Update Storage Schema (`storage.js`)
- [x] Add schema version bump (current v3 → v4)
- [x] Update default settings to use `mode` instead of `direction`
- [x] Create migration function to convert direction-based stats to mode-based stats
- [x] Ensure backward compatibility during transition

#### 1.3 Update Stats Structure (`stats.js`)
- [x] Change from per-direction stats to per-mode stats
- [x] Update `syncStats()` to handle mode-based tracking
- [x] Migrate existing direction stats to appropriate modes during schema upgrade

### Phase 2: UI and Display Logic (User Interface)

#### 2.1 Modal UI Redesign (`modal.js`, `index.html`)
- [x] Replace direction toggle with mode selector (radio buttons or dropdown)
- [x] Add mode descriptions and icons in modal
- [x] Update modal content rendering to show mode options
- [x] Add visual indicators for current mode selection

#### 2.2 CSS Refactoring (`styles.css`)
- [x] Remove all `.direction-*` classes and related CSS rules
- [x] Create semantic `.mode-*` classes (`.mode-hanzi-first`, `.mode-listening`, etc.)
- [x] Update card visibility rules to use mode classes
- [x] Ensure responsive design works with new mode classes

#### 2.3 Card Rendering Logic (`review.js`)
- [x] Update `renderCard()` to accept mode parameter
- [x] Implement conditional rendering based on mode:
  - Hide/show pinyin, definition, audio elements appropriately
  - Handle audio auto-play for Listening mode
- [x] Update `applyDirectionAndFlip()` → `applyModeAndFlip()`
- [x] Add audio playback logic for Listening mode front

### Phase 3: Application Logic (Business Logic)

#### 3.1 Settings Management (`settings.js`)
- [x] Update `loadDirection()` → `loadMode()`
- [x] Update `applyDirection()` → `applyMode()`
- [x] Change toggle logic to cycle through modes or use modal selector
- [x] Update settings persistence to use `mode` instead of `direction`

#### 3.2 Review Flow Updates (`review.js`)
- [x] Update SRS integration to use mode instead of direction
- [x] Modify `onCorrect()`/`onIncorrect()` to track mode-based stats
- [x] Update progress bar and review toggles for mode-aware logic
- [x] Handle special cases (audio auto-play, hidden elements)

#### 3.3 App Initialization (`app.js`)
- [x] Update `App.currentDirection` → `App.currentMode`
- [x] Initialize with default mode instead of direction
- [x] Update all references to use mode instead of direction

### Phase 4: Data Migration and Compatibility (Data Layer)

#### 4.1 Stats Migration
- [x] Create migration script to convert direction stats to mode stats
- [x] Map old direction stats to appropriate modes (LM-hanzi-first, LM-pronunciation)
- [x] Map old direction stats to LM-meaning-to-chinese mode
- [x] Handle edge cases and data validation

#### 4.2 Backward Compatibility
- [x] Ensure old direction-based saves can still load
- [x] Provide graceful fallback for missing mode data
- [x] Add version checking and migration prompts

### Phase 5: Audio Integration (Media Handling)

#### 5.1 Auto-play for Listening Mode
- [x] Implement automatic audio playback when card renders in Listening mode
- [x] Add user preference for auto-play (accessibility)
- [x] Handle audio loading errors gracefully
- [x] Add visual/audio cues for audio playback state

#### 5.2 Audio Controls
- [x] Add manual play buttons for modes that show audio on back
- [x] Ensure audio works across all modes that use it
- [x] Test audio loading performance

### Phase 6: Testing and Validation (Quality Assurance)

#### 6.1 Unit Testing
- [x] Test each mode renders correctly
- [x] Verify stats tracking per mode
- [x] Test audio functionality in Listening mode
- [x] Validate data migration

#### 6.2 Integration Testing
- [x] Test mode switching preserves state
- [x] Verify backward compatibility with old saves
- [x] Test across different decks and card types
- [x] Performance testing with large decks

#### 6.3 User Experience Testing
- [x] Test accessibility (screen readers, keyboard navigation)
- [x] Verify responsive design on mobile/desktop
- [x] Test audio playback reliability
- [x] Validate learning effectiveness of each mode

### Phase 7: Documentation and Deployment (Finalization)

#### 7.1 Update Documentation
- [x] Update `TECHNICAL-NOTES.md` with new mode structure
- [x] Update `AGENTS.md` with new mode descriptions
- [x] Create user guide for new modes
- [x] Update deck JSON schema documentation

#### 7.2 Deployment Preparation
- [x] Create migration guide for existing users
- [x] Test on multiple browsers and devices
- [x] Prepare rollback plan if needed
- [x] Update version numbers and changelogs

## Technical Considerations

### Mode Definition Structure
```javascript
const LEARNING_MODES = {
  HANZI_FIRST: {
    id: 'LM-hanzi-first',
    name: 'Hanzi First!',
    description: 'Recognize characters directly without pinyin crutch',
    frontFields: ['hanzi'],
    backFields: ['pinyin', 'def', 'audio'],
    icon: '👁️'
  },
  LISTENING: {
    id: 'LM-listening',
    name: 'Listening',
    description: 'Pure listening comprehension training',
    frontFields: ['audio'], // auto-play
    backFields: ['hanzi', 'pinyin', 'def'],
    icon: '🎧'
  },
  // ... etc
};
```

### CSS Class Migration
- Remove: `.direction-ch-en`, `.direction-en-ch`
- Add: `.mode-hanzi-first`, `.mode-listening`, `.mode-meaning-to-chinese`, `.mode-pronunciation`

### Stats Migration Logic
- Old direction stats → split between LM-hanzi-first and LM-pronunciation modes
- Old direction stats → LM-meaning-to-chinese mode
- New LM-listening mode starts with zero stats

### Audio Auto-play Implementation
- Use `HTMLAudioElement.play()` with error handling
- Respect user audio preferences
- Add loading states and retry logic

## Risk Mitigation

### Data Loss Prevention
- Backup existing stats before migration
- Test migration on sample data first
- Provide manual migration verification

### User Experience Continuity
- Maintain familiar UI patterns where possible
- Provide clear mode explanations
- Allow easy mode switching

### Performance Impact
- Test rendering performance with new conditional logic
- Monitor memory usage with audio elements
- Optimize CSS for new class structure

## Success Criteria

- [x] All 4 modes render correctly with appropriate content visibility
- [x] Audio auto-plays in Listening mode
- [x] Stats migrate correctly from old direction system
- [x] Modal provides intuitive mode selection
- [x] No CSS direction string hacks remain
- [x] Backward compatibility maintained
- [x] Performance meets targets (< 2s load, < 50ms interactions)
- [x] All existing functionality preserved