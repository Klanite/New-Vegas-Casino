// Game navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const gameButtons = document.querySelectorAll('.game-btn[data-game]');
    const gameContainers = document.querySelectorAll('.game-container');
    
    gameButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the game type from data attribute
            const gameType = this.getAttribute('data-game');
            
            // Update active button state
            gameButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all game containers
            gameContainers.forEach(container => {
                container.style.display = 'none';
            });
            
            // Show the selected game container
            const selectedGame = document.getElementById(`${gameType}-game`);
            if (selectedGame) {
                selectedGame.style.display = 'block';
            }
        });
    });
}); 