// Navigation module
const Nav = {
  init() {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const viewId = e.target.dataset.view;
        this.show(viewId);
      });
    });
  },

  async show(viewId) {
    // Hide all views
    const views = document.querySelectorAll(".view");
    views.forEach((view) => view.classList.add("is-hidden"));

    // Show selected view
    const selectedView = document.getElementById(`view-${viewId}`);
    if (selectedView) {
      selectedView.classList.remove("is-hidden");
      if (viewId === "search") {
        document.getElementById("search-query").focus();
      }
    }

    // Update active tab
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => tab.classList.remove("active"));

    const activeTab = document.querySelector(`[data-view="${viewId}"]`);
    if (activeTab) {
      activeTab.classList.add("active");
    }

    // Render stats if showing stats view
    if (viewId === "stats") {
      StatsView.render();
    }
      // Refresh review card if showing review view
      if (viewId === "review") {
        // Reload current deck (or deck_a if none assigned) to ensure fresh data
        const deckToLoad = App.currentDeckId || 'deck_a';
        await DeckSelector.loadDeck(deckToLoad);
      }
  },
};