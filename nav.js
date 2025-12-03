// Navigation module
const Nav = {
  currentView: "start",  // Track active view for keyboard shortcuts
  init() {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const viewId = e.target.dataset.view;
        this.show(viewId);
      });
    });

    // Global escape key listener for returning to start screen
    document.addEventListener("keydown", (e) => {
      // Ignore if user is typing in form elements
      /*if ( document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA" ||
          document.activeElement.tagName === "SELECT") {
        return;
      }*/
      // Return to start screen if not already there
      if (e.code === "Escape" && this.currentView !== "start") {
        e.preventDefault();  // Prevent any default escape behavior
        this.show("start");
        // Blur active form elements to allow start screen interaction
        if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT")) {
          document.activeElement.blur();
        }
      }
    });
  },

  async show(viewId) {
    this.currentView = viewId;  // Update current view tracker

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

    // Toggle visibility of review toggles
    const reviewToggles = document.getElementById('review-toggles');
    if (viewId === 'review' || viewId === 'stats') {
      reviewToggles.classList.remove('is-hidden');
    } else {
      reviewToggles.classList.add('is-hidden');
    }

    // Render stats if showing stats view
    if (viewId === "stats") {
      StatsView.render();
    }

    // Render start screen if showing start view
    if (viewId === "start") {
      Start.render();
    }

    // Handle review view - simplified, passive rendering only
    if (viewId === "review") {
      if (App.currentCard) {
        Review.renderCard(App.currentCard);
        // Update progress bar when entering review view
        Review.updateReviewProgressBar();
      } else {
        // Show message that no card is selected
        Review.renderCard(null);
        Message.show('review', 'No card selected. Use the Start screen to begin review.');
      }
    }
  },

};