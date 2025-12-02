// Settings module
const Settings = {
  init() {
    this.loadSettings();
    this.bindModeToggle();
  },

  loadSettings() {
    const settings = Storage.getSettings();
    this.showPinyin = settings.showPinyin;
  },

  loadMode() {
    const settings = Storage.getSettings();
    this.applyMode(settings.mode);
  },

       applyMode(mode) {
        // Check if mode is a valid learning mode id
        const validMode = LEARNING_MODES[mode];
        if (!validMode) {
          console.warn(`Invalid mode '${mode}', using default`);
          mode = DEFAULT_MODE.id;
        }
       App.currentMode = mode;
       App.flipped = false;


       // Rerender stats if in stats view
       if (Nav.currentView === 'stats') {
         StatsView.render();
       }

       // Always show start screen after mode change
       Nav.show('start');
   },

   toggleMode() {
     const modes = Object.values(LEARNING_MODES);
     const currentMode = Storage.getSettings().mode;
     const currentIndex = modes.findIndex(m => m.id === currentMode);
     const nextIndex = (currentIndex + 1) % modes.length;
     const newMode = modes[nextIndex].id;
     Storage.setSettings({ mode: newMode });
     this.applyMode(newMode);
   },

    bindModeToggle() {
      // For potential future use, e.g., keyboard shortcut
    },










};