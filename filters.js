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
    // Tag filter dropdown toggle
    const tagBtn = document.getElementById('tag-filter-btn');
    const tagMenu = document.getElementById('tag-filter-menu');
    if (tagBtn && tagMenu) {
      tagBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown('tag');
      });
    }

    // HSK filter dropdown toggle
    const hskBtn = document.getElementById('hsk-filter-btn');
    const hskMenu = document.getElementById('hsk-filter-menu');
    if (hskBtn && hskMenu) {
      hskBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown('hsk');
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
    const menu = document.getElementById(`${type}-filter-menu`);
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

    if (hasFilters) {
      this.renderTagFilterMenu();
      this.renderHskFilterMenu();
      this.updateFilterButtons();
    }
  },

  renderTagFilterMenu() {
    const menu = document.getElementById('tag-filter-menu');
    if (!menu || this.availableTags.size === 0) return;

    const options = Array.from(this.availableTags).map(tag => {
      const isSelected = this.selectedTags.has(tag);
      const colorClass = Search.getTagColorClass(tag);
      return `
        <div class="filter-option ${isSelected ? 'selected' : ''}" data-type="tag" data-value="${tag}">
          <input type="checkbox" class="filter-checkbox" ${isSelected ? 'checked' : ''}>
          <span class="tag-badge ${colorClass}">${tag}</span>
        </div>
      `;
    }).join('');

    menu.innerHTML = options;
    this.bindFilterOptionEvents('tag');
  },

  renderHskFilterMenu() {
    const menu = document.getElementById('hsk-filter-menu');
    if (!menu || this.availableHskLevels.size === 0) return;

    const options = Array.from(this.availableHskLevels).map(level => {
      const isSelected = this.selectedHskLevels.has(level);
      return `
        <div class="filter-option ${isSelected ? 'selected' : ''}" data-type="hsk" data-value="${level}">
          <input type="checkbox" class="filter-checkbox" ${isSelected ? 'checked' : ''}>
          <span class="hsk-badge">${level}</span>
        </div>
      `;
    }).join('');

    menu.innerHTML = options;
    this.bindFilterOptionEvents('hsk');
  },

  bindFilterOptionEvents(type) {
    const options = document.querySelectorAll(`[data-type="${type}"]`);
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = option.dataset.value;
        const checkbox = option.querySelector('.filter-checkbox');

        if (type === 'tag') {
          if (this.selectedTags.has(value)) {
            this.selectedTags.delete(value);
            checkbox.checked = false;
            option.classList.remove('selected');
          } else {
            this.selectedTags.add(value);
            checkbox.checked = true;
            option.classList.add('selected');
          }
        } else if (type === 'hsk') {
          if (this.selectedHskLevels.has(value)) {
            this.selectedHskLevels.delete(value);
            checkbox.checked = false;
            option.classList.remove('selected');
          } else {
            this.selectedHskLevels.add(value);
            checkbox.checked = true;
            option.classList.add('selected');
          }
        }

        this.saveFilters();
        this.applyFilters();
        this.updateFilterButtons();
      });
    });
  },

  updateFilterButtons() {
    // Update tag filter button
    const tagBtn = document.getElementById('tag-filter-btn');
    const tagCount = document.querySelector('#tag-filter-btn .filter-count');
    if (tagBtn && tagCount) {
      const count = this.selectedTags.size;
      tagCount.textContent = `(${count})`;
      tagBtn.style.display = this.availableTags.size > 0 ? 'flex' : 'none';
    }

    // Update HSK filter button
    const hskBtn = document.getElementById('hsk-filter-btn');
    const hskCount = document.querySelector('#hsk-filter-btn .filter-count');
    if (hskBtn && hskCount) {
      const count = this.selectedHskLevels.size;
      hskCount.textContent = `(${count})`;
      hskBtn.style.display = this.availableHskLevels.size > 0 ? 'flex' : 'none';
    }
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
    this.updateFilterButtons();
    this.renderTagFilterMenu();
    this.renderHskFilterMenu();
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

  // Utility method to get filtered cards for SRS functions
  getFilteredCards() {
    return App.currentFilteredCards || App.currentCards || [];
  }
};