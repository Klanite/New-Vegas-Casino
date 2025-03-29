// Roulette Game Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Game state
    let currentBet = 10;
    let spinning = false;
    let soundEnabled = true;
    
    // DOM Elements
    const wheel = document.querySelector('.roulette-wheel');
    const wheelNumbers = document.querySelector('.wheel-numbers');
    const betInput = document.querySelector('#roulette-game .bet-input');
    const betUpButton = document.querySelector('#roulette-game .bet-up');
    const betDownButton = document.querySelector('#roulette-game .bet-down');
    const spinButton = document.querySelector('#roulette-game .action-btn');
    const message = document.querySelector('.roulette-message');
    const soundButton = document.querySelector('.sound-button');
    
    // Roulette numbers and their properties
    const numbers = [
        { value: 0, color: 'green' },
        { value: 32, color: 'red' }, { value: 15, color: 'black' }, { value: 19, color: 'red' },
        { value: 4, color: 'black' }, { value: 21, color: 'red' }, { value: 2, color: 'black' },
        { value: 25, color: 'red' }, { value: 17, color: 'black' }, { value: 34, color: 'red' },
        { value: 6, color: 'black' }, { value: 27, color: 'red' }, { value: 13, color: 'black' },
        { value: 36, color: 'red' }, { value: 11, color: 'black' }, { value: 30, color: 'red' },
        { value: 8, color: 'black' }, { value: 23, color: 'red' }, { value: 10, color: 'black' },
        { value: 5, color: 'red' }, { value: 24, color: 'black' }, { value: 16, color: 'red' },
        { value: 33, color: 'black' }, { value: 1, color: 'red' }, { value: 20, color: 'black' },
        { value: 14, color: 'red' }, { value: 31, color: 'black' }, { value: 9, color: 'red' },
        { value: 22, color: 'black' }, { value: 18, color: 'red' }, { value: 29, color: 'black' },
        { value: 7, color: 'red' }, { value: 28, color: 'black' }, { value: 12, color: 'red' },
        { value: 35, color: 'black' }, { value: 3, color: 'red' }, { value: 26, color: 'black' }
    ];
    
    // Initialize the game
    function init() {
        createWheel();
        updateMoney();
        updateBet(currentBet);
        setupEventListeners();
        updateMessage('Place your bet and click Spin to play!');
    }
    
    // Create the wheel numbers
    function createWheel() {
        numbers.forEach((num, index) => {
            const numberEl = document.createElement('div');
            numberEl.className = `number ${num.color}`;
            numberEl.textContent = num.value;
            
            // Calculate position on wheel
            const angle = (index * 360) / numbers.length;
            const radius = 120; // Adjust based on wheel size
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;
            
            numberEl.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
            wheelNumbers.appendChild(numberEl);
        });
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
        
        // Spin button
        if (spinButton) {
            spinButton.addEventListener('click', () => {
                if (!spinning && gameState.getCredits() >= currentBet) {
                    playSound('buttonClick');
                    startSpin();
                } else if (gameState.getCredits() < currentBet) {
                    updateMessage('Not enough credits for this bet!');
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
    
    // Start the spin
    function startSpin() {
        if (spinning) return;
        
        spinning = true;
        gameState.removeCredits(currentBet);
        updateMoney();
        
        // Generate random number
        const result = Math.floor(Math.random() * numbers.length);
        const selectedNumber = numbers[result];
        
        // Calculate spin duration and rotations
        const rotations = 5 + Math.random() * 2;
        const duration = 5000 + Math.random() * 1000;
        
        // Play spin sound
        playSound('rouletteSpin');
        
        // Animate wheel
        wheel.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
        wheel.style.transform = `rotate(${rotations * 360 + (360 - (result * 360 / numbers.length))}deg)`;
        
        // Wait for animation to complete
        setTimeout(() => {
            wheel.style.transition = 'none';
            spinning = false;
            checkWin(selectedNumber);
        }, duration);
    }
    
    // Check for win
    function checkWin(selectedNumber) {
        let winAmount = 0;
        
        // Check for exact number match
        if (selectedNumber.value === parseInt(betInput.value)) {
            winAmount = currentBet * 35;
            updateMessage(`🎉 Lucky number ${selectedNumber.value}! You won ${winAmount} credits! 🎉`);
        }
        // Check for color match
        else if (selectedNumber.color === 'red' && betInput.value === 'red') {
            winAmount = currentBet * 2;
            updateMessage(`🎨 Red wins! You won ${winAmount} credits! 🎨`);
        }
        else if (selectedNumber.color === 'black' && betInput.value === 'black') {
            winAmount = currentBet * 2;
            updateMessage(`🎨 Black wins! You won ${winAmount} credits! 🎨`);
        }
        // Check for even/odd
        else if (selectedNumber.value !== 0) {
            if (selectedNumber.value % 2 === 0 && betInput.value === 'even') {
                winAmount = currentBet * 2;
                updateMessage(`✨ Even wins! You won ${winAmount} credits! ✨`);
            }
            else if (selectedNumber.value % 2 === 1 && betInput.value === 'odd') {
                winAmount = currentBet * 2;
                updateMessage(`✨ Odd wins! You won ${winAmount} credits! ✨`);
            }
        }
        
        if (winAmount > 0) {
            gameState.addCredits(winAmount);
            playSound('win');
        } else {
            updateMessage('Try again! 🎲');
        }
        
        updateMoney();
    }
    
    // Update money display
    function updateMoney() {
        const creditsDisplay = document.querySelector('#roulette-game .credits-amount');
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