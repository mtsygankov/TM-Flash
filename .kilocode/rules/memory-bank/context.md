# TM-Flash Current Context

## Current State
**Status**: Stable, feature-complete for core functionality  
**Version**: Schema v4 (localStorage)  
**Last Major Update**: Learning modes refactoring (completed)

## Recent Accomplishments

### Learning Modes Refactoring (PLAN.md - COMPLETED)
The application was refactored from a simple direction-based system (Chinese→English, English→Chinese) to a comprehensive learning modes system with four distinct approaches:

1. **LM-hanzi-first**: Character recognition training
2. **LM-listening**: Audio comprehension with auto-play
3. **LM-meaning-to-chinese**: Active production training
4. **LM-pronunciation**: Tone and pronunciation focus

**Key Changes:**
- Replaced `.direction-*` CSS classes with semantic `.mode-*` classes
- Updated storage schema from v3 to v4 for per-mode statistics
- Added audio auto-play for Listening mode
- Implemented modal-based mode selector with descriptions and icons
- Migrated existing direction stats to appropriate modes

### Start Screen Implementation
Added a start screen that appears when:
- Deck/filters/mode changes occur
- Cards are due for review
Shows deck info, applied filters, current mode, and cards due count.

### Dynamic Deck Configuration
Implemented [`configloader.js`](configloader.js) to load deck registry from [`decks/config.json`](decks/config.json) instead of hardcoded constants, enabling:
- Enable/disable decks without code changes
- Dynamic deck management
- Fallback to FALLBACK_DECKS if config unavailable

## Active Development Focus
**None currently** - Application is in stable state.

## Planned Future Work

### Cloud Storage (CLOUD-STORAGE-PLAN.md)
- Firebase/Firestore integration for cross-device sync
- User authentication (anonymous + registered)
- Migration from localStorage to cloud-backed storage
- Estimated timeline: 4-6 weeks when started

### Potential Enhancements
- PWA support for installability
- Service Worker for improved offline experience
- IndexedDB for larger datasets
- Additional deck formats support

## Known Limitations
- localStorage quota (~5-10MB) limits maximum statistics storage
- No automated testing framework
- Audio files must be manually prepared and placed in deck folders with hashed filenames (e.g., word_-45950099734855537.mp3) for efficient caching
- Cross-browser audio playback may have inconsistencies

## Error Handling and Performance
- **Graceful Degradation**: Fallback decks when config unavailable, user-friendly error banners for failed operations
- **Loading Progress**: Session-based deck caching with progress indicators during initialization
- **Memory Optimization**: Efficient data structures, garbage collection friendly, <2s load targets
- **Recovery Mechanisms**: Try/catch blocks for async operations, validation of deck structure and card data integrity

## Environment Notes
- **Development server**: Running on port 8000 (pre-launched)
- **Browser testing**: Chrome primary, Firefox/Safari for compatibility
- **File editing**: VS Code with open tabs for key modules

## Quick Reference

### Key Files for Common Tasks
| Task | Files to Modify |
|------|-----------------|
| Add new learning mode | [`constants.js`](constants.js), [`review.js`](review.js), [`styles.css`](styles.css), [`modal.js`](modal.js) |
| Update SRS algorithm | [`srs.js`](srs.js) |
| Modify card display | [`review.js`](review.js), [`styles.css`](styles.css) |
| Add new deck | [`decks/config.json`](decks/config.json), create deck JSON file |
| Update statistics | [`stats.js`](stats.js), [`statsview.js`](statsview.js) |
| Modify storage schema | [`storage.js`](storage.js) (bump version, add migration) |

### Testing Quick Start
1. Open `http://localhost:8000`
2. Open browser DevTools console
3. Test all four learning modes
4. Verify stats persist after refresh
5. Test deck switching and filters

## Additional Documentation
- [TECHNICAL-NOTES.md](TECHNICAL-NOTES.md) - Detailed technical specifications and implementation notes
- [USER-GUIDE.md](USER-GUIDE.md) - Comprehensive user guidance and troubleshooting