# TM-Flash Agent Guidelines

## Build/Lint/Test Commands

### Development Server
- **no local server is needed**: the app is browser-only app
- **Open in browser**: Navigate to `file://<this dir>index.html`

### Testing
- **Manual testing**: Open `index.html` in browser and test functionality
- **Cross-browser testing**: Test in Chrome, Firefox, Safari, and mobile browsers
- **Performance testing**: Use browser dev tools to check load times (< 2s target)

### Code Quality
- **HTML validation**: Use browser dev tools or online validators
- **CSS validation**: Use browser dev tools or online validators
- **JavaScript linting**: Use browser console for syntax errors
- **Accessibility**: Test with screen readers and keyboard navigation

## Code Style Guidelines

### JavaScript
- **Variables**: Use `const` for constants, `let` for variables, avoid `var`
- **Functions**: Use arrow functions where appropriate, descriptive names
- **Naming**: camelCase for variables/functions, PascalCase for constructors
- **Modules**: Keep functions small and focused, single responsibility
- **Error handling**: Use try/catch for async operations, validate inputs
- **Comments**: Add JSDoc for public functions, inline comments for complex logic

### HTML
- **Structure**: Semantic HTML5 elements, proper heading hierarchy
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Security**: Use `textContent` instead of `innerHTML` for user data
- **Performance**: Minimize DOM manipulation, use efficient selectors

### CSS
- **Organization**: Group related styles, use consistent naming
- **Responsive**: Mobile-first approach, flexible layouts
- **Performance**: Minimize repaints/reflows, use CSS transforms
- **Accessibility**: Sufficient color contrast, focus indicators

### File Structure
```
tm-flash/
├─ index.html          # Main HTML file
├─ styles.css          # All styles
├─ app.js             # Main application logic
└─ decks/             # Deck data files
    ├─ deck_a.json
    ├─ deck_b.json
    ├─ deck_c.json
    └─ deck_d.json
```

### Data Handling
- **LocalStorage**: Use key `tmFlash` with schema_version=1; schema includes nested "directions" per card: { "CH->EN": {correct, incorrect, last_reviewed}, "EN->CH": {...} }
- **Stats tracking**: Separate per-direction stats for each card to support bidirectional learning
- **JSON validation**: Validate deck structure and card data integrity
- **Error recovery**: Graceful handling of corrupted data or network failures
- **Security**: Sanitize all user inputs, validate file paths

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
3. **Testing**: Manual testing with browser dev tools
4. **Validation**: Cross-browser and accessibility testing
5. **Documentation**: Update this file with new patterns discovered
6. **Progress Tracking**: Complete atomic tickets sequentially from TM-workboard.md; mark each as [DONE] upon completion; use ticket IDs in git commit messages (e.g., "W-001: Project Skeleton"); run manual QA checklists after core features; use local git log for progress review

### Git Workflow
- **Branch**: All development work in `main` branch
- **Commits**: Atomic commits following workboard ticket completion
- **No remote**: Local development only, no remote repository required
