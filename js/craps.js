// Craps Game Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Game state
    let currentBet = 10;
    let rolling = false;
    let soundEnabled = true;
    let gamePhase = 'betting'; // betting, rolling, point
    let pointNumber = null;
    
    // DOM Elements
    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');
    const betInput = document.querySelector('#craps-game .bet-input');
    const betUpButton = document.querySelector('#craps-game .bet-up');
    const betDownButton = document.querySelector('#craps-game .bet-down');
    const rollButton = document.getElementById('roll-button');
    const passButton = document.getElementById('pass-button');
    const dontPassButton = document.getElementById('dont-pass-button');
    const message = document.querySelector('.craps-message');
    const soundButton = document.querySelector('.sound-button');
    
    // Initialize the game
    function init() {
        updateMoney();
        updateBet(currentBet);
        setupEventListeners();
        updateMessage('Place your bet and click Roll to start!');
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Sound button
        if (soundButton) {
            soundButton.addEventListener('click', () => {
                playSound('buttonClick');
                toggleSound();
            });
        }
        
        // Roll button
        if (rollButton) {
            rollButton.addEventListener('click', () => {
                if (!rolling && gameState.getCredits() >= currentBet) {
                    playSound('buttonClick');
                    startRoll();
                } else if (gameState.getCredits() < currentBet) {
                    updateMessage('Not enough credits for this bet!');
                }
            });
        }
        
        // Pass button
        if (passButton) {
            passButton.addEventListener('click', () => {
                if (gamePhase === 'point') {
                    playSound('buttonClick');
                    checkPassWin();
                }
            });
        }
        
        // Don't Pass button
        if (dontPassButton) {
            dontPassButton.addEventListener('click', () => {
                if (gamePhase === 'point') {
                    playSound('buttonClick');
                    checkDontPassWin();
                }
            });
        }
        
        // Bet controls
        if (betUpButton) {
            betUpButton.addEventListener('click', () => changeBet(5));
        }
        
        if (betDownButton) {
            betDownButton.addEventListener('click', () => changeBet(-5));
        }
        
        if (betInput) {
            betInput.addEventListener('input', handleBetInput);
            betInput.addEventListener('focus', function() {
                this.select();
            });
            betInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    this.blur();
                }
            });
        }
    }
    
    // Start the roll
    function startRoll() {
        if (rolling) return;
        
        rolling = true;
        gameState.removeCredits(currentBet);
        updateMoney();
        
        // Generate random dice values
        const value1 = Math.floor(Math.random() * 6) + 1;
        const value2 = Math.floor(Math.random() * 6) + 1;
        const total = value1 + value2;
        
        // Play roll sound
        playSound('chipStack');
        
        // Animate dice
        animateDice(value1, value2);
        
        // Wait for animation to complete
        setTimeout(() => {
            rolling = false;
            handleRollResult(total);
        }, 1000);
    }
    
    // Animate dice
    function animateDice(value1, value2) {
        // Add rolling animation
        dice1.classList.add('rolling');
        dice2.classList.add('rolling');
        
        // Remove rolling animation after delay
        setTimeout(() => {
            dice1.classList.remove('rolling');
            dice2.classList.remove('rolling');
            
            // Set final values
            dice1.querySelector('.front').textContent = getDiceSymbol(value1);
            dice2.querySelector('.front').textContent = getDiceSymbol(value2);
        }, 1000);
    }
    
    // Get dice symbol
    function getDiceSymbol(value) {
        const symbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return symbols[value - 1];
    }
    
    // Handle roll result
    function handleRollResult(total) {
        if (gamePhase === 'betting') {
            // First roll
            if (total === 7 || total === 11) {
                // Pass line wins
                gameState.addCredits(currentBet * 2);
                updateMessage(`🎉 Lucky ${total}! Pass line wins! 🎉`);
                playSound('win');
                resetGame();
            } else if (total === 2 || total === 3 || total === 12) {
                // Pass line loses
                updateMessage('Craps! Pass line loses!');
                resetGame();
            } else {
                // Point is established
                pointNumber = total;
                gamePhase = 'point';
                updateMessage(`Point is ${pointNumber}! Roll again!`);
                updateButtons();
            }
        } else if (gamePhase === 'point') {
            if (total === pointNumber) {
                // Point made
                gameState.addCredits(currentBet * 2);
                updateMessage(`🎉 Point made! You win! 🎉`);
                playSound('win');
                resetGame();
            } else if (total === 7) {
                // Seven out
                updateMessage('Seven out! Pass line loses!');
                resetGame();
            } else {
                // Roll again
                updateMessage(`Roll again! Point is ${pointNumber}`);
            }
        }
        
        updateMoney();
    }
    
    // Check pass line win
    function checkPassWin() {
        if (pointNumber === 7) {
            gameState.addCredits(currentBet * 2);
            updateMessage(`🎉 Point made! You win! 🎉`);
            playSound('win');
        } else {
            updateMessage('Seven out! Pass line loses!');
        }
        resetGame();
        updateMoney();
    }
    
    // Check don't pass win
    function checkDontPassWin() {
        if (pointNumber === 7) {
            updateMessage('Seven out! Don\'t pass loses!');
        } else {
            gameState.addCredits(currentBet * 2);
            updateMessage(`🎉 Point not made! Don't pass wins! 🎉`);
            playSound('win');
        }
        resetGame();
        updateMoney();
    }
    
    // Reset game state
    function resetGame() {
        gamePhase = 'betting';
        pointNumber = null;
        updateButtons();
        updateMessage('Place your bet and click Roll to start!');
    }
    
    // Update button states
    function updateButtons() {
        rollButton.disabled = rolling;
        passButton.disabled = gamePhase !== 'point';
        dontPassButton.disabled = gamePhase !== 'point';
    }
    
    // Update money display
    function updateMoney() {
        const creditsDisplay = document.querySelector('#craps-game .credits-amount');
        if (creditsDisplay) {
            creditsDisplay.textContent = gameState.getCredits();
        }
    }
    
    // Update bet amount
    function updateBet(amount) {
        currentBet = amount;
        if (betInput) {
            betInput.value = amount;
        }
    }
    
    // Change bet amount
    function changeBet(amount) {
        const newBet = currentBet + amount;
        if (newBet >= 5 && newBet <= gameState.getCredits()) {
            currentBet = newBet;
            updateBetInput();
            updateMessage(`Bet set to ${currentBet} credits`);
        } else if (newBet < 5) {
            updateMessage('Minimum bet is 5 credits');
        } else {
            updateMessage('Not enough credits for that bet');
        }
    }
    
    // Handle manual bet input
    function handleBetInput(event) {
        const newBet = parseInt(event.target.value);
        if (isNaN(newBet)) {
            currentBet = 5;
            updateMessage('Please enter a valid number');
        } else if (newBet < 5) {
            currentBet = 5;
            updateMessage('Minimum bet is 5 credits');
        } else if (newBet > gameState.getCredits()) {
            currentBet = gameState.getCredits();
            updateMessage('Bet amount cannot exceed your credits');
        } else {
            currentBet = newBet;
            updateMessage(`Bet set to ${currentBet} credits`);
        }
        updateBetInput();
    }
    
    // Update message display
    function updateMessage(text) {
        if (message) {
            message.textContent = text;
        }
    }
    
    // Play sound effect
    function playSound(soundId) {
        if (!soundEnabled) return;
        
        // Use the Web Audio API sound effects
        if (window.playSFX && typeof window.playSFX[soundId] === 'function') {
            window.playSFX[soundId]();
        }
    }
    
    // Toggle sound
    function toggleSound() {
        soundEnabled = !soundEnabled;
        const soundButton = document.querySelector('.sound-button i');
        if (soundButton) {
            soundButton.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
    }
    
    // Initialize the game
    init();
}); 