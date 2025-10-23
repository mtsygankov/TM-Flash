# TM-Flash Technical Notes

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Data Storage Schema](#data-storage-schema)
3. [Custom Deck Creation](#custom-deck-creation)
4. [Offline Capabilities](#offline-capabilities)
5. [Performance Considerations](#performance-considerations)
6. [Security & Privacy](#security--privacy)
7. [Browser Compatibility Details](#browser-compatibility-details)
8. [Development & Debugging](#development--debugging)

---

## Architecture Overview

### Technology Stack

TM-Flash is built using pure web technologies without external dependencies:

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser localStorage API
- **Data Format**: JSON for deck files
- **No Frameworks**: Intentionally lightweight and dependency-free
- **No Build Process**: Direct file serving, no compilation needed

### File Structure

```
tm-flash/
├── index.html          # Main application entry point
├── styles.css          # All application styles
├── app.js             # Main application controller
├── constants.js       # Global constants and configuration
├── storage.js         # LocalStorage management
├── stats.js           # Statistics calculations
├── srs.js             # Spaced Repetition System algorithm
├── message.js         # User messaging system
├── normalizer.js      # Text normalization utilities
├── validator.js       # Deck data validation
├── deckloader.js      # Deck loading and caching
├── deckselector.js    # Deck selection UI
├── settings.js        # Application settings management
├── review.js          # Review mode logic
├── statsview.js       # Statistics view rendering
├── search.js          # Search functionality
├── nav.js             # Navigation between views
├── chart.js           # Chart rendering utilities
└── decks/             # Deck data files
    ├── deck_a.json
    ├── deck_b.json
    ├── deck_c.json
    └── deck_d.json
```

### Module Architecture

The application follows a modular architecture with clear separation of concerns:

- **Core Modules**: Storage, Settings, Constants
- **Data Modules**: DeckLoader, Validator, Normalizer, Stats
- **Logic Modules**: SRS, Review, Search
- **UI Modules**: Nav, StatsView, DeckSelector, Message
- **Utilities**: Chart, Message

Each module is self-contained with minimal dependencies, making the codebase maintainable and testable.

---

## Data Storage Schema

### LocalStorage Structure

All application data is stored in browser localStorage under the key `tmFlash`:

```json
{
  "schema_version": 1,
  "settings": {
    "direction": "CH->EN",
    "selected_deck": "deck_a",
    "theme": "light"
  },
  "decks": {
    "deck_a": {
      "cards": {
        "card_id_001": {
          "directions": {
            "CH->EN": {
              "correct": 5,
              "incorrect": 1,
              "last_reviewed": 1694726400000
            },
            "EN->CH": {
              "correct": 3,
              "incorrect": 2,
              "last_reviewed": 1694726400000
            }
          }
        }
      },
      "meta_cache": {
        "last_loaded": 1694726400000,
        "deck_name": "Deck A"
      }
    },
    "deck_b": {
      "cards": {},
      "meta_cache": {}
    },
    "deck_c": {
      "cards": {},
      "meta_cache": {}
    },
    "deck_d": {
      "cards": {},
      "meta_cache": {}
    }
  }
}
```

### Schema Versioning

- **Current Version**: 1
- **Migration Strategy**: Schema version allows for future data migrations
- **Backward Compatibility**: New versions must handle older schemas gracefully

### Data Types

#### Settings
- `direction`: String, values "CH->EN" or "EN->CH"
- `selected_deck`: String, deck identifier ("deck_a", "deck_b", etc.)
- `theme`: String, currently only "light" supported

#### Card Statistics
- `correct`: Number, count of correct answers
- `incorrect`: Number, count of incorrect answers
- `last_reviewed`: Number, Unix timestamp in milliseconds, null if never reviewed

#### Meta Cache
- `last_loaded`: Number, Unix timestamp when deck was last loaded
- `deck_name`: String, human-readable deck name from deck metadata

### Data Validation

The application validates all data before storage:
- **Type Checking**: Ensures data types match expected schema
- **Range Validation**: Verifies counts are non-negative integers
- **Timestamp Validation**: Checks timestamps are valid Unix times
- **Structure Validation**: Ensures required fields exist

---

## Custom Deck Creation

### Deck JSON Schema

Custom decks must follow this exact schema:

```json
{
  "type": "word",
  "deck_name": "Custom Deck Name",
  "created_at": "2025-01-01T00:00:00.000000",
  "version": "2",
  "description": "Optional deck description",
  "cards": [
    {
      "card_id": "unique_card_identifier",
      "hanzi": "我 要 咖啡",
      "pinyin": "wǒ yào kāfēi",
      "en_words": ["I", "want", "coffee"],
      "english": "I want coffee"
    }
  ]
}
```

### Required Fields

#### Metadata
- `type`: String, must be "word"
- `deck_name`: String, human-readable name
- `created_at`: String, ISO 8601 timestamp
- `version`: String, deck format version

#### Card Fields
- `card_id`: String, unique within deck
- `hanzi`: String, space-separated Chinese characters
- `pinyin`: String, space-separated pinyin with tone marks
- `en_words`: Array of strings, individual English words
- `english`: String, complete English translation

### Validation Rules

#### Uniqueness
- `card_id` must be unique within each deck
- Duplicate IDs are skipped and logged as errors

#### Token Matching
- Token count must match exactly across `hanzi`, `pinyin`, and `en_words`
- Example: "我 要 咖啡" (3 tokens) = ["wǒ", "yào", "kāfēi"] (3 tokens) = ["I", "want", "coffee"] (3 tokens)

#### Format Requirements
- All strings are trimmed of leading/trailing whitespace
- `hanzi` and `pinyin` use single spaces as separators
- `en_words` is an array of individual words
- `english` is a complete sentence or phrase

### Creating Custom Decks

#### File Naming
- Use lowercase letters, numbers, and underscores only
- Example: `custom_hsk1.json`, `business_vocab.json`
- Place in the `decks/` directory

#### Deck Registration
To add a custom deck to the application:

1. **Create JSON file** following the schema above
2. **Add to DECKS registry** in `constants.js`:
```javascript
const DECKS = {
  // existing decks...
  custom_deck: { label: "Custom Deck", url: "./decks/custom_deck.json" }
};
```
3. **Update storage schema** in `storage.js` to include the new deck
4. **Test validation** by loading the deck and checking for errors

#### Best Practices
- **Keep decks focused**: Group related vocabulary together
- **Limit size**: Aim for 100-500 cards per deck for optimal performance
- **Quality over quantity**: Ensure accurate translations and pinyin
- **Test thoroughly**: Validate deck before distribution

---

## Offline Capabilities

### Current Offline Support

TM-Flash has limited offline capabilities:

#### What Works Offline
- **Application Interface**: All UI elements and interactions
- **Loaded Decks**: Decks cached in memory during the session
- **Statistics**: All progress tracking and storage
- **Search**: Real-time search within loaded decks

#### What Requires Internet
- **Initial Deck Loading**: First-time deck fetch from server
- **Deck Switching**: Loading a new deck not in memory cache
- **Application Updates**: New versions of the app files

### Session Caching

The application implements session-based caching:

```javascript
// In-memory deck cache
const deckCache = new Map();

// Cache strategy
- Load deck once per session
- Keep in memory until page refresh
- No persistent caching across sessions
```

### Future PWA Implementation

For full offline support, the application could be enhanced as a Progressive Web App:

#### Service Worker Strategy
```javascript
// Cache-first strategy for core assets
const CACHE_NAME = 'tm-flash-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  // ... other core files
];

// Network strategy for deck files
- Try network first
- Fall back to cache if offline
- Update cache when network available
```

#### Benefits of PWA
- **True Offline**: Complete functionality without internet
- **Faster Loading**: Cached resources load instantly
- **Installable**: Can be installed as a native app
- **Background Updates**: Automatic content updates

### Storage Limitations

#### localStorage Constraints
- **Size Limit**: Typically 5-10 MB per domain
- **Performance**: Synchronous operations can block UI
- **Security**: Accessible only to same-origin pages

#### Data Management
- **Efficient Storage**: Minimal data structure design
- **Cleanup**: Remove unused or old data
- **Compression**: Consider data compression for large decks

---

## Performance Considerations

### Target Performance Metrics

- **First Load**: < 2 seconds for ≤ 1000 cards on mid-tier mobile
- **Interaction Latency**: < 50ms for all user interactions
- **Memory Usage**: Efficient data structures, minimal garbage collection

### Optimization Strategies

#### Data Loading
```javascript
// Lazy loading approach
- Load only active deck
- Validate during loading, not after
- Cache parsed JSON in memory
- Use Web Workers for large datasets (future)
```

#### DOM Manipulation
```javascript
// Efficient rendering
- Minimize DOM updates
- Use document fragments
- Batch style changes
- Avoid layout thrashing
```

#### SRS Algorithm
```javascript
// Optimized scoring
- O(n) complexity for card selection
- Pre-computed where possible
- Minimal calculations per interaction
- Efficient tie-breaking
```

### Memory Management

#### Data Structures
- **Arrays**: For ordered collections (cards list)
- **Maps**: For fast lookup (card by ID)
- **Objects**: For structured data (statistics)
- **Primitives**: Prefer numbers/strings over objects

#### Garbage Collection
- **Minimize Object Creation**: Reuse objects where possible
- **Clear References**: Remove unused data references
- **Avoid Closures**: Be mindful of memory leaks in event handlers

### Performance Monitoring

#### Browser DevTools
- **Performance Tab**: Analyze runtime performance
- **Memory Tab**: Check for memory leaks
- **Network Tab**: Monitor deck loading times
- **Console**: Track any performance warnings

#### Key Metrics
- **Deck Loading Time**: Time from selection to ready
- **Card Rendering Time**: Time to display a card
- **SRS Calculation Time**: Time to select next card
- **Storage Operation Time**: Time for save/load operations

---

## Security & Privacy

### Data Security

#### Input Sanitization
```javascript
// Safe text rendering
- Use textContent instead of innerHTML
- Trim all user inputs
- Validate data types before storage
- Escape special characters when needed
```

#### File Access
- **Same-Origin Policy**: Only access files from same domain
- **No File System Access**: Cannot read arbitrary files
- **Validated Paths**: Deck URLs are whitelisted
- **No Executable Code**: JSON data only, no JavaScript

### Privacy Protection

#### Local Storage Only
- **No Server Communication**: All data stays on device
- **No Analytics**: No tracking or telemetry
- **No Personal Data**: No email, name, or identifiers collected
- **No Third-Party Scripts**: No external JavaScript libraries

#### Data Persistence
- **User Controlled**: Data persists only in user's browser
- **Clearable**: Users can clear data via browser settings
- **Exportable**: Data can be extracted via browser dev tools
- **Portable**: Works across devices and browsers

### Content Security Policy

#### Recommended CSP
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
              script-src 'self'; 
              style-src 'self' 'unsafe-inline'; 
              connect-src 'self';">
```

#### CSP Rationale
- **'self'**: Only allow resources from same origin
- **script-src 'self'**: No external JavaScript
- **style-src 'unsafe-inline'**: Allow inline styles for simplicity
- **connect-src 'self'**: Only allow deck file fetching

### Security Best Practices

#### Validation
- **Input Validation**: Validate all user inputs
- **Data Validation**: Validate deck JSON structure
- **Type Checking**: Ensure data types match expectations
- **Range Checking**: Verify numbers are in valid ranges

#### Error Handling
- **Graceful Degradation**: Handle errors without crashing
- **No Information Leakage**: Avoid exposing internal details
- **Safe Defaults**: Use secure default values
- **Recovery**: Allow recovery from error states

---

## Browser Compatibility Details

### Supported Browsers

#### Desktop Browsers
- **Chrome**: Version 90+ (recommended)
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

#### Mobile Browsers
- **iOS Safari**: Version 14+
- **Chrome Mobile**: Version 90+
- **Samsung Internet**: Version 14+
- **Firefox Mobile**: Version 88+

### Feature Requirements

#### JavaScript Features
- **ES6+**: Arrow functions, const/let, template literals
- **Fetch API**: For deck file loading
- **localStorage**: For data persistence
- **Map/Set**: Modern data structures
- **Promise**: Async operations

#### CSS Features
- **Flexbox**: Layout system
- **Grid**: Advanced layouts (limited use)
- **CSS Variables**: Custom properties
- **Media Queries**: Responsive design
- **Transforms**: Animations and transitions

#### HTML Features
- **Semantic Elements**: header, main, section, nav
- **ARIA Attributes**: Accessibility
- **Viewport Meta**: Mobile responsiveness
- **Custom Data Attributes**: data-* properties

### Compatibility Workarounds

#### Polyfills (if needed)
```javascript
// Fetch API polyfill for older browsers
if (!window.fetch) {
  // Load fetch polyfill
}

// Promise polyfill
if (!window.Promise) {
  // Load promise polyfill
}
```

#### Feature Detection
```javascript
// Check for required features
if (!window.localStorage) {
  // Show error message
  Message.error('localStorage is required');
}

if (!window.fetch) {
  // Fallback to XMLHttpRequest
}
```

### Known Limitations

#### Internet Explorer
- **Not Supported**: ES6+ features not available
- **Alternative**: Use modern browser or transpile code
- **Recommendation**: Upgrade to Microsoft Edge

#### Older Mobile Browsers
- **Performance**: May be slower on older devices
- **Memory**: Limited RAM may cause issues
- **Features**: Some ES6+ features may be missing

#### Enterprise Environments
- **CSP Restrictions**: May block localStorage
- **Proxy Settings**: May affect deck loading
- **Security Policies**: May limit functionality

---

## Development & Debugging

### Development Setup

#### Local Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if available)
npx serve . -p 8000

# PHP (if available)
php -S localhost:8000
```

#### File Watching
```bash
# Use file watcher for development
# (No build process required, but can watch for changes)
fswatch . | while read event; do
  echo "File changed: $event"
done
```

### Debugging Tools

#### Browser Console
```javascript
// Debug logging
console.log('Deck loaded:', deck);
console.error('Validation error:', error);
console.warn('Deprecated feature used');

// Performance timing
console.time('deck-loading');
// ... deck loading code
console.timeEnd('deck-loading');
```

#### Breakpoints
- **Source Panel**: Set breakpoints in JavaScript files
- **Conditional Breakpoints**: Break only when certain conditions met
- **Event Listener Breakpoints**: Break on specific events
- **DOM Breakpoints**: Break on DOM modifications

#### Network Monitoring
- **Deck Loading**: Monitor JSON file loading
- **Performance**: Check load times and file sizes
- **Errors**: Identify failed requests or timeouts
- **Caching**: Verify browser caching behavior

### Testing Strategies

#### Manual Testing
- **Functionality**: Test all features manually
- **Cross-browser**: Test in multiple browsers
- **Mobile**: Test on various mobile devices
- **Accessibility**: Test with screen readers

#### Unit Testing (Conceptual)
```javascript
// Example test structure (not implemented)
function testSRSAlgorithm() {
  const stats = { correct: 5, incorrect: 3, last_reviewed: Date.now() - 86400000 };
  const score = SRS.scoreCard(stats);
  console.assert(score > 0, 'Score should be positive');
}
```

#### Integration Testing
- **Deck Loading**: Test deck loading and validation
- **Statistics**: Test statistics calculation and display
- **Storage**: Test data persistence and retrieval
- **UI**: Test user interactions and state management

### Code Quality

#### JavaScript Standards
- **ESLint**: Use for code linting (if available)
- **JSDoc**: Document public functions
- **Consistent Style**: Follow established patterns
- **Error Handling**: Proper try/catch blocks

#### CSS Organization
- **Modular CSS**: Group related styles
- **Consistent Naming**: Use clear class names
- **Responsive Design**: Mobile-first approach
- **Performance**: Minimize reflows and repaints

#### HTML Structure
- **Semantic Markup**: Use appropriate HTML5 elements
- **Accessibility**: Include ARIA labels and roles
- **Validation**: Ensure valid HTML structure
- **Performance**: Optimize for fast rendering

### Common Debugging Scenarios

#### Deck Loading Issues
```javascript
// Check deck loading
DeckLoader.fetch('deck_a')
  .then(deck => console.log('Deck loaded:', deck))
  .catch(error => console.error('Load failed:', error));
```

#### Statistics Problems
```javascript
// Debug statistics
const stats = Stats.getCardStats('deck_a', 'card_001');
console.log('Card stats:', stats);
console.log('Direction stats:', stats.directions['CH->EN']);
```

#### Storage Issues
```javascript
// Check localStorage
console.log('Storage data:', localStorage.getItem('tmFlash'));
const parsed = JSON.parse(localStorage.getItem('tmFlash'));
console.log('Parsed data:', parsed);
```

#### Performance Analysis
```javascript
// Profile SRS selection
console.time('srs-selection');
const nextCard = SRS.selectNextCard(cards, stats, direction);
console.timeEnd('srs-selection');
console.log('Selected card:', nextCard);
```

---

*This technical documentation is intended for developers, advanced users, and those who want to understand the internal workings of TM-Flash. For user-facing documentation, see USER-GUIDE.md.*