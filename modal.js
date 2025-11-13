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
        const settingIds = ['setting-show-progress', 'setting-dark-mode', 'setting-sound-effects'];
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

        // Update direction toggle from settings
        const directionToggle = document.getElementById('modal-direction-toggle');
        if (directionToggle && settings.direction) {
            directionToggle.textContent = DIRECTION_DISPLAY[settings.direction];
            directionToggle.dataset.direction = settings.direction;
        }

        // Update filters
        this.updateFiltersInModal();
    },

    updateFiltersInModal() {
        const modalFiltersContent = document.getElementById('modal-filters-content');
        const originalFiltersMenu = document.getElementById('filters-menu');
        const filterControls = document.getElementById('modal-filter-controls');

        if (modalFiltersContent && originalFiltersMenu && filterControls) {
            // Copy filter content
            modalFiltersContent.innerHTML = originalFiltersMenu.innerHTML;

            // Show/hide filter controls based on availability
            const hasFilters = originalFiltersMenu.innerHTML.trim() !== '';
            filterControls.style.display = hasFilters ? 'block' : 'none';

            // Re-bind filter events for modal context
            this.bindFilterEventsInModal();
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

        const darkMode = document.getElementById('setting-dark-mode');
        if (darkMode) {
            darkMode.checked = settings.darkMode || false;
        }

        const soundEffects = document.getElementById('setting-sound-effects');
        if (soundEffects) {
            soundEffects.checked = settings.soundEffects || false;
        }

        this.applySettings();
    },

    saveSettings() {
        const settings = Storage.getSettings();

        settings.showProgress = document.getElementById('setting-show-progress')?.checked || false;
        settings.darkMode = document.getElementById('setting-dark-mode')?.checked || false;
        settings.soundEffects = document.getElementById('setting-sound-effects')?.checked || false;

        Storage.setSettings(settings);
        this.applySettings();
    },

    applySettings() {
        const settings = Storage.getSettings();

        // Apply progress bar visibility
        const progressBar = document.getElementById('review-progress-bar');
        if (progressBar) {
            progressBar.style.display = settings.showProgress ? 'block' : 'none';
        }

        // Apply dark mode
        document.body.classList.toggle('dark-mode', settings.darkMode);

        // Note: soundEffects would need additional implementation
        // in the audio modules respectively
    }
};