# TM-Flash Agent Guidelines

## Build/Lint/Test Commands

### Development Server
- **Local HTTP server**: Already running on port 8000 (no need to launch) Note: Server is pre-launched on port 8000. Do not attempt to start a new server on the same port.
- **Open in browser**: Navigate to `http://localhost:8000`

### Testing
- **Manual testing**: Open `index.html` in browser and test functionality
- **Cross-browser testing**: Test in Chrome, Firefox, Safari, and mobile browsers
- **Performance testing**: Use browser dev tools to check load times (< 2s target)
- **Single test execution**: No automated test runner - all tests are manual browser-based
- **Keyboard controls for testing**: `Space` flips card, `ArrowRight` marks correct, `ArrowLeft` marks incorrect (only when flipped)

### Code Quality
- **HTML validation**: Use browser dev tools or online validators
- **CSS validation**: Use browser dev tools or online validators
- **JavaScript linting**: Use browser console for syntax errors (no automated linter configured)
- **Accessibility**: Test with screen readers and keyboard navigation
- **Console debugging**: Many modules include detailed console.log statements for debugging

## Code Style Guidelines

### JavaScript
- **Variables**: Use `const` for constants, `let` for variables, avoid `var`
- **Functions**: Use arrow functions where appropriate, descriptive names
- **Naming**: camelCase for variables/functions, PascalCase for constructors/objects
- **Modules**: Keep functions small and focused, single responsibility; use object literals for module pattern
- **Error handling**: Use try/catch for async operations, validate inputs, throw descriptive errors
- **Comments**: Add JSDoc for public functions, inline comments for complex logic
- **Async/await**: Prefer async/await over promises for asynchronous code
- **DOM manipulation**: Use `textContent` instead of `innerHTML` for security; escape HTML when necessary
- **Constants**: Define constants in `constants.js` or at module top level
- **Imports**: No module imports/exports - all scripts loaded globally in specific order (see index.html)
- **Script loading order**: Critical - maintain order in index.html: chart.js → configloader.js → constants.js → storage.js → stats.js → srs.js → message.js → normalizer.js → validator.js → deckloader.js → deckselector.js → settings.js → review.js → statsview.js → search.js → filters.js → modal.js → nav.js → start.js → app.js
- **Debugging**: Include console.log statements for debugging (following existing patterns in SRS and Review modules)

### HTML
- **Structure**: Semantic HTML5 elements, proper heading hierarchy
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Security**: Use `textContent` instead of `innerHTML` for user data
- **Performance**: Minimize DOM manipulation, use efficient selectors

### CSS
- **Organization**: Group related styles, use consistent naming
- **Responsive**: Mobile-first approach, flexible layouts with modal breakpoints at 600px
- **Modal System**: Hamburger menu modal for settings; full-screen on mobile, centered on desktop
- **Dark Mode**: CSS custom properties for theme switching
- **Performance**: Minimize repaints/reflows, use CSS transforms
- **Accessibility**: Sufficient color contrast, focus indicators, keyboard navigation

### File Structure
```
tm-flash/
├─ index.html          # Main HTML file with script loading order
├─ styles.css          # All styles with CSS custom properties for theming
├─ app.js             # Main application initialization and coordination
├─ constants.js       # App constants, deck registry, and configuration
├─ storage.js         # localStorage state management
├─ stats.js           # Statistics tracking and persistence
├─ srs.js             # Spaced repetition algorithm
├─ deckloader.js      # Deck loading with error handling
├─ deckselector.js    # Deck selection UI
├─ settings.js        # User settings management
├─ review.js          # Card review interface and interactions
├─ statsview.js       # Statistics visualization
├─ search.js          # Card search functionality
├─ filters.js         # Card filtering logic
├─ modal.js           # Settings modal management
├─ nav.js             # Navigation between views
├─ message.js         # User messaging system
├─ normalizer.js      # Data normalization utilities
├─ validator.js       # Data validation utilities
├─ chart.js           # Chart rendering utilities
└─ decks/             # Deck data files
    ├─ deck_a.json
    ├─ deck_b.json
    ├─ deck_c.json
    └─ deck_d.json
```

### Data Handling
- **LocalStorage**: Use key `tmFlash` with schema_version=4; includes settings for modal controls: showProgress, showPinyin
- **Modal Settings**: Hamburger menu modal consolidates deck selection, filters, mode toggle, and app settings
- **def_words format**: Array of strings for word-by-word translations, e.g., ["I", "love", "you"] instead of "I love you"
- **Stats tracking**: Separate per-mode stats for each card to support multi-mode learning
- **JSON validation**: Validate deck structure and card data integrity
- **Error recovery**: Graceful handling of corrupted data or network failures
- **Security**: Sanitize all user inputs, validate file paths

### Deck JSON Format
```json
{
  "type": "word",
  "deck_name": "Deck Name",
  "created_at": "ISO timestamp",
  "version": "2",
  "description": "Deck description",
  "cards": [
    {
      "card_id": "unique_string_id",
      "hanzi": "Chinese characters",
      "pinyin": "pīnyīn",
      "tones": "tone_numbers",
      "def": "English definition",
      "def_words": ["word", "by", "word", "array"]
    }
  ]
}
```

### Stats Data Structure (per card, per mode)
```javascript
{
  "total_correct": number,
  "total_incorrect": number,
  "last_correct_at": timestamp_ms,
  "last_incorrect_at": timestamp_ms,
  "correct_streak_len": number,
  "incorrect_streak_len": number,
  "correct_streak_started_at": timestamp_ms,
  "incorrect_streak_started_at": timestamp_ms
}
```

### Performance Targets
- **First load**: < 2s for ≤ 1000 cards per deck on mid-tier mobile
- **Interaction latency**: < 50ms for all user interactions
- **Memory usage**: Efficient data structures, garbage collection friendly

### Browser Support
- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **Progressive enhancement**: Core functionality works without JavaScript

### Development Workflow
1. **Planning**: Review TM-GP.md and TM-workboard.md specifications
2. **Implementation**: Follow atomic ticket approach from workboard
3. **Testing**: Manual testing with browser dev tools and console debugging
4. **Validation**: Cross-browser and accessibility testing
5. **Documentation**: Update this file with new patterns discovered
6. **Progress Tracking**: Complete atomic tickets sequentially from TM-workboard.md; mark each as [DONE] upon completion; use ticket IDs in git commit messages (e.g., "W-001: Project Skeleton"); run manual QA checklists after core features; use local git log for progress review

### Common Development Tasks
- **Adding new modules**: Add script tag to index.html in correct load order position
- **Modifying SRS algorithm**: Update srs.js with detailed console logging for debugging
- **UI changes**: Use CSS custom properties for theming, maintain responsive design
- **Data persistence**: Use Storage.get/set methods for localStorage operations
- **Error handling**: Implement try/catch with user-friendly error banners
- **Performance optimization**: Profile with browser dev tools, focus on render performance
- **Cross-browser compatibility**: Test on Chrome, Firefox, Safari, Edge, and mobile browsers

### Debugging Techniques
- **Console logging**: Check browser console for detailed debug output from SRS and Review modules
- **localStorage inspection**: Use `localStorage.getItem('tmFlash')` to examine persisted state
- **Network tab**: Monitor deck loading and cache behavior
- **Performance tab**: Check load times and rendering performance
- **Manual state manipulation**: Modify localStorage directly for testing edge cases

### Git Workflow
- **Branch**: All development work in `main` branch
- **Commits**: Atomic commits following workboard ticket completion; do not commit unless explicitly asked by the user
- **No remote**: Local development only, no remote repository required

## Additional Documentation

For detailed technical specifications and implementation notes, see [TECHNICAL-NOTES.md](TECHNICAL-NOTES.md).

For comprehensive user guidance and troubleshooting, see [USER-GUIDE.md](USER-GUIDE.md).

## Copilot Instructions Integration

The following guidelines from `.github/copilot-instructions.md` are incorporated:

### Application Architecture
- **Single-page app**: Loaded from `index.html` with critical script loading order
- **Data flow**: JSON decks in `decks/*.json` → `DeckLoader.fetch()` → `Storage`/`Stats` localStorage management → `SRS` scheduling → `Review` rendering
- **State management**: Per-deck stats in localStorage under key `tmFlash` with schema versioning

### Key Module Responsibilities
- `constants.js`: Deck registry `DECKS` and app constants
- `storage.js`/`stats.js`: localStorage schema management with per-card stats per mode
- `srs.js`: Spaced repetition algorithm with interval calculation and card selection
- `deckloader.js`: HTTP fetching with timeout and error handling
- `review.js`: Card rendering and user interaction handling

### SRS Algorithm Details
- **Interval calculation**: Base intervals table with modifiers for accuracy, streaks, and recency
- **Card selection**: Priority scoring for new cards, failures, overdue cards, and low accuracy
- **Stats tracking**: Separate per-mode stats (`LM-hanzi-first`, `LM-meaning-to-chinese`, `LM-listening`, `LM-pronunciation`) with timestamps and streaks

### Development Best Practices
- **Public API preservation**: Maintain function names used across modules
- **UI updates**: Prefer non-invasive DOM updates with CSS variables for scaling
- **Performance**: Minimal DOM nodes, tokenized table structures
- **Error handling**: Graceful degradation with error banners for failed operations
