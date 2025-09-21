// Message module
const Message = {
    show(containerId, text, type = 'info') {
        const msgDiv = document.getElementById(containerId + '-message');
        if (msgDiv) {
            msgDiv.textContent = text;
            msgDiv.className = `system-message ${type}`;
            msgDiv.classList.add('active');
            msgDiv.style.display = 'block';
            // Hide buttons when showing message in card-container
            if (containerId === 'card-container') {
                const buttons = document.getElementById('card-buttons');
                if (buttons) {
                    buttons.style.display = 'none';
                }
            }
        }
    },

    hide(containerId) {
        const msgDiv = document.getElementById(containerId + '-message');
        if (msgDiv) {
            msgDiv.style.display = 'none';
            msgDiv.classList.remove('active');
            // Buttons will be shown by applyDirectionAndFlip when card is rendered
        }
    }
};