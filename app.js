// Constants
const SRS_WEIGHTS = {
    NEW: 5.0,
    ERROR: 3.0,
    DAYS: 0.25
};

const SRS_MAX_DAYS = 14;

const DEFAULT_SELECTED_DECK = 'deck_a';

// Deck registry
const DECKS = {
    deck_a: {
        label: 'Deck A',
        url: 'decks/deck_a.json'
    },
    deck_b: {
        label: 'Deck B',
        url: 'decks/deck_b.json'
    },
    deck_c: {
        label: 'Deck C',
        url: 'decks/deck_c.json'
    },
    deck_d: {
        label: 'Deck D',
        url: 'decks/deck_d.json'
    }
};

// Storage module
const Storage = {
    STORAGE_KEY: 'tmFlash',

    getDefaultState() {
        return {
            schema_version: 1,
            settings: {
                direction: "CH->EN",
                selected_deck: DEFAULT_SELECTED_DECK,
                theme: "light"
            },
            decks: {
                deck_a: { cards: {} },
                deck_b: { cards: {} },
                deck_c: { cards: {} },
                deck_d: { cards: {} }
            }
        };
    },

    loadState() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) {
                const defaultState = this.getDefaultState();
                this.saveState(defaultState);
                return defaultState;
            }
            const state = JSON.parse(stored);
            // Ensure schema version is current
            if (state.schema_version !== 1) {
                console.warn('Schema version mismatch, using defaults');
                const defaultState = this.getDefaultState();
                this.saveState(defaultState);
                return defaultState;
            }
            return state;
        } catch (error) {
            console.error('Error loading state:', error);
            const defaultState = this.getDefaultState();
            this.saveState(defaultState);
            return defaultState;
        }
    },

    saveState(state) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    },

    getSettings() {
        const state = this.loadState();
        return state.settings;
    },

    setSettings(settings) {
        const state = this.loadState();
        state.settings = { ...state.settings, ...settings };
        this.saveState(state);
    },

    getDeckStats(deckId) {
        const state = this.loadState();
        return state.decks[deckId] || { cards: {} };
    },

    setDeckStats(deckId, statsObj) {
        const state = this.loadState();
        state.decks[deckId] = statsObj;
        this.saveState(state);
    }
};

// Settings module
const Settings = {
    init() {
        this.loadDirection();
        this.bindDirectionToggle();
    },

    loadDirection() {
        const settings = Storage.getSettings();
        this.applyDirection(settings.direction);
    },

    applyDirection(direction) {
        const button = document.getElementById('direction-toggle');
        if (button) {
            button.textContent = direction;
            button.dataset.direction = direction;
        }
    },

    toggleDirection() {
        const currentDirection = Storage.getSettings().direction;
        const newDirection = currentDirection === "CH->EN" ? "EN->CH" : "CH->EN";
        Storage.setSettings({ direction: newDirection });
        this.applyDirection(newDirection);
    },

    bindDirectionToggle() {
        const button = document.getElementById('direction-toggle');
        if (button) {
            button.addEventListener('click', () => {
                this.toggleDirection();
            });
            button.disabled = false;
        }
    }
};

// TM-Flash Application
const App = {
    init() {
        console.log('TM-Flash initialized');
        console.log('Deck registry:', DECKS);
        // Initialize storage
        Storage.loadState();
        // Initialize settings
        Settings.init();
        // Initialize navigation
        Nav.init();
    }
};

// Navigation module
const Nav = {
    init() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const viewId = e.target.dataset.view;
                this.show(viewId);
            });
        });
    },

    show(viewId) {
        // Hide all views
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.add('is-hidden'));

        // Show selected view
        const selectedView = document.getElementById(`view-${viewId}`);
        if (selectedView) {
            selectedView.classList.remove('is-hidden');
        }

        // Update active tab
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => tab.classList.remove('active'));

        const activeTab = document.querySelector(`[data-view="${viewId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});