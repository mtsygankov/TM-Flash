# Learning Modes Refactoring Plan

## Overview
Refactor the current direction-based system (CH->EN, EN->CH) into 4 pedagogically-focused learning modes that eliminate the CSS class name hack and provide better learning experiences.

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
- [ ] Create `LEARNING_MODES` object with mode definitions
- [ ] Each mode should have: `id`, `name`, `description`, `frontFields`, `backFields`, `icon`
- [ ] Define `DEFAULT_MODE` constant
- [ ] Keep backward compatibility with `DIRECTION_KEYS` for migration

#### 1.2 Update Storage Schema (`storage.js`)
- [ ] Add schema version bump (current v3 → v4)
- [ ] Update default settings to use `mode` instead of `direction`
- [ ] Create migration function to convert direction-based stats to mode-based stats
- [ ] Ensure backward compatibility during transition

#### 1.3 Update Stats Structure (`stats.js`)
- [ ] Change from per-direction stats to per-mode stats
- [ ] Update `syncStats()` to handle mode-based tracking
- [ ] Migrate existing direction stats to appropriate modes during schema upgrade

### Phase 2: UI and Display Logic (User Interface)

#### 2.1 Modal UI Redesign (`modal.js`, `index.html`)
- [ ] Replace direction toggle with mode selector (radio buttons or dropdown)
- [ ] Add mode descriptions and icons in modal
- [ ] Update modal content rendering to show mode options
- [ ] Add visual indicators for current mode selection

#### 2.2 CSS Refactoring (`styles.css`)
- [ ] Remove all `.direction-*` classes and related CSS rules
- [ ] Create semantic `.mode-*` classes (`.mode-hanzi-first`, `.mode-listening`, etc.)
- [ ] Update card visibility rules to use mode classes
- [ ] Ensure responsive design works with new mode classes

#### 2.3 Card Rendering Logic (`review.js`)
- [ ] Update `renderCard()` to accept mode parameter
- [ ] Implement conditional rendering based on mode:
  - Hide/show pinyin, definition, audio elements appropriately
  - Handle audio auto-play for Listening mode
- [ ] Update `applyDirectionAndFlip()` → `applyModeAndFlip()`
- [ ] Add audio playback logic for Listening mode front

### Phase 3: Application Logic (Business Logic)

#### 3.1 Settings Management (`settings.js`)
- [ ] Update `loadDirection()` → `loadMode()`
- [ ] Update `applyDirection()` → `applyMode()`
- [ ] Change toggle logic to cycle through modes or use modal selector
- [ ] Update settings persistence to use `mode` instead of `direction`

#### 3.2 Review Flow Updates (`review.js`)
- [ ] Update SRS integration to use mode instead of direction
- [ ] Modify `onCorrect()`/`onIncorrect()` to track mode-based stats
- [ ] Update progress bar and review toggles for mode-aware logic
- [ ] Handle special cases (audio auto-play, hidden elements)

#### 3.3 App Initialization (`app.js`)
- [ ] Update `App.currentDirection` → `App.currentMode`
- [ ] Initialize with default mode instead of direction
- [ ] Update all references to use mode instead of direction

### Phase 4: Data Migration and Compatibility (Data Layer)

#### 4.1 Stats Migration
- [ ] Create migration script to convert direction stats to mode stats
- [ ] Map CH->EN stats to appropriate modes (Hanzi First, Pronunciation)
- [ ] Map EN->CH stats to Meaning to Chinese mode
- [ ] Handle edge cases and data validation

#### 4.2 Backward Compatibility
- [ ] Ensure old direction-based saves can still load
- [ ] Provide graceful fallback for missing mode data
- [ ] Add version checking and migration prompts

### Phase 5: Audio Integration (Media Handling)

#### 5.1 Auto-play for Listening Mode
- [ ] Implement automatic audio playback when card renders in Listening mode
- [ ] Add user preference for auto-play (accessibility)
- [ ] Handle audio loading errors gracefully
- [ ] Add visual/audio cues for audio playback state

#### 5.2 Audio Controls
- [ ] Add manual play buttons for modes that show audio on back
- [ ] Ensure audio works across all modes that use it
- [ ] Test audio loading performance

### Phase 6: Testing and Validation (Quality Assurance)

#### 6.1 Unit Testing
- [ ] Test each mode renders correctly
- [ ] Verify stats tracking per mode
- [ ] Test audio functionality in Listening mode
- [ ] Validate data migration

#### 6.2 Integration Testing
- [ ] Test mode switching preserves state
- [ ] Verify backward compatibility with old saves
- [ ] Test across different decks and card types
- [ ] Performance testing with large decks

#### 6.3 User Experience Testing
- [ ] Test accessibility (screen readers, keyboard navigation)
- [ ] Verify responsive design on mobile/desktop
- [ ] Test audio playback reliability
- [ ] Validate learning effectiveness of each mode

### Phase 7: Documentation and Deployment (Finalization)

#### 7.1 Update Documentation
- [ ] Update `TECHNICAL-NOTES.md` with new mode structure
- [ ] Update `AGENTS.md` with new mode descriptions
- [ ] Create user guide for new modes
- [ ] Update deck JSON schema documentation

#### 7.2 Deployment Preparation
- [ ] Create migration guide for existing users
- [ ] Test on multiple browsers and devices
- [ ] Prepare rollback plan if needed
- [ ] Update version numbers and changelogs

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
- CH→EN direction stats → split between Hanzi First and Pronunciation modes
- EN→CH direction stats → Meaning to Chinese mode
- New Listening mode starts with zero stats

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

- [ ] All 4 modes render correctly with appropriate content visibility
- [ ] Audio auto-plays in Listening mode
- [ ] Stats migrate correctly from old direction system
- [ ] Modal provides intuitive mode selection
- [ ] No CSS direction string hacks remain
- [ ] Backward compatibility maintained
- [ ] Performance meets targets (< 2s load, < 50ms interactions)
- [ ] All existing functionality preserved