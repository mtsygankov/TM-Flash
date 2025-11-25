# TM-Flash User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Installation and Setup](#installation-and-setup)
3. [Getting Started](#getting-started)
4. [Usage Guide](#usage-guide)
5. [Features Overview](#features-overview)
6. [Troubleshooting](#troubleshooting)
7. [Frequently Asked Questions](#frequently-asked-questions)
8. [Support](#support)

---

## Introduction

TM-Flash is a web-based Chinese language learning flashcard application that uses spaced repetition system (SRS) to help you efficiently memorize Chinese vocabulary. The app runs entirely in your browser and requires no installation or internet connection after initial setup.

### Key Features
- **Spaced Repetition Algorithm**: Intelligently schedules card reviews based on your performance
- **Multiple Decks**: Access to various Chinese vocabulary decks (Basic Words, Expressions, HSK content)
- **Multiple Learning Modes**: Study with different approaches including Hanzi first, meaning to Chinese, listening, and pronunciation
- **Audio Support**: Pronunciation audio for many cards
- **Statistics Tracking**: Detailed progress and performance analytics
- **Search and Filtering**: Find specific cards quickly
- **Dark/Light Theme**: Customizable interface

### How Spaced Repetition Works
Spaced repetition is a learning technique that shows you information at increasing intervals based on how well you remember it. Cards you know well are shown less frequently, while difficult cards are reviewed more often. This optimizes your study time and improves long-term retention.

For technical details about the SRS algorithm, see [TECHNICAL-NOTES.md](TECHNICAL-NOTES.md#spaced-repetition-algorithm-implementation).

---

## Installation and Setup

### System Requirements
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- No additional software required
- Internet connection only needed for initial deck loading

### Quick Start
1. **Download the TM-Flash files** to your computer
2. **Open `index.html`** directly in your browser, or
3. **Use a local web server** for better performance:
   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000

   # Node.js
   npx serve . -p 8000

   # PHP
   php -S localhost:8000
   ```
4. **Navigate to `http://localhost:8000`** in your browser
5. **Select a deck** and start learning!

### Available Decks
- **Deck A**: Basic Words (TM-Level1) - Fundamental Chinese vocabulary
- **Deck B**: Expressions - Common Chinese phrases and expressions
- **Deck C**: HSK Content - Structured HSK vocabulary with levels and categories
- **Deck D**: Advanced HSK6 - High-level Chinese vocabulary

---

## Getting Started

### First Time Setup
1. Open TM-Flash in your browser
2. The app will automatically load available decks
3. Click on a deck name to select it
4. Choose your preferred learning mode (Hanzi First, Meaning to Chinese, Listening, Pronunciation)
5. Start your first review session

### Interface Overview
- **Deck Selector**: Choose which vocabulary deck to study
- **Review Area**: Main study interface showing cards
- **Progress Bar**: Visual indicator of session progress
- **Statistics Panel**: Performance metrics and charts
- **Settings Menu**: Hamburger menu (≡) for configuration options

---

## Usage Guide

### Basic Review Process
1. **Card Presentation**: A Chinese word/phrase appears
2. **Reveal Answer**: Press `Space` or click "Show Answer" to flip the card
3. **Rate Your Knowledge**:
   - `←` (Left Arrow) or click "Incorrect" for cards you got wrong
   - `→` (Right Arrow) or click "Correct" for cards you knew

### Keyboard Shortcuts
- `Space`: Flip card to reveal answer
- `←` (Left Arrow): Mark as incorrect/difficult
- `→` (Right Arrow): Mark as correct/easy
- `H`: Open/close settings menu
- `S`: Toggle between learning modes
- `P`: Toggle progress display

### Learning Modes
- **Hanzi First (LM-hanzi-first)**: See Chinese characters, recall English meaning
- **Meaning to Chinese (LM-meaning-to-chinese)**: See English definition, recall Chinese characters
- **Listening (LM-listening)**: Audio-based learning mode
- **Pronunciation (LM-pronunciation)**: Pronunciation practice mode

### Session Management
- Reviews continue until you complete the scheduled cards for the day
- New cards are introduced gradually
- Difficult cards are reviewed more frequently
- Easy cards appear less often

### Audio Playback
- Click the speaker icon (🔊) to hear pronunciation
- Audio is available for most cards in supported decks
- Works offline once loaded

---

## Features Overview

### Deck Management
- Switch between different vocabulary decks
- Each deck maintains separate statistics
- Progress is preserved when switching decks

### Statistics and Progress Tracking
- **Session Statistics**: Cards reviewed, accuracy rate, time spent
- **Long-term Analytics**: Charts showing learning progress over time
- **Per-Card History**: Individual card performance tracking
- **Streak Information**: Current correct/incorrect streaks

### Search and Filtering
- **Real-time Search**: Type to find cards by Chinese characters, Pinyin, or English
- **HSK Level Filtering**: Filter by HSK proficiency levels (Deck C)
- **Category Filtering**: Filter by vocabulary categories (Deck C)

### Settings and Customization
- **Theme Toggle**: Switch between light and dark modes
- **Mode Toggle**: Change learning mode mid-session
- **Progress Display**: Show/hide progress indicators
- **Sound Effects**: Enable/disable audio feedback

### Data Management
- All progress stored locally in your browser
- No account required
- Data persists between sessions
- Export/import capabilities through browser developer tools

---

## Troubleshooting

### Common Issues

#### Deck Loading Failures
**Problem**: Decks don't load or show error messages
**Solutions**:
- Ensure you're using a local web server (not opening index.html directly)
- Check browser console for error messages
- Verify deck files exist in the `decks/` folder
- Try refreshing the page

#### Audio Not Playing
**Problem**: Pronunciation audio doesn't work
**Solutions**:
- Check browser permissions for audio playback
- Ensure audio files exist in deck subdirectories
- Try different browsers (Chrome recommended)
- Check volume settings

#### Data Corruption or Loss
**Problem**: Statistics or progress data is lost
**Solutions**:
- Data is stored in browser localStorage
- Clear browser cache only if necessary (will reset all progress)
- Use browser developer tools to inspect localStorage
- Export data before clearing cache

#### Slow Performance
**Problem**: App feels sluggish or unresponsive
**Solutions**:
- Use a modern browser (Chrome, Firefox, Safari, Edge)
- Close other browser tabs
- Clear browser cache
- For large decks, consider using a faster computer

#### Cards Not Appearing
**Problem**: No cards show up for review
**Solutions**:
- Check if you've completed all scheduled reviews
- Switch learning modes
- Verify deck selection
- Check browser console for errors

#### Keyboard Shortcuts Not Working
**Problem**: Arrow keys and spacebar don't respond
**Solutions**:
- Ensure the review area has focus (click on it)
- Try using mouse clicks instead
- Check for browser extensions interfering
- Refresh the page

### Browser Compatibility
- **Recommended**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Minimum**: Any modern browser with ES6 support
- **Not Supported**: Internet Explorer, very old browser versions

### Performance Tips
- Use Chrome for best performance
- Keep only one TM-Flash tab open
- Close other resource-intensive applications
- For large decks (>1000 cards), expect longer initial load times

---

## Frequently Asked Questions

### How does the SRS algorithm work?
The spaced repetition system schedules card reviews based on your performance. Cards you know well are shown less frequently (every few days or weeks), while difficult cards are reviewed more often. This scientific approach optimizes your study time and improves long-term retention.

For detailed algorithm information, see [TECHNICAL-NOTES.md](TECHNICAL-NOTES.md#spaced-repetition-algorithm-implementation).

### Where is my data stored?
All progress data is stored locally in your browser's localStorage. No data is sent to external servers. Your learning statistics persist between sessions but are tied to your browser and computer.

### Can I use TM-Flash offline?
Yes! Once you've loaded the decks initially, TM-Flash works completely offline. All data is stored locally in your browser.

### How many cards should I review per day?
The app automatically schedules cards based on the SRS algorithm. Typically, you'll review 20-50 cards per session, depending on your deck size and learning pace. New cards are introduced gradually.

### Can I reset my progress?
Yes, but this requires clearing browser data:
1. Open browser developer tools (F12)
2. Go to Application/Storage > Local Storage
3. Delete the "tmFlash" entry
4. Refresh the page

**Warning**: This will permanently delete all your progress data.

### Why do some cards have audio and others don't?
Audio pronunciation is available for cards where audio files were included with the deck. Not all decks have complete audio coverage. Audio files are stored in subdirectories like `decks/deck_a_audio/`.

### Can I add my own decks?
Currently, TM-Flash uses pre-configured decks. Custom deck creation would require modifying the source code. See [TECHNICAL-NOTES.md](TECHNICAL-NOTES.md#data-structures) for deck format specifications.

### What's the difference between decks?
- **Deck A**: Basic vocabulary for beginners
- **Deck B**: Common expressions and phrases
- **Deck C**: Structured HSK vocabulary with levels and categories
- **Deck D**: Advanced HSK6 content

### How do I change the learning mode?
Use the settings menu (hamburger icon ≡) to toggle between the available learning modes. You can change this mid-session.

### Why do I see the same cards repeatedly?
This is normal SRS behavior. Difficult cards are shown more frequently to reinforce learning. As you improve, these cards will appear less often.

### Can I use TM-Flash on mobile devices?
Yes, TM-Flash works on mobile browsers, but the desktop experience is optimized. Touch controls replace keyboard shortcuts on mobile devices.

### How do I export my statistics?
Use browser developer tools to access localStorage data:
1. Press F12 to open developer tools
2. Go to Application > Local Storage
3. Find the "tmFlash" key
4. Copy the JSON data

### What's the difference between "Correct" and "Incorrect"?
- **Correct**: You knew the answer (card schedules for later review)
- **Incorrect**: You didn't know the answer (card schedules for sooner review)

### Can I study multiple decks at once?
No, you can only study one deck at a time. Switch between decks using the deck selector, but progress is tracked separately for each deck.

---

## Support

### Getting Help
If you encounter issues not covered in this guide:

1. **Check the troubleshooting section** above
2. **Review TECHNICAL-NOTES.md** for advanced technical information
3. **Check browser console** for error messages (press F12)
4. **Try a different browser** (Chrome recommended)

### Technical Support
- **Browser Console**: Press F12 and check the Console tab for error messages
- **localStorage Inspection**: Use developer tools to examine stored data
- **Network Tab**: Monitor deck loading and resource requests

### Contributing
TM-Flash is an open-source project. For technical contributions or bug reports, refer to the project repository documentation.

### Version Information
This guide covers TM-Flash with localStorage schema version 3. Check the browser console for current version information.

---

*For technical implementation details, architecture information, and development notes, see [TECHNICAL-NOTES.md](TECHNICAL-NOTES.md).*