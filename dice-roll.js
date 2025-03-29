// Dice Roll Game Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Game state
    let currentBet = 10;
    let rolling = false;
    let soundEnabled = true;
    let gamePhase = 'betting'; // betting, rolling
    let diceSum = null;
    let selectedBet = null; // 'high', 'low', or 'seven'
    
    // DOM Elements
    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');
    const diceSumDisplay = document.getElementById('dice-sum');
    const betInput = document.querySelector('#dice-roll-game .bet-input');
    const betUpButton = document.querySelector('#dice-roll-game .bet-up');
    const betDownButton = document.querySelector('#dice-roll-game .bet-down');
    const rollButton = document.getElementById('roll-button');
    const highButton = document.getElementById('high-button');
    const lowButton = document.getElementById('low-button');
    const sevenButton = document.getElementById('seven-button');
    const message = document.querySelector('.dice-message');
    const soundButton = document.querySelector('.sound-button');
    const betControls = document.querySelector('.bet-controls');
    const diceButtons = document.querySelector('.dice-buttons');
    
    // Initialize the game
    function init() {
        updateMoney();
        updateBet(currentBet);
        setupEventListeners();
        updateMessage('Select your bet type and amount, then click Roll!');
        
        // Initially hide the roll button, show betting controls
        rollButton.style.display = 'none';
        rollButton.disabled = true;
        betControls.style.display = 'flex';
        diceButtons.style.display = 'flex';
    }
    
    // Show betting controls
    function showBettingControls() {
        betControls.style.display = 'flex';
        diceButtons.style.display = 'flex';
        rollButton.style.display = 'none';
        rollButton.disabled = true;
    }
    
    // Hide betting controls
    function hideBettingControls() {
        betControls.style.display = 'none';
        diceButtons.style.display = 'none';
        rollButton.style.display = 'block';
        rollButton.disabled = false;
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
                if (!rolling && gameState.getCredits() >= currentBet && selectedBet) {
                    playSound('buttonClick');
                    startRoll();
                } else if (!selectedBet) {
                    updateMessage('Please select a bet type first!');
                } else if (gameState.getCredits() < currentBet) {
                    updateMessage('Not enough credits for this bet!');
                }
            });
        }
        
        // High button
        if (highButton) {
            highButton.addEventListener('click', () => {
                if (gamePhase === 'betting') {
                    playSound('buttonClick');
                    selectBet('high');
                }
            });
        }
        
        // Low button
        if (lowButton) {
            lowButton.addEventListener('click', () => {
                if (gamePhase === 'betting') {
                    playSound('buttonClick');
                    selectBet('low');
                }
            });
        }
        
        // Seven button
        if (sevenButton) {
            sevenButton.addEventListener('click', () => {
                if (gamePhase === 'betting') {
                    playSound('buttonClick');
                    selectBet('seven');
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
    
    // Select bet type
    function selectBet(type) {
        selectedBet = type;
        highButton.classList.remove('active');
        lowButton.classList.remove('active');
        sevenButton.classList.remove('active');
        
        switch(type) {
            case 'high':
                highButton.classList.add('active');
                updateMessage(`Betting High (8-12) for ${currentBet} credits`);
                break;
            case 'low':
                lowButton.classList.add('active');
                updateMessage(`Betting Low (2-6) for ${currentBet} credits`);
                break;
            case 'seven':
                sevenButton.classList.add('active');
                updateMessage(`Betting Seven (7) for ${currentBet} credits`);
                break;
        }
        
        // Show roll button and enable it
        rollButton.style.display = 'block';
        diceButtons.style.display = 'flex';
        rollButton.disabled = false;
    }
    
    // Start the roll
    function startRoll() {
        if (rolling) return;
        
        rolling = true;
        gameState.removeCredits(currentBet);
        updateMoney();
        
        // Hide betting controls
        hideBettingControls();
        
        // Generate random dice values with a bias against the player's choice
        let value1, value2;
        const unfavorableOutcome = Math.random() < 0.7; // 70% chance of unfavorable outcome
        
        if (unfavorableOutcome) {
            // Generate dice values that are unlikely to match the player's bet
            switch(selectedBet) {
                case 'high': // Player bet on 8-12, so we try to roll 2-7
                    value1 = Math.floor(Math.random() * 3) + 1; // 1-3
                    value2 = Math.floor(Math.random() * 4) + 1; // 1-4
                    break;
                case 'low': // Player bet on 2-6, so we try to roll 7-12
                    value1 = Math.floor(Math.random() * 3) + 3; // 3-5
                    value2 = Math.floor(Math.random() * 3) + 3; // 3-5
                    break;
                case 'seven': // Player bet on 7, so we try to avoid 7
                    // Generate either a high (8-12) or low (2-6) sum
                    if (Math.random() < 0.5) {
                        value1 = Math.floor(Math.random() * 3) + 1; // 1-3
                        value2 = Math.floor(Math.random() * 3) + 1; // 1-3
                    } else {
                        value1 = Math.floor(Math.random() * 3) + 4; // 4-6
                        value2 = Math.floor(Math.random() * 3) + 4; // 4-6
                    }
                    break;
                default:
                    // Shouldn't happen, but just in case
                    value1 = Math.floor(Math.random() * 6) + 1;
                    value2 = Math.floor(Math.random() * 6) + 1;
            }
        } else {
            // 30% chance of fair roll
            value1 = Math.floor(Math.random() * 6) + 1;
            value2 = Math.floor(Math.random() * 6) + 1;
        }
        
        diceSum = value1 + value2;
        
        // Play roll sound
        playSound('chipStack');
        
        // Animate dice
        animateDice(value1, value2);
        
        // Wait for animation to complete
        setTimeout(() => {
            rolling = false;
            checkWin();
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
            
            // Update sum display
            diceSumDisplay.textContent = diceSum;
        }, 1000);
    }
    
    // Get dice symbol
    function getDiceSymbol(value) {
        const symbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return symbols[value - 1];
    }
    
    // Check win
    function checkWin() {
        let won = false;
        let multiplier = 1;
        
        switch(selectedBet) {
            case 'high':
                if (diceSum >= 8 && diceSum <= 12) {
                    won = true;
                    multiplier = 2;
                }
                break;
            case 'low':
                if (diceSum >= 2 && diceSum <= 6) {
                    won = true;
                    multiplier = 2;
                }
                break;
            case 'seven':
                if (diceSum === 7) {
                    won = true;
                    multiplier = 5;
                }
                break;
        }
        
        if (won) {
            const winAmount = currentBet * multiplier;
            gameState.addCredits(winAmount);
            updateMessage(`🎉 You won ${winAmount} credits! Sum is ${diceSum}! 🎉`);
            playSound('win');
            dice1.classList.add('winning');
            dice2.classList.add('winning');
        } else {
            updateMessage(`You lost! Sum is ${diceSum}`);
            playSound('lose');
            dice1.classList.add('losing');
            dice2.classList.add('losing');
        }
        
        updateMoney();
        
        // Reset game after delay
        setTimeout(() => {
            resetGame();
        }, 2000);
    }
    
    // Reset game state
    function resetGame() {
        gamePhase = 'betting';
        diceSum = null;
        selectedBet = null;
        diceSumDisplay.textContent = '-';
        dice1.classList.remove('winning', 'losing');
        dice2.classList.remove('winning', 'losing');
        highButton.classList.remove('active');
        lowButton.classList.remove('active');
        sevenButton.classList.remove('active');
        rollButton.disabled = true;
        updateMessage('Select your bet type and amount, then click Roll!');
        showBettingControls();
    }
    
    // Update money display
    function updateMoney() {
        const creditsDisplay = document.querySelector('#dice-roll-game .credits-amount');
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
    
    // Add the missing updateBetInput function
    function updateBetInput() {
        if (betInput) {
            betInput.value = currentBet;
        }
    }
    
    // Change bet amount
    function changeBet(amount) {
        const newBet = currentBet + amount;
        if (newBet >= 5 && newBet <= gameState.getCredits()) {
            currentBet = newBet;
            updateBetInput();
            if (selectedBet) {
                selectBet(selectedBet);
            }
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
            if (selectedBet) {
                selectBet(selectedBet);
            }
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