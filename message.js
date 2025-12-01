// Message module
const Message = {
    show(containerId, text, type = 'info') {
        const msgDiv = document.getElementById(containerId + '-message');
        if (msgDiv) {
            msgDiv.textContent = text;
            msgDiv.className = `system-message ${type}`;
            msgDiv.classList.add('active');
            msgDiv.style.display = 'block';

            // Manage section visibility
            this.updateSectionVisibility(containerId, 'message');
        }
    },

    hide(containerId) {
        const msgDiv = document.getElementById(containerId + '-message');
        if (msgDiv) {
            msgDiv.style.display = 'none';
            msgDiv.classList.remove('active');

            // Show normal card interaction when hiding message
            if (containerId === 'review') {
                this.updateSectionVisibility(containerId, 'normal');
            }
        }
    },

    updateSectionVisibility(containerId, state) {
        if (containerId !== 'review') return;

        const deckMessageSection = document.querySelector('.deck-message-section');
        const cardInteractionSection = document.querySelector('.card-interaction-section');

        // Hide review sections first
        if (deckMessageSection) deckMessageSection.style.display = 'none';
        if (cardInteractionSection) cardInteractionSection.style.display = 'none';

        // Show appropriate section based on state
        switch (state) {
            case 'message':
                if (deckMessageSection) deckMessageSection.style.display = 'flex';
                break;
            case 'normal':
                if (cardInteractionSection) cardInteractionSection.style.display = 'flex';
                break;
        }
    }
};