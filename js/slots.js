// Slots Game Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Game state
    let currentBet = 10;
    let spinning = false;
    let soundEnabled = true;
    let jackpotAmount = 50000; // Starting jackpot amount
    
    // DOM Elements
    const reels = document.querySelectorAll('.reel');
    const symbols = document.querySelectorAll('.symbol');
    const creditsDisplay = document.getElementById('credits');
    const betInput = document.getElementById('bet-input');
    const spinButton = document.querySelector('#spin-button');
    const message = document.getElementById('message');
    const lever = document.querySelector('.lever');
    const soundButton = document.querySelector('.sound-button');
    const jackpotDisplay = document.getElementById('jackpot');
    const backgroundMusic = document.getElementById('background-music');
    
    // Audio elements
    const sounds = {
        spin: 'spin',
        win: 'win',
        bigWin: 'bigWin',
        reelStop: 'reelStop',
        leverPull: 'leverPull',
        buttonClick: 'click'
    };
    
    // Initialize the game
    function init() {
        // Set initial values
        updateMoney();
        updateBet(currentBet);
        updateJackpot(jackpotAmount);
        
        // Set initial symbols
        reels.forEach((reel, index) => {
            setSymbol(index, getRandomSymbol());
        });
        
        // Set up event listeners
        setupEventListeners();
        
        // Start background music
        if (backgroundMusic) {
            backgroundMusic.volume = 0.3; // Set volume to 30%
            backgroundMusic.loop = true;
            let musicPromise = backgroundMusic.play();
            if (musicPromise !== undefined) {
                musicPromise.catch(error => {
                    console.log('Auto-play prevented:', error);
                });
            }
        }
        
        // Initial message
        updateMessage('Welcome to New Vegas Casino! Place your bet and pull the lever to play.');
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
        
        // Lever click
        if (lever) {
            lever.addEventListener('click', () => {
                if (!spinning && gameState.getCredits() >= currentBet) {
                    playSound('leverPull');
                    // Animate lever
                    lever.classList.add('pulled');
                    setTimeout(() => lever.classList.remove('pulled'), 500);
                    startSpin();
                } else if (gameState.getCredits() < currentBet) {
                    updateMessage('Not enough credits for this bet!');
                }
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
        
        // Bet input
        if (betInput) {
            betInput.addEventListener('change', () => {
                const newBet = parseInt(betInput.value);
                if (isNaN(newBet) || newBet < 5) {
                    updateBet(5);
                } else if (newBet > gameState.getCredits()) {
                    updateBet(gameState.getCredits());
                    updateMessage('Bet amount cannot exceed your credits!');
                } else {
                    updateBet(newBet);
                }
                playSound('buttonClick');
            });
        }
    }
    
    // Start the spin
    function startSpin() {
        if (spinning) return;
        
        spinning = true;
        gameState.removeCredits(currentBet);
        updateMoney();
        
        // Increase jackpot by exact bet amount
        jackpotAmount += currentBet;
        updateJackpot(jackpotAmount);
        
        // Play spin sound
        playSound('spin');
        
        // Clear previous win states
        clearWinStates();
        
        // Pre-determine results with a 70% chance of ensuring no three-of-a-kind
        const results = [];
        const forceNonMatch = Math.random() < 0.7;
        
        if (forceNonMatch) {
            // Ensure we have at least one different symbol
            results.push(getRandomSymbol());
            
            // Make sure second symbol is different from first
            let secondSymbol;
            do {
                secondSymbol = getRandomSymbol();
            } while (secondSymbol === results[0]);
            results.push(secondSymbol);
            
            // Third symbol can be anything (allows for two-of-a-kind)
            results.push(getRandomSymbol());
        } else {
            // Normal random results (small chance of three-of-a-kind)
            for (let i = 0; i < 3; i++) {
                results.push(getRandomSymbol());
            }
        }
        
        // Start spinning animation for each reel
        reels.forEach(reel => {
            reel.classList.add('spinning');
            reel.classList.remove('winning');
        });
        
        // Stop reels after random delays
        reels.forEach((reel, i) => {
            const delay = (i + 1) * 500 + Math.random() * 200;
            setTimeout(() => {
                reel.classList.remove('spinning');
                setSymbol(i, results[i]); // Use pre-determined result
                playSound('reelStop');
                if (i === reels.length - 1) {
                    spinning = false;
                    checkWin(results);
                }
            }, delay);
        });
    }
    
    // Clear win states
    function clearWinStates() {
        reels.forEach(reel => {
            reel.classList.remove('winning');
        });
        symbols.forEach(symbol => {
            symbol.classList.remove('winning-symbol');
        });
    }
    
    // Check for win
    function checkWin(results) {
        // First check for three of a kind
        if (results[0] === results[1] && results[1] === results[2]) {
            const multiplier = getSymbolMultiplier(results[0]);
            const winAmount = currentBet * multiplier;
            
            if (results[0] === '7') { // Jackpot win
                playSound('bigWin');
                const totalWin = winAmount + jackpotAmount;
                updateMessage(`🎰 MEGA JACKPOT! 🎰 You won ${totalWin.toLocaleString()} credits!`);
                gameState.addCredits(totalWin);
                jackpotAmount = 50000; // Reset jackpot after win
            } else {
                playSound('win');
                updateMessage(`💰 Three ${results[0]}! You won ${winAmount.toLocaleString()} credits! 💰`);
                gameState.addCredits(winAmount);
            }
            
            // Highlight winning reels
            reels.forEach(reel => reel.classList.add('winning'));
        }
        // Check for two of a kind
        else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            const winAmount = currentBet * 2;
            playSound('win');
            
            let matchSymbol;
            if (results[0] === results[1]) matchSymbol = results[0];
            else if (results[1] === results[2]) matchSymbol = results[1];
            else matchSymbol = results[0];
            
            updateMessage(`✨ Two ${matchSymbol}! You won ${winAmount.toLocaleString()} credits! ✨`);
            gameState.addCredits(winAmount);
            
            // Highlight matching reels
            if (results[0] === results[1]) {
                reels[0].classList.add('winning');
                reels[1].classList.add('winning');
            } else if (results[1] === results[2]) {
                reels[1].classList.add('winning');
                reels[2].classList.add('winning');
            } else {
                reels[0].classList.add('winning');
                reels[2].classList.add('winning');
            }
        } else {
            updateMessage('Try again! 🎲');
        }
        
        updateMoney();
        updateJackpot(jackpotAmount);
    }
    
    // Get multiplier for symbol
    function getSymbolMultiplier(symbol) {
        const multipliers = {
            '7': 200,   // Seven (jackpot)
            '💎': 100,  // Diamond
            '🎩': 50,   // Top hat
            '🥃': 40,   // Whiskey glass
            '🎲': 30,   // Dice
            '🃏': 20,   // Joker card
            '🎭': 15    // Theater masks
        };
        return multipliers[symbol] || 0;
    }
    
    // Get random symbol
    function getRandomSymbol() {
        const symbols = ['🎩', '🥃', '🎲', '🃏', '🎭', '💎', '7'];
        // Heavily adjusted weights to make winning less likely but still possible
        // Lower numbers mean rarer occurrence
        const weights = [20, 20, 20, 20, 20, 5, 1]; // Diamond and 7 much rarer now
        
        let total = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * total;
        
        for (let i = 0; i < weights.length; i++) {
            if (random < weights[i]) return symbols[i];
            random -= weights[i];
        }
        
        return symbols[0]; // Fallback
    }
    
    // Set symbol on reel
    function setSymbol(index, symbol) {
        const symbolElement = reels[index].querySelector('.symbol');
        if (symbolElement) {
            symbolElement.textContent = symbol;
        }
    }
    
    // Update money display
    function updateMoney() {
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
        if (window.playSFX && typeof window.playSFX[sounds[soundId]] === 'function') {
            window.playSFX[sounds[soundId]]();
        }
    }
    
    // Toggle sound
    function toggleSound() {
        soundEnabled = !soundEnabled;
        const soundButton = document.querySelector('.sound-button i');
        if (soundButton) {
            soundButton.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
        
        // Toggle background music
        if (backgroundMusic) {
            if (soundEnabled) {
                let musicPromise = backgroundMusic.play();
                if (musicPromise !== undefined) {
                    musicPromise.catch(error => {
                        console.log('Music play prevented:', error);
                    });
                }
            } else {
                backgroundMusic.pause();
            }
        }
    }
    
    // Update jackpot display
    function updateJackpot(amount) {
        if (jackpotDisplay) {
            jackpotDisplay.textContent = amount.toLocaleString();
        }
    }
    
    // Initialize the game
    init();
}); 