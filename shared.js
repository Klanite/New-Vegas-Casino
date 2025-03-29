// Shared game state
const gameState = {
    credits: 1000,
    updateCredits: function(amount) {
        this.credits = amount;
        // Update all credit displays
        document.querySelectorAll('.credits-amount').forEach(display => {
            display.textContent = this.credits;
        });
    },
    addCredits: function(amount) {
        this.updateCredits(this.credits + amount);
    },
    removeCredits: function(amount) {
        this.updateCredits(this.credits - amount);
    },
    getCredits: function() {
        return this.credits;
    }
};

// Initialize credits displays when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    gameState.updateCredits(gameState.credits);
}); 