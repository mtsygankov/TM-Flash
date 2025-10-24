# TM-Flash User Guide

## Table of Contents
1. [Overview & Quick Start](#overview--quick-start)
2. [Core Features](#core-features)
3. [How to Use](#how-to-use)
4. [Interface Elements](#interface-elements)
5. [Keyboard Shortcuts & Gestures](#keyboard-shortcuts--gestures)
6. [Deck Information](#deck-information)
7. [Learning Tips](#learning-tips)
8. [Troubleshooting](#troubleshooting)

---

## Overview & Quick Start

### What is TM-Flash?

TM-Flash is a lightweight, web-based flashcard application designed specifically for learning Chinese vocabulary. It uses a sophisticated Spaced Repetition System (SRS) to help you learn efficiently by showing you cards at the optimal time for retention.

### Getting Started in 30 Seconds

1. **Open the App**: Navigate to `http://localhost:8000` in your web browser
2. **Select a Deck**: Choose from Deck A (beginner) to Deck D (advanced) using the dropdown in the header
3. **Start Reviewing**: The app will show you your first card immediately
4. **Flip & Answer**: Click the card or press Space to flip, then mark your answer as Correct or Incorrect

That's it! The app will automatically track your progress and show you the most important cards next.

### System Requirements

- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **JavaScript Enabled**: Required for all functionality
- **Device**: Works on desktop, tablet, and mobile phones
- **Internet**: Initial deck loading requires connection (works offline after first load)

---

## Core Features

### Multi-Deck System

TM-Flash includes four pre-loaded decks, each designed for different proficiency levels:

- **Deck A**: Basic words and phrases (beginner)
- **Deck B**: Elementary vocabulary (HSK 2-3 level)
- **Deck C**: Intermediate words (HSK 3-4 level)
- **Deck D**: Advanced vocabulary (HSK 4+ level)

Each deck maintains its own statistics and progress, so you can work with multiple levels simultaneously.

### Bidirectional Learning

Study in both directions:
- **Chinese → English (CH→EN)**: See Chinese characters and pinyin, recall English meaning
- **English → Chinese (EN→CH)**: See English, recall Chinese characters and pinyin

The direction toggle in the header lets you switch instantly, and each direction tracks separate statistics.

### Spaced Repetition System (SRS)

The intelligent SRS algorithm prioritizes cards based on:
- **New cards**: Shown first to introduce new vocabulary
- **Error rate**: Cards you struggle with appear more frequently
- **Time since last review**: Cards due for review are prioritized
- **Random tie-breaking**: Small randomization prevents predictability

This ensures you spend time on the cards that need the most attention.

---

## How to Use

### Review Mode

The Review mode is where you'll spend most of your time learning.

#### Card Display

Each card is displayed as a table with four rows:
1. **Hanzi**: Chinese characters (one per cell)
2. **Pinyin**: Pronunciation guide with tone marks
3. **English Words**: Individual word translations
4. **English Translation**: Complete sentence meaning

#### Direction-Based Display

- **CH→EN Direction**: Initially shows only Hanzi and Pinyin rows
- **EN→CH Direction**: Initially shows only English Words and Translation rows
- **After Flipping**: All four rows become visible

#### Answering Cards

1. **Study the visible information** based on your chosen direction
2. **Flip the card** to see the complete information
3. **Mark your answer**:
   - **Correct (Green)**: You knew the answer well
   - **Incorrect (Red)**: You struggled or didn't know

The app automatically advances to the next card after you mark your answer.

### Statistics View

Track your learning progress with detailed statistics.

#### Available Metrics

- **Total Cards**: Number of cards in the current deck
- **Reviewed Cards**: Cards you've practiced at least once
- **New Cards**: Cards you haven't studied yet
- **Deck Errors**: Number of invalid cards that were skipped during loading

#### Visual Analytics

- **Histogram**: Shows distribution of your accuracy across 5 buckets (0-20%, 21-40%, 41-60%, 61-80%, 81-100%)
- **Top 10 Best**: Your best-performing cards by accuracy
- **Top 10 Worst**: Cards that need more practice

#### Direction-Specific Stats

Statistics are tracked separately for each direction (CH→EN and EN→CH). Use the direction toggle in the stats view to switch between them.

#### Resetting Stats

You can reset statistics for the current deck and direction using the "Reset Stats" button. This is useful if you want to start fresh with a deck.

### Search Function

Quickly find specific cards in your current deck.

#### Search Types

- **Pinyin Search**: Find cards by pronunciation (tone-insensitive)
- **English Search**: Find cards by English words or translation

#### Using Search

1. **Select Search Type**: Toggle between "Pinyin" and "in English"
2. **Enter Query**: Type your search term in the input field
3. **View Results**: Matching cards appear instantly as you type
4. **Jump to Card**: Click any result to go directly to that card in Review mode

#### Search Tips

- Pinyin search is tone-insensitive: "yao" matches "yào", "yǎo", etc.
- English search matches both individual words and full translations
- Results update in real-time as you type

### Deck Management

Switch between decks seamlessly while maintaining separate progress.

#### Switching Decks

1. **Click the deck selector** in the header (shows current deck name)
2. **Choose a new deck** from the dropdown menu
3. **Wait for loading**: The app loads and validates the new deck
4. **Start studying**: Your first card from the new deck appears automatically

#### Progress Preservation

Each deck maintains completely independent statistics:
- Separate correct/incorrect counts for each card
- Individual last-reviewed timestamps
- Direction-specific progress tracking

---

## Interface Elements

### Header Controls

#### Deck Selector
- **Location**: Top-left of header
- **Function**: Switch between Deck A, B, C, and D
- **Display**: Shows currently selected deck name

#### Direction Toggle
- **Location**: Top-center of header
- **Labels**: "CH→EN" or "EN→CH"
- **Function**: Switch study direction instantly
- **Persistence**: Your choice is saved automatically

#### Star/Ignore Toggles
- **Star (⭐️)**: Mark cards as favorites for focused practice
- **Ignore (🚫)**: Temporarily hide cards from review

### Navigation Tabs

Three main views accessible via tabs in the header:
- **Review**: Main study interface
- **Search**: Find specific cards
- **Stats**: View progress and analytics

### Card Display Table

#### Structure
- **4 rows**: Hanzi, Pinyin, English Words, English Translation
- **Aligned columns**: Each token gets its own column for perfect alignment
- **Responsive**: Adapts to different screen sizes

#### Visual States
- **Unflipped**: Shows only relevant rows based on direction
- **Flipped**: All rows visible with complete information
- **Smooth transitions**: No layout jumps when flipping

### Answer Buttons

#### Primary Actions
- **Correct (Green)**: Right arrow key, swipe right, or click button
- **Incorrect (Red)**: Left arrow key, swipe left, or click button

#### Card Actions
- **Star (⭐️)**: Mark as favorite
- **Ignore (🚫)**: Hide from future reviews

---

## Keyboard Shortcuts & Gestures

### Keyboard Navigation

| Action | Keyboard Shortcut | Description |
|--------|------------------|-------------|
| **Flip Card** | `Space` | Reveal the complete card information |
| **Mark Correct** | `→` (Right Arrow) | Mark answer as correct and advance |
| **Mark Incorrect** | `←` (Left Arrow) | Mark answer as incorrect and advance |
| **Navigate Tabs** | `Tab` | Move between interactive elements |
| **Activate Button** | `Enter` | Activate focused button or control |

### Mobile Gestures

| Action | Gesture | Description |
|--------|---------|-------------|
| **Flip Card** | `Tap` on card | Reveal complete information |
| **Mark Correct** | `Swipe Right` | Mark as correct and advance |
| **Mark Incorrect** | `Swipe Left` | Mark as incorrect and advance |

### Accessibility Features

- **Screen Reader Support**: All interactive elements have proper labels
- **Keyboard Navigation**: Full keyboard accessibility without mouse
- **Focus Indicators**: Clear visual feedback for keyboard navigation
- **High Contrast**: Sufficient color contrast for visibility

---

## Deck Information

### Deck A: Basic Words (TM-Level1)
- **Level**: Beginner (HSK 1-2)
- **Focus**: Essential everyday vocabulary
- **Examples**: 可以 (kěyǐ - can), 水果店 (shuǐguǒ diàn - fruit shop)
- **Card Count**: ~200 cards
- **Best for**: Absolute beginners starting Chinese

### Deck B: Elementary Vocabulary
- **Level**: Elementary (HSK 2-3)
- **Focus**: Common conversational words
- **Topics**: Daily activities, basic descriptions, simple verbs
- **Card Count**: ~300 cards
- **Best for**: Learners with basic Chinese knowledge

### Deck C: Intermediate Words
- **Level**: Intermediate (HSK 3-4)
- **Focus**: More complex vocabulary and expressions
- **Topics**: Work, study, social situations, abstract concepts
- **Card Count**: ~400 cards
- **Best for**: Intermediate learners expanding vocabulary

### Deck D: Advanced Vocabulary
- **Level**: Advanced (HSK 4+)
- **Focus**: Sophisticated and specialized vocabulary
- **Topics**: Business, academic, cultural, technical terms
- **Card Count**: ~500 cards
- **Best for**: Advanced learners nearing fluency

### How SRS Prioritizes Cards

The Spaced Repetition System uses a scoring algorithm that considers:

1. **New Cards** (Weight: 5.0): Unstudied cards get highest priority
2. **Error Rate** (Weight: 3.0): Cards you often get wrong appear more frequently
3. **Days Since Review** (Weight: 0.25): Cards not reviewed recently get priority
4. **Random Factor** (ε ∈ [0, 0.01)): Small randomness prevents predictability

**Formula**: `Score = 5.0 × isNew + 3.0 × errorRate + 0.25 × daysSince + ε`

The card with the highest score is shown next, ensuring optimal learning efficiency.

---

## Learning Tips

### Effective Study Habits

#### Consistency Over Intensity
- **Daily Practice**: 15-20 minutes daily is better than 2 hours weekly
- **Regular Schedule**: Study at the same time each day for habit formation
- **Small Sessions**: Break long study sessions into smaller chunks

#### Active Recall
- **Think Before Flipping**: Try to recall the answer before revealing it
- **Be Honest**: Mark cards incorrect if you had any hesitation
- **Review Mistakes**: Pay extra attention to cards you get wrong

#### Direction Balance
- **Practice Both Directions**: Alternate between CH→EN and EN→CH
- **Different Skills**: Each direction develops different language abilities
- **Weakness Focus**: Spend more time on your weaker direction

### Using Statistics Effectively

#### Monitor Progress
- **Check Histogram**: Look for patterns in your accuracy distribution
- **Review Worst Cards**: Focus extra practice on your bottom 10 cards
- **Celebrate Improvement**: Watch your accuracy improve over time

#### Identify Problem Areas
- **Low Accuracy Buckets**: If many cards fall in 0-40% accuracy, review fundamentals
- **Stagnant Progress**: If accuracy isn't improving, try changing study methods
- **Deck Balance**: Ensure you're making progress across all active decks

### Advanced Strategies

#### Star System
- **Mark Difficult Cards**: Use ⭐️ to flag challenging vocabulary

#### Ignore Feature
- **Temporary Breaks**: Use 🚫 to hide cards that are frustrating you
- **Topic Focus**: Ignore cards from completed topics to focus on new material
- **Recovery**: Un-ignore cards when you're ready to try again

#### Search for Review
- **Pattern Recognition**: Search for similar characters or words
- **Thematic Study**: Find all cards related to a specific topic
- **Error Analysis**: Search for cards you frequently get wrong

---

## Troubleshooting

### Common Issues

#### App Won't Load
**Problem**: Blank page or error messages
**Solutions**:
- Check that you're using `http://localhost:8000`
- Ensure JavaScript is enabled in your browser
- Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for error messages

#### Deck Loading Errors
**Problem**: "Failed to load deck" message
**Solutions**:
- Click the "Retry" button in the error banner
- Check your internet connection
- Try selecting a different deck
- Clear browser cache and reload

#### Statistics Not Saving
**Problem**: Progress resets after closing browser
**Solutions**:
- Ensure browser allows localStorage/cookies
- Check browser settings for local storage permissions
- Try using a different browser
- Avoid private/incognito browsing modes

#### Keyboard Shortcuts Not Working
**Problem**: Keyboard commands don't respond
**Solutions**:
- Click anywhere on the page to ensure it has focus
- Check that caps lock is off
- Try refreshing the page
- Ensure no other application is capturing keyboard input

### Browser Compatibility

#### Supported Browsers
- **Chrome**: Version 90+ (recommended)
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

#### Mobile Browsers
- **iOS Safari**: Full support
- **Chrome Mobile**: Full support
- **Samsung Internet**: Full support
- **Firefox Mobile**: Full support

#### Known Issues
- **Internet Explorer**: Not supported
- **Older Browser Versions**: May have rendering issues
- **Some Mobile Keyboards**: May interfere with keyboard shortcuts

### Performance Issues

#### Slow Loading
**Causes**: Large decks, slow network connection
**Solutions**:
- Wait for initial deck loading (can take up to 2 seconds)
- Check internet connection speed
- Close other browser tabs to free memory
- Try a different browser if issues persist

#### Laggy Interactions
**Causes**: Low memory, old device, many background tabs
**Solutions**:
- Close unnecessary browser tabs
- Restart browser if memory usage is high
- Ensure device meets minimum requirements
- Try using the app on a more powerful device

### Data Recovery

#### Lost Progress
**If your statistics disappear**:
- Check if you're using the same browser and device
- Verify browser hasn't been cleared recently
- Try selecting the same deck and direction
- Statistics are stored locally and cannot be recovered if permanently deleted

#### Backup Recommendations
- **Screenshot Statistics**: Take screenshots of important progress milestones
- **Browser Sync**: Enable browser sync if available
- **Regular Use**: Consistent practice prevents data loss concerns

### Getting Help

#### Self-Service Resources
- **This User Guide**: Comprehensive documentation for all features
- **In-App Interface**: Most features are self-explanatory with clear labels
- **Browser Developer Tools**: Check console for technical error messages

#### Technical Support
If you encounter persistent issues:
1. **Note the Error**: Write down any error messages
2. **Describe the Problem**: Include what you were trying to do
3. **Specify Environment**: Browser, device, and operating system
4. **Check Updates**: Ensure your browser is up to date

---

## Quick Reference Summary

### Essential Actions
- **Start**: Open app → Select deck → Begin reviewing
- **Study**: View card → Think → Space to flip → Mark answer
- **Navigate**: Use tabs to switch between Review, Search, and Stats
- **Track**: Check Statistics regularly to monitor progress

### Most Used Shortcuts
- `Space`: Flip card
- `→`: Correct
- `←`: Incorrect
- `Tab`: Navigate

### Best Practices
- Study daily for 15-20 minutes
- Practice both directions (CH→EN and EN→CH)
- Be honest when marking answers
- Review your worst-performing cards regularly
- Use star/ignore features strategically

---

*This user guide covers all aspects of TM-Flash. For technical details about data storage, custom deck creation, or advanced configuration, see the separate TECHNICAL-NOTES.md file.*