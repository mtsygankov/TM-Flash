# TM-Flash: Chinese Vocabulary Flashcard System
## Overview
TM-Flash is a lightweight, browser-based spaced repetition flashcard application designed for Chinese language learners. Built entirely with vanilla JavaScript, HTML5, and CSS3, it runs completely client-side with no backend dependencies, storing all user progress in localStorage.

## Main Objectives
Provide efficient Chinese vocabulary memorization through spaced repetition
Support multiple learning approaches (character recognition, listening, production, pronunciation)
Track detailed progress statistics while maintaining simplicity and performance
Enable offline-capable learning with zero installation requirements
## Key Features
Four Learning Modes: Hanzi First (character recognition), Listening (audio comprehension), Meaning to Chinese (active production), Pronunciation (tone training)
Smart SRS Algorithm: Adaptive review scheduling based on accuracy, streaks, and recency
Multiple Decks: Pre-built vocabulary sets including HSK 1-3 official content with dynamic configuration
Advanced search: Search by hanzi/pinyin/English
Advanced Filtering: filter by HSK level (when present in the deck) and tags
Statistics Dashboard: Detailed charts showing accuracy trends, due timelines, and performance metrics
Responsive Design: Optimized for desktop and mobile with hamburger menu modal interface
Configurable Settings: Toggle options including "Show pinyin on open card" for customized learning experience
Extensive Audio Support: Pronunciation playback with hashed filename storage for efficient caching
## Technologies
Frontend: Vanilla JavaScript (ES6+), HTML5, CSS3
Data Storage: Browser localStorage with schema versioning
Visualization: Chart.js for statistics rendering
Architecture: Modular design with strict script loading order
No Dependencies: Zero npm packages, frameworks, or build tools
## Significance
TM-Flash demonstrates that effective language learning tools can be built without complex frameworks, achieving fast load times (<2s for 1000 cards) and full offline functionality. The modular architecture and detailed documentation make it suitable for educational purposes and further extension (e.g., cloud sync via Firebase).

## Additional Documentation
- [TECHNICAL-NOTES.md](TECHNICAL-NOTES.md) - Detailed technical specifications and implementation notes
- [USER-GUIDE.md](USER-GUIDE.md) - Comprehensive user guidance and troubleshooting