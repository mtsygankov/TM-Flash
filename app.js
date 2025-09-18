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

// TM-Flash Application
const App = {
    init() {
        console.log('TM-Flash initialized');
        console.log('Deck registry:', DECKS);
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