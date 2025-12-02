# TM-Flash Technical Notes

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core Functionalities](#core-functionalities)
3. [Data Structures](#data-structures)
4. [SRS Algorithm Implementation](#srs-algorithm-implementation)
5. [Potential Issues and Improvements](#potential-issues-and-improvements)
6. [Maintenance Notes](#maintenance-notes)

---

## Architecture Overview

### Technology Stack

TM-Flash is a pure web application built with vanilla HTML5, CSS3, and ES6+ JavaScript, intentionally avoiding frameworks to maintain minimal dependencies and optimal performance. The application runs entirely client-side with no server components, using browser localStorage for data persistence.

### Application Structure

The codebase follows a modular architecture with clear separation of concerns:

- **Entry Point**: `index.html` serves as the single-page application container
- **Core Modules**: Storage, Settings, Constants provide foundational services
- **Data Layer**: DeckLoader, Validator, Stats, SRS handle data management and algorithms
- **UI Layer**: Nav, StatsView, DeckSelector, Review, Search manage user interactions
- **Utilities**: Message, Normalizer, Chart provide supporting functionality

### Data Flow Architecture

```
JSON Decks (decks/*.json) → DeckLoader.fetch() → Memory Cache → SRS Algorithm → Review UI
                                      ↓
localStorage (tmFlash key) ← Storage Module ← Stats Module ← User Interactions
```

The application implements a session-based caching strategy where decks are loaded once per session and kept in memory, with statistics persisted to localStorage immediately after each review.

### Module Loading Strategy

Critical script loading order is maintained in `index.html`:
1. `chart.js` - Chart.js library for statistics visualization
2. `configloader.js` - Loads deck configuration from config.json
3. `constants.js` - Global constants and deck registry
4. `storage.js` - localStorage management
5. `stats.js` - Statistics calculations
6. `srs.js` - Spaced repetition algorithm
7. `message.js` - User messaging system
8. `normalizer.js` - Pinyin normalization utilities
9. `validator.js` - Deck data validation
10. `deckloader.js` - Deck loading and validation
11. `deckselector.js` - Deck selection UI
12. `settings.js` - User settings
13. `review.js` - Review interface
14. `statsview.js` - Statistics visualization
15. `search.js` - Search functionality
16. `filters.js` - Card filtering logic
17. `modal.js` - Settings modal management
18. `nav.js` - Navigation
19. `start.js` - Start screen management
20. `app.js` - Main application coordinator

---

## Core Functionalities

### Deck Management
- **Dynamic Configuration**: `configloader.js` enables runtime deck configuration via `decks/config.json` with enable/disable flags for deck management
- **Validation**: `validator.js` ensures deck JSON integrity with token matching and format validation
- **Loading**: `deckloader.js` implements HTTP fetching with timeout handling and error recovery
- **Selection**: `deckselector.js` manages deck switching with stats synchronization
- **Audio Support**: Pronunciation audio files stored in deck subdirectories with hashed filenames (e.g., `word_-45950099734855537.mp3`) for efficient caching

### Review System
- **Card Presentation**: `review.js` handles flip mechanics, keyboard/touch interactions, and progress tracking
- **Mode Support**: Four learning modes (LM-hanzi-first, LM-meaning-to-chinese, LM-listening, LM-pronunciation)
- **Audio Integration**: Pronunciation playback for supported cards
- **Progress Visualization**: Real-time progress bar and session statistics

### Statistics & Analytics
- **Per-Card Tracking**: Separate statistics for each learning mode
- **Streak Analysis**: Correct/incorrect streak lengths and timestamps
- **Visualization**: Chart.js integration for timeline and distribution charts
- **Export Capability**: Data accessible via browser developer tools

### Search & Filtering
- **Real-time Search**: Pinyin and English text matching with normalization
- **Tag-based Filtering**: HSK level and category filtering for deck_c
- **Audio Links**: Integration with external dictionary services

### Settings Management
- **Modal Interface**: Hamburger menu consolidates all settings
- **Theme Support**: Light/dark mode via CSS custom properties
- **Mode Toggle**: Runtime switching between learning modes
- **Progress Controls**: Show/hide progress indicators

---

## Data Structures

### Deck JSON Schema

```json
{
  "type": "word|expression|hsk13",
  "deck_name": "string",
  "created_at": "ISO timestamp",
  "version": "string",
  "description": "string",
  "tag_definitions": {"tag": "description"}, // deck_c only
  "audio_path": "string", // relative path
  "cards": [
    {
      "card_id": "unique_string",
      "hanzi": "space_separated_characters",
      "pinyin": "space_separated_pinyin",
      "tones": "digit_string",
      "def": "english_definition",
      "def_words": ["word", "array"],
      "pos": "part_of_speech", // deck_c only
      "hsk": "HSK_level", // deck_c only
      "tags": ["tag_array"] // deck_c only
    }
  ]
}
```

### localStorage Schema (schema_version=4)

```json
{
  "schema_version": 4,
  "settings": {
   "mode": "LM-hanzi-first|LM-meaning-to-chinese|LM-listening|LM-pronunciation",
   "selected_deck": "deck_id",
   "theme": "light",
   "showProgress": boolean,
   "showPinyin": boolean
  },
  "decks": {
    "deck_id": {
      "cards": {
        "card_id": {
          "LM-hanzi-first|LM-meaning-to-chinese|LM-listening|LM-pronunciation": {
            "total_correct": number,
            "total_incorrect": number,
            "last_correct_at": timestamp_ms,
            "last_incorrect_at": timestamp_ms,
            "correct_streak_len": number,
            "incorrect_streak_len": number,
            "correct_streak_started_at": timestamp_ms,
            "incorrect_streak_started_at": timestamp_ms
          }
        }
      }
    }
  }
}
```

### In-Memory Structures
- **Deck Cache**: Map-based storage for loaded decks
- **Card Array**: Ordered collection for SRS selection
- **Stats Map**: Fast lookup by card ID and mode
- **Settings Object**: Runtime configuration state

---

## SRS Algorithm Implementation

### Core Algorithm (srs.js)

The spaced repetition system uses a priority-based card selection algorithm with configurable intervals and modifiers.

#### Interval Calculation

```javascript
const BASE_INTERVALS = [0.5, 4, 24, 72, 168, 336, 720, 1440]; // hours: 30min to 60 days
const MODIFIERS = {
  accuracy: { high: 1.3, medium: 1.0, low: 0.4 },
  streak: { positive: 1.1, negative: 0.5 },
  recency: { recent: 0.3, old: 1.0 }
};
```

#### Card Scoring Logic

```javascript
function scoreCard(stats, now = Date.now()) {
  const accuracy = stats.total_correct / (stats.total_correct + stats.total_incorrect);
  const daysSinceLastReview = (now - stats.last_reviewed) / (1000 * 60 * 60 * 24);

  let score = BASE_SCORE;
  score *= getAccuracyModifier(accuracy);
  score *= getStreakModifier(stats.correct_streak_len, stats.incorrect_streak_len);
  score *= getRecencyModifier(daysSinceLastReview);

  return Math.max(0, Math.min(MAX_SCORE, score));
}
```

#### Selection Priority

1. **New Cards**: Never reviewed cards get highest priority
2. **Failed Cards**: Recently incorrect cards prioritized
3. **Overdue Cards**: Cards past their optimal review interval
4. **Low Accuracy**: Cards with poor performance history
5. **Random Selection**: Tie-breaking for equal-priority cards

#### Edge Cases Handled

- **First Review**: New cards assigned base interval
- **Perfect Streaks**: Exponential interval growth
- **Consistent Failure**: Reduced intervals for difficult cards
- **Long Breaks**: Recency penalties for inactive periods

---

## Potential Issues and Improvements

### Security Concerns
- **XSS Prevention**: Uses `textContent` instead of `innerHTML` for user data rendering
- **Input Sanitization**: All inputs trimmed but no comprehensive validation
- **Same-Origin Policy**: Deck files must be same-origin; no external deck support
- **localStorage Limits**: 5-10MB typical limit could be exceeded with large datasets
- **No CSP**: Missing Content Security Policy headers

### Performance Bottlenecks
- **Deck Loading**: Large decks (>1000 cards) cause initial load delays
- **SRS Calculation**: O(n) complexity for card selection on large decks
- **DOM Manipulation**: Potential layout thrashing during card transitions
- **Memory Usage**: In-memory deck cache grows with multiple loaded decks
- **localStorage Sync**: Synchronous operations block UI during saves

### Potential Bugs
- **Race Conditions**: Async deck loading without proper state management
- **Memory Leaks**: Event listeners not cleaned up on deck switches
- **State Inconsistency**: Settings changes may not propagate immediately
- **Audio Loading**: Missing error handling for failed audio file loads
- **Touch Events**: Potential conflicts between touch and mouse event handlers

### Browser Compatibility Issues
- **ES6+ Features**: Arrow functions, const/let, Map/Set require modern browsers
- **Fetch API**: Older browsers need polyfills
- **CSS Grid/Flexbox**: Limited support in IE11 and older mobile browsers
- **localStorage**: May be disabled in private browsing or restricted environments

### Data Integrity Issues
- **Schema Migration**: No migration path for schema version changes
- **Validation Gaps**: Deck validation doesn't check for duplicate card_ids
- **Stats Corruption**: No checksums or validation for stored statistics
- **Concurrent Access**: No handling of multiple tabs/windows accessing same data

### Areas for Improvement

#### Architecture Enhancements
- **Service Worker**: Implement PWA features for offline deck caching
- **Web Workers**: Move SRS calculations off main thread for large decks
- **IndexedDB**: Replace localStorage with IndexedDB for larger datasets
- **Module Bundling**: Consider ES modules for better tree-shaking and loading

#### User Experience Improvements
- **Progressive Loading**: Load decks incrementally to reduce initial load time
- **Offline Indicators**: Show offline status and sync progress
- **Error Recovery**: Better error messages and recovery options
- **Accessibility**: Enhanced screen reader support and keyboard navigation
- **Mobile Optimization**: Touch gesture improvements and mobile-specific UI

#### Performance Optimizations
- **Virtual Scrolling**: For very large decks (>2000 cards)
- **Lazy Loading**: Load audio files on demand
- **Compression**: Compress deck JSON files
- **Caching Strategy**: Implement HTTP caching headers for deck files
- **Memory Management**: Clear unused deck data from memory

#### Feature Additions
- **Cloud Sync**: Implement Firebase/Firestore for cross-device synchronization
- **Custom Decks**: Enhanced deck creation tools and validation
- **Advanced Statistics**: More detailed learning analytics and progress tracking
- **Gamification**: Achievement system and learning streaks
- **Multi-language**: Support for additional language pairs

#### Code Quality Improvements
- **TypeScript Migration**: Add type safety and better IDE support
- **Testing Framework**: Implement unit and integration tests
- **Error Monitoring**: Add client-side error tracking and reporting
- **Documentation**: Expand API documentation and code comments
- **Code Splitting**: Split large modules for better loading performance

#### Security Enhancements
- **CSP Implementation**: Add Content Security Policy headers
- **Input Validation**: Comprehensive input sanitization and validation
- **HTTPS Enforcement**: Require secure connections for deck loading
- **Data Encryption**: Encrypt sensitive user data in storage
- **Audit Logging**: Track user actions for security monitoring

---

## Maintenance Notes

### Setup Instructions

#### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Local web server for development (Python, Node.js, or PHP)
- No additional dependencies required

#### Development Setup
1. Clone or download the TM-Flash project files
2. Start a local HTTP server in the project root:
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
3. Open `http://localhost:8000` in your browser
4. The application loads automatically with default deck configuration

#### Dependencies
- **None**: Pure vanilla JavaScript, HTML5, CSS3
- **Browser APIs**: localStorage, Fetch API, ES6+ features
- **Optional**: Chart.js for statistics visualization (included)

### Development Workflow

#### Code Organization
- Follow the established module loading order in `index.html`
- Maintain separation of concerns across modules
- Use consistent naming conventions (camelCase for JS, kebab-case for CSS)
- Add JSDoc comments for public functions

#### Testing
- Manual browser testing for all features
- Cross-browser compatibility testing
- Performance testing with browser dev tools
- Accessibility testing with screen readers

#### Debugging
- Use browser console for detailed logging from SRS and Review modules
- Inspect localStorage via `localStorage.getItem('tmFlash')`
- Monitor network tab for deck loading behavior
- Profile performance in browser dev tools

### Deployment
- **Static Hosting**: Deploy to any static web server (GitHub Pages, Netlify, etc.)
- **No Build Process**: Files served directly without compilation
- **Caching**: Implement appropriate HTTP caching headers for deck files
- **HTTPS**: Recommended for security, especially with CSP

### Version Control
- All development work in `main` branch
- Atomic commits following workboard ticket completion
- Include ticket IDs in commit messages (e.g., "W-001: Project Skeleton")

### Monitoring and Support
- **Error Handling**: Graceful degradation with user-friendly error banners
- **Performance Monitoring**: Use browser dev tools for load times and memory usage
- **User Feedback**: Monitor console logs for debugging information
- **Updates**: No automatic updates; users refresh browser for new versions

### Future Maintenance Tasks
- Monitor browser compatibility as new versions release
- Update deck schemas as needed for new features
- Optimize performance for larger decks
- Enhance accessibility features
- Consider PWA implementation for offline capabilities

---

*This technical documentation is intended for developers, advanced users, and those who want to understand the internal workings of TM-Flash. For user-facing documentation, see [USER-GUIDE.md](USER-GUIDE.md).*