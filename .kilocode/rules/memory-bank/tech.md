# TM-Flash Technical Stack

## Technologies

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **HTML5** | Page structure and semantics | Latest |
| **CSS3** | Styling, theming, responsive design | Latest |
| **Vanilla JavaScript** | Application logic, ES6+ | ES2020+ |
| **Chart.js** | Statistics visualization | External CDN |

### Data Storage
- **localStorage**: Browser-based persistence
- **JSON files**: Static deck data in `decks/` directory
- **Future**: Firebase/Firestore cloud sync (planned)

### Development Tools
- **Local HTTP Server**: Python `http.server` on port 8000
- **Browser DevTools**: Debugging, profiling, testing
- **Git**: Version control (local only)

## Development Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local HTTP server (Python, Node.js, or live-server)
- Text editor with JavaScript support

### Running the Application
```bash
# Navigate to project directory
cd /Users/mikt/Documents/Yandex.Disk.localized/Python-Testbed/TM-Flash

# Start local server (Python 3)
python3 -m http.server 8000

# Or with Node.js
npx http-server -p 8000

# Open in browser
# http://localhost:8000
```

**Note**: A local HTTP server is already running on port 8000. Do not start a new server on the same port.

### Project Structure
```
TM-Flash/
├── index.html           # Main entry point with script loading order
├── styles.css           # All CSS with custom properties
├── app.js              # Application initialization
├── constants.js        # App constants and learning modes
├── storage.js          # localStorage management
├── stats.js            # Statistics tracking
├── srs.js              # Spaced repetition algorithm
├── deckloader.js       # Deck fetching
├── deckselector.js     # Deck selection UI
├── settings.js         # User settings
├── review.js           # Card review interface
├── statsview.js        # Statistics display
├── search.js           # Card search
├── filters.js          # Card filtering
├── modal.js            # Settings modal
├── nav.js              # Navigation
├── start.js            # Start screen
├── message.js          # User messaging
├── normalizer.js       # Pinyin normalization
├── validator.js        # Data validation
├── configloader.js     # Config loading
├── chart.js            # Chart.js library
├── AGENTS.md           # Development guidelines
├── PLAN.md             # Learning modes refactoring plan
├── CLOUD-STORAGE-PLAN.md  # Cloud sync implementation plan
└── decks/
    ├── config.json     # Deck registry configuration
    ├── deck_a.json     # HSK 1-3 vocabulary
    ├── deck_b.json     # Chinese expressions
    ├── deck_c.json     # Additional vocabulary
    ├── deck_d.json     # HSK 6 vocabulary
    └── deck_*_audio/   # Audio files for cards
```

## Technical Constraints

### No Build System
- No npm, webpack, or bundlers
- All scripts loaded globally via `<script>` tags
- Manual dependency management via script order
- No module imports/exports

### Browser Compatibility
- Modern browsers: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Chrome Mobile
- No IE11 support
- ES6+ features required

### Performance Targets
- **Page load**: < 2s for 1000 cards on mid-tier mobile
- **Interaction latency**: < 50ms for all user actions
- **Memory**: Efficient structures, GC-friendly

### localStorage Limits
- **Quota**: ~5-10MB per origin
- **Schema versioning**: v4 current
- **Graceful degradation**: Fallback on quota exceeded

## Code Style Guidelines

### JavaScript
```javascript
// Use const/let, avoid var
const CONSTANT = 'value';
let variable = 'value';

// Object literal module pattern
const ModuleName = {
  property: 'value',
  
  init() {
    this.bindEvents();
  },
  
  method() {
    // Function body
  }
};

// Arrow functions for callbacks
element.addEventListener('click', (e) => {
  this.handleClick(e);
});

// Async/await for asynchronous operations
async function loadDeck(deckId) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### CSS
```css
/* Semantic class names */
.mode-hanzi-first { }
.card-container { }
.progress-segment { }

/* CSS custom properties for theming */
:root {
  --primary-color: #007bff;
  --background-color: #ffffff;
}

/* Mobile-first responsive design */
.modal-content {
  width: 100%;
}

@media (min-width: 600px) {
  .modal-content {
    width: 90%;
    max-width: 600px;
  }
}
```

### HTML
```html
<!-- Semantic HTML5 elements -->
<header>
  <nav>
    <button class="tab" data-view="review">Review</button>
  </nav>
</header>

<main>
  <section id="view-review" class="view">
    <!-- Content -->
  </section>
</main>

<!-- Accessibility -->
<button aria-label="Open settings" id="menu-toggle">☰</button>
```

## Testing Strategy

### Manual Testing
- No automated test runner configured
- Browser-based testing with DevTools
- Console logging for debugging

### Testing Checklist
1. **Functional**: All modes render correctly
2. **Data**: Stats persist and migrate properly
3. **Audio**: Listening mode plays audio
4. **Responsive**: Mobile and desktop layouts
5. **Accessibility**: Keyboard navigation, screen readers
6. **Cross-browser**: Chrome, Firefox, Safari, Edge

### Debugging
```javascript
// Console logging patterns
console.log("Module initialized:", data);
console.warn("Schema version mismatch");
console.error("Failed to load deck:", error);

// localStorage inspection
localStorage.getItem('tmFlash');
```

## Dependencies

### External Libraries
- **Chart.js**: Statistics visualization (loaded via `chart.js`)

### No Other Dependencies
- No jQuery
- No React/Vue/Angular
- No CSS frameworks (Bootstrap, Tailwind)
- No npm packages

## Future Technical Plans

### Cloud Storage (Planned)
- Firebase/Firestore integration
- User authentication
- Cross-device sync
- See [`CLOUD-STORAGE-PLAN.md`](CLOUD-STORAGE-PLAN.md) for details

### Potential Enhancements
- Service Worker for offline support
- IndexedDB for larger datasets
- Web Audio API for better audio handling
- PWA manifest for installability