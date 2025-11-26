// Modal module for settings and controls
const Modal = {
    isOpen: false,

    init() {
        this.bindEvents();
        this.loadSettings();
    },

    bindEvents() {
        // Hamburger menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.open());
        }

        // Modal close button
        const closeBtn = document.getElementById('modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Click outside to close
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isOpen) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.close();
                }
            }
        });

        // Settings checkboxes
        const settingIds = ['setting-show-progress'];
        settingIds.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.saveSettings());
            }
        });
    },

    open() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.remove('is-hidden');
            this.isOpen = true;
            this.updateModalContent();
            // Focus management
            const firstFocusable = overlay.querySelector('select, button, input');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    },

    close() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.add('is-hidden');
            this.isOpen = false;
            // Return focus to hamburger button
            const menuToggle = document.getElementById('menu-toggle');
            if (menuToggle) {
                menuToggle.focus();
            }
        }
    },

    updateModalContent() {
        // Update deck selector value from settings
        const deckSelector = document.getElementById('modal-deck-selector');
        const settings = Storage.getSettings();
        if (deckSelector && settings.selected_deck) {
            deckSelector.value = settings.selected_deck;
        }

        // Update mode selector from settings
        this.updateModeSelector(settings.mode);

        // Update filters
        this.updateFiltersInModal();
    },

    updateModeSelector(currentMode) {
        const modeSelector = document.getElementById('modal-mode-selector');
        if (!modeSelector) return;

        // Render mode options if not already rendered
        const existingRadios = modeSelector.querySelectorAll('input[type="radio"]');
        if (existingRadios.length === 0) {
            this.renderModeSelector();
        }

        // Set checked state based on current mode
        const radios = modeSelector.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.checked = radio.value === currentMode;
        });
    },

    renderModeSelector() {
        const modeSelector = document.getElementById('modal-mode-selector');
        if (!modeSelector) return;

        const modeOptions = Object.values(LEARNING_MODES).map(mode => `
            <label class="mode-option">
                <input type="radio" name="learning-mode" value="${mode.id}">
                <span class="mode-icon">${mode.icon}</span>
                <div class="mode-details">
                    <div class="mode-name">${mode.name}</div>
                    <div class="mode-description">${mode.description}</div>
                </div>
            </label>
        `).join('');

        modeSelector.innerHTML = modeOptions;

        // Bind change events
        const radios = modeSelector.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const selectedMode = e.target.value;
                const settings = Storage.getSettings();
                settings.mode = selectedMode;
                Storage.setSettings(settings);
                // Apply the mode change
                Settings.applyMode(selectedMode);
            });
        });
    },

    renderFilterMenu() {
        const modalFiltersContent = document.getElementById('modal-filters-content');
        if (!modalFiltersContent) return;

        const hasTags = Filters.availableTags.size > 0;
        const hasHsk = Filters.availableHskLevels.size > 0;

        let menuContent = '';
        if (hasTags || hasHsk) {
            let tagOptions = '';
            if (hasTags) {
                tagOptions = Array.from(Filters.availableTags).map(tag => {
                    const isSelected = Filters.selectedTags.has(tag);
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
                hskOptions = Array.from(Filters.availableHskLevels).map(level => {
                    const isSelected = Filters.selectedHskLevels.has(level);
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

        modalFiltersContent.innerHTML = menuContent;
        this.bindFilterEventsInModal();

        // Equalize column widths based on content
        this.equalizeColumnWidths();
    },

    updateFiltersInModal() {
        const filterSection = document.getElementById('modal-filter-section');

        if (filterSection) {
            // Show/hide filter section based on availability
            const hasFilters = Filters.availableTags.size > 0 || Filters.availableHskLevels.size > 0;
            filterSection.style.display = hasFilters ? 'block' : 'none';

            // Render filter menu directly
            this.renderFilterMenu();
        }
    },

    bindFilterEventsInModal() {
        // Re-bind tag filter events
        const tagOptions = document.querySelectorAll('#modal-filters-content [data-type="tag"]');
        tagOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                if (Filters.selectedTags.has(value)) {
                    Filters.selectedTags.delete(value);
                    option.classList.remove('selected');
                } else {
                    Filters.selectedTags.add(value);
                    option.classList.add('selected');
                }
                Filters.saveFilters();
                Filters.applyFilters();
            });
        });

        // Re-bind HSK filter events
        const hskOptions = document.querySelectorAll('#modal-filters-content [data-type="hsk"]');
        hskOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                if (Filters.selectedHskLevels.has(value)) {
                    Filters.selectedHskLevels.delete(value);
                    option.classList.remove('selected');
                } else {
                    Filters.selectedHskLevels.add(value);
                    option.classList.add('selected');
                }
                Filters.saveFilters();
                Filters.applyFilters();
            });
        });
    },

    loadSettings() {
        const settings = Storage.getSettings();

        // Load existing settings
        const showProgress = document.getElementById('setting-show-progress');
        if (showProgress) {
            showProgress.checked = settings.showProgress !== false; // Default to true
        }

        this.applySettings();
    },

    saveSettings() {
        const settings = Storage.getSettings();

        settings.showProgress = document.getElementById('setting-show-progress')?.checked || false;

        Storage.setSettings(settings);
        this.applySettings();
    },

    applySettings() {
        const settings = Storage.getSettings();

        // Apply progress bar visibility
        const progressBar = document.getElementById('review-progress-bar');
        if (progressBar) {
            progressBar.style.display = settings.showProgress ? 'flex' : 'none';
        }
    },

    equalizeColumnWidths() {
        const modalFiltersContent = document.getElementById('modal-filters-content');
        if (!modalFiltersContent) return;

        const columns = modalFiltersContent.querySelectorAll('.filter-column');
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
            modalFiltersContent.offsetWidth;

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
    }
};