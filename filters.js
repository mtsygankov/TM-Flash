// Filters module
const Filters = {
  selectedTags: new Set(),
  selectedHskLevels: new Set(),
  availableTags: new Set(),
  availableHskLevels: new Set(),
  isInitialized: false,

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.bindEvents();
  },

  bindEvents() {
    // Combined filters dropdown toggle
    const filtersBtn = document.getElementById('filters-btn');
    const filtersMenu = document.getElementById('filters-menu');
    if (filtersBtn && filtersMenu) {
      filtersBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown('filters');
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      this.closeAllDropdowns();
    });

    // Prevent dropdown close when clicking inside menu
    document.addEventListener('click', (e) => {
      if (e.target.closest('.filter-menu')) {
        e.stopPropagation();
      }
    });
  },

  toggleDropdown(type) {
    const menu = document.getElementById(`${type}-menu`);
    const isVisible = !menu.classList.contains('is-hidden');

    this.closeAllDropdowns();

    if (!isVisible) {
      menu.classList.remove('is-hidden');
    }
  },

  closeAllDropdowns() {
    const menus = document.querySelectorAll('.filter-menu');
    menus.forEach(menu => menu.classList.add('is-hidden'));
  },

  extractAvailableFilters(cards) {
    this.availableTags.clear();
    this.availableHskLevels.clear();

    cards.forEach(card => {
      // Extract tags
      if (card.tags && Array.isArray(card.tags)) {
        card.tags.forEach(tag => this.availableTags.add(tag));
      }

      // Extract HSK levels
      if (card.hsk) {
        this.availableHskLevels.add(card.hsk);
      }
    });

    // Sort for consistent ordering
    this.availableTags = new Set([...this.availableTags].sort());
    this.availableHskLevels = new Set([...this.availableHskLevels].sort());

    this.updateFilterUI();
  },

  updateFilterUI() {
    const filterControls = document.getElementById('filter-controls');
    const hasFilters = this.availableTags.size > 0 || this.availableHskLevels.size > 0;

    if (filterControls) {
      filterControls.style.display = hasFilters ? 'flex' : 'none';
    }

    this.renderCombinedFilterMenu();
  },

  renderCombinedFilterMenu() {
    const menu = document.getElementById('filters-menu');
    if (!menu) return;

    const hasTags = this.availableTags.size > 0;
    const hasHsk = this.availableHskLevels.size > 0;

    let menuContent = '';
    if (hasTags || hasHsk) {
      let tagOptions = '';
      if (hasTags) {
        tagOptions = Array.from(this.availableTags).map(tag => {
          const isSelected = this.selectedTags.has(tag);
          const colorClass = Search.getTagColorClass(tag);
          return `
            <div class="filter-option ${isSelected ? 'selected' : ''}" data-type="tag" data-value="${tag}">
              <span class="tag-badge ${colorClass}">${tag}</span>
            </div>
          `;
        }).join('');
      }

      let hskOptions = '';
      if (hasHsk) {
        hskOptions = Array.from(this.availableHskLevels).map(level => {
          const isSelected = this.selectedHskLevels.has(level);
          return `
            <div class="filter-option ${isSelected ? 'selected' : ''}" data-type="hsk" data-value="${level}">
              <span class="hsk-badge">${level}</span>
            </div>
          `;
        }).join('');
      }

      menuContent = `
        <div class="filter-menu-columns">
          ${hasTags ? `<div class="filter-column">
            <div class="filter-column-header">Tags</div>
            <div class="filter-column-content">${tagOptions}</div>
          </div>` : ''}
          ${hasHsk ? `<div class="filter-column">
            <div class="filter-column-header">HSK</div>
            <div class="filter-column-content">${hskOptions}</div>
          </div>` : ''}
        </div>
      `;
    }

    menu.innerHTML = menuContent;
    this.bindFilterOptionEvents('tag');
    this.bindFilterOptionEvents('hsk');

    // Equalize column widths based on content
    this.equalizeColumnWidths();
  },

  bindFilterOptionEvents(type) {
    const options = document.querySelectorAll(`[data-type="${type}"]`);
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = option.dataset.value;

        if (type === 'tag') {
          if (this.selectedTags.has(value)) {
            this.selectedTags.delete(value);
            option.classList.remove('selected');
          } else {
            this.selectedTags.add(value);
            option.classList.add('selected');
          }
        } else if (type === 'hsk') {
          if (this.selectedHskLevels.has(value)) {
            this.selectedHskLevels.delete(value);
            option.classList.remove('selected');
          } else {
            this.selectedHskLevels.add(value);
            option.classList.add('selected');
          }
        }

        this.saveFilters();
        this.applyFilters();
      });
    });
  },



  applyFilters() {
    if (!App.currentCards || !App.currentCards.length) return;

    let filteredCards = App.currentCards;

    // Apply tag filter
    if (this.selectedTags.size > 0) {
      filteredCards = filteredCards.filter(card =>
        card.tags && card.tags.some(tag => this.selectedTags.has(tag))
      );
    }

    // Apply HSK filter
    if (this.selectedHskLevels.size > 0) {
      filteredCards = filteredCards.filter(card =>
        card.hsk && this.selectedHskLevels.has(card.hsk)
      );
    }

    // Update app state with filtered cards
    App.currentFilteredCards = filteredCards;

    // Update review display
    Review.updateReviewTogglesDisplay();

    // Rerender stats if in stats view
    if (Nav.currentView === 'stats') {
      StatsView.render();
    }

    // If no card is currently selected or it's not in filtered set, select next
    if (!App.currentCard || !filteredCards.find(card => card.card_id === App.currentCard.card_id)) {
      App.currentCard = SRS.selectNextCard(
        filteredCards,
        App.currentStats.cards,
        App.currentDirection
      );
      if (App.currentCard) {
        Review.renderCard(App.currentCard);
      } else {
        Review.renderCard(null);
        const nextReviewInfo = SRS.getNextReviewInfo(filteredCards, App.currentStats.cards, App.currentDirection);
        let message;
        if (nextReviewInfo) {
          message = `No cards due for review with current filters. Next review: (${nextReviewInfo.cardsInWindow} card${nextReviewInfo.cardsInWindow > 1 ? 's' : ''} in ~${nextReviewInfo.timeString}).`;
        } else {
          message = 'No cards due for review with current filters.';
        }
        Message.show('card-container', message);
      }
    }
  },

  clearFilters() {
    this.selectedTags.clear();
    this.selectedHskLevels.clear();
    this.saveFilters();
    this.applyFilters();
    this.renderCombinedFilterMenu();
  },

  loadSavedFilters() {
    const settings = Storage.getSettings();
    const deckId = App.currentDeckId;

    if (settings.filters && settings.filters[deckId]) {
      const deckFilters = settings.filters[deckId];
      this.selectedTags = new Set(deckFilters.tags || []);
      this.selectedHskLevels = new Set(deckFilters.hsk || []);
    } else {
      this.selectedTags.clear();
      this.selectedHskLevels.clear();
    }
  },

  saveFilters() {
    const settings = Storage.getSettings();
    const deckId = App.currentDeckId;

    if (!settings.filters) {
      settings.filters = {};
    }

    settings.filters[deckId] = {
      tags: Array.from(this.selectedTags),
      hsk: Array.from(this.selectedHskLevels)
    };

    Storage.setSettings(settings);
  },

  equalizeColumnWidths() {
    const menu = document.getElementById('filters-menu');
    if (!menu) return;

    const columns = menu.querySelectorAll('.filter-column');
    if (columns.length !== 2) return;

    // Skip equalization if using flex-wrap layout
    const content = columns[0].querySelector('.filter-column-content');
    if (content && getComputedStyle(content).display === 'flex') return;

    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      // Reset any previously set widths
      columns.forEach(column => {
        column.style.width = '';
      });

      // Force reflow to ensure styles are applied
      menu.offsetWidth;

      // Measure badge content widths instead of container widths
      let maxBadgeWidth = 0;
      columns.forEach(column => {
        const badgeElements = column.querySelectorAll('.tag-badge, .hsk-badge');
        badgeElements.forEach(badge => {
          const badgeWidth = badge.scrollWidth;
          maxBadgeWidth = Math.max(maxBadgeWidth, badgeWidth);
        });
      });

      // Add padding for the filter-option container (0.3rem * 2 * 16px = 9.6px)
      // Plus gap (0.5rem * 16px = 8px) and some buffer
      const containerPadding = 24; // Total buffer for padding, gaps, and safety
      let maxWidth = maxBadgeWidth + containerPadding;

      // Ensure minimum width for usability
      maxWidth = Math.max(maxWidth, 100);

      // Set uniform width to both columns
      columns.forEach(column => {
        column.style.width = maxWidth + 'px';
      });
    });
  },

  // Utility method to get filtered cards for SRS functions
  getFilteredCards() {
    return App.currentFilteredCards || App.currentCards || [];
  }
};