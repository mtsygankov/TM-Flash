# TM-Flash Product Overview

## Problem Statement
Chinese language learners need an efficient, accessible tool for vocabulary memorization that:
- Works offline without internet dependency
- Supports multiple learning approaches for different skill development
- Tracks progress with intelligent scheduling for optimal retention
- Functions seamlessly across devices without complex setup

## Solution
TM-Flash is a lightweight, browser-based flashcard application using spaced repetition to help Chinese vocabulary learners efficiently memorize characters, pronunciation, and meanings.

## Target Users
- **Primary**: Chinese language learners at beginner to intermediate levels (HSK 1-6)
- **Secondary**: Self-study learners who prefer offline-capable tools
- **Use Cases**: Daily vocabulary drilling, HSK exam preparation, pronunciation practice

## Core User Experience

### Learning Flow
1. User opens the app and sees the **Start Screen** with deck info and cards due
2. Clicks "Start learning now" to enter **Review Mode**
3. Card displays based on selected **Learning Mode**:
   - **Hanzi First**: Chinese characters → recall meaning/pronunciation
   - **Listening**: Audio plays → recall characters and meaning
   - **Meaning to Chinese**: English definition → recall Chinese
   - **Pronunciation**: Characters → recall correct tones/pronunciation
4. User clicks/taps to flip card and reveal answer
5. User marks response as **Correct** or **Incorrect** (swipe, click, or keyboard)
6. SRS algorithm schedules next review based on performance
7. Progress bar shows cards due across time buckets

### Navigation Structure
- **Review Tab**: Main flashcard review interface
- **Search Tab**: Search cards by pinyin, hanzi, or English
- **Stats Tab**: View learning statistics and progress charts
- **Settings Modal** (☰): Deck selection, filters, learning mode, preferences

### Key Interactions
| Action | Desktop | Mobile | Keyboard |
|--------|---------|--------|----------|
| Flip card | Click | Tap | Space |
| Mark correct | Click button | Swipe right | → Arrow |
| Mark incorrect | Click button | Swipe left | ← Arrow |
| Open settings | Click ☰ | Tap ☰ | - |
| Return to review | - | - | Escape |

## Learning Modes

### 1. Hanzi First! 👁️
- **Front**: Chinese characters only
- **Back**: Pinyin, definition, audio
- **Skill**: Character recognition without pinyin dependency

### 2. Listening 🎧
- **Front**: Audio auto-plays
- **Back**: Hanzi, pinyin, definition
- **Skill**: Listening comprehension for conversations

### 3. Meaning to Chinese 💭
- **Front**: English definition
- **Back**: Hanzi, pinyin, audio
- **Skill**: Active vocabulary production

### 4. Pronunciation 🗣️
- **Front**: Chinese characters
- **Back**: Pinyin, audio (definition minimized)
- **Skill**: Tone and pronunciation recall

## Value Propositions
1. **Zero Setup**: Opens in browser, no installation required
2. **Offline Capable**: Works without internet after initial load
3. **Fast Performance**: < 2s load time, < 50ms interactions
4. **Multi-Mode Learning**: Four complementary approaches
5. **Intelligent Scheduling**: SRS optimizes review timing
6. **Progress Tracking**: Detailed statistics and visualizations
7. **Responsive Design**: Works on desktop and mobile

## Success Metrics
- **Retention**: Cards correctly recalled after spaced intervals
- **Engagement**: Daily active usage streaks
- **Coverage**: Percentage of deck reviewed
- **Accuracy**: Correct/incorrect ratio per mode