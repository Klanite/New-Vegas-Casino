// Horse Racing Game
document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const horseBetInput = document.getElementById('horse-bet-input');
    const horseOptions = document.querySelectorAll('.horse-option');
    const startRaceBtn = document.getElementById('start-race-btn');
    const raceTrackLanes = document.getElementById('race-track-lanes');
    const horses = document.querySelectorAll('.race-lane .horse');
    
    // Game state
    let selectedHorse = null;
    let betAmount = 10;
    let isRacing = false;
    let raceInterval = null;
    let horsePositions = [0, 0, 0, 0, 0];
    let horseFinished = [false, false, false, false, false];
    let finishedHorses = [];
    let credits = 1000; // Starting credits
    
    // Initialize credits display from shared credits
    function updateCreditsDisplay() {
        const creditsElements = document.querySelectorAll('.credits-amount');
        creditsElements.forEach(element => {
            element.textContent = credits;
        });
    }
    
    // Try to get shared credits from other games
    const creditsElements = document.querySelectorAll('.credits-amount');
    if (creditsElements.length > 0) {
        credits = parseInt(creditsElements[0].textContent) || 1000;
        updateCreditsDisplay();
    }
    
    // Initialize bet input
    horseBetInput.addEventListener('change', function() {
        betAmount = parseInt(this.value);
        if (betAmount < 5) {
            betAmount = 5;
            this.value = 5;
        }
    });
    
    // Initialize horse selection
    horseOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Reset previous selection
            horseOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Reset all lane indicators to default style
            const laneIndicators = document.querySelectorAll('.lane-indicator');
            laneIndicators.forEach(indicator => {
                indicator.classList.remove('selected-lane');
            });
            
            // Set new selection
            this.classList.add('selected');
            selectedHorse = parseInt(this.getAttribute('data-horse'));
            
            // Highlight the selected horse's lane indicator
            if (selectedHorse && selectedHorse >= 1 && selectedHorse <= 5) {
                const selectedLaneIndicator = document.querySelector(`#lane-${selectedHorse} .lane-indicator`);
                if (selectedLaneIndicator) {
                    selectedLaneIndicator.classList.add('selected-lane');
                }
            }
            
            // Update the game with exciting but misleading message
            const horseName = getHorseName(selectedHorse);
            const raceTrack = document.getElementById('race-track');
            
            // Remove any previous messages
            const oldMessages = raceTrack.querySelectorAll('.selection-message');
            oldMessages.forEach(msg => msg.remove());
            
            // Create encouraging message
            const messageDiv = document.createElement('div');
            messageDiv.className = 'race-result selection-message';
            messageDiv.innerHTML = `<p>${horseName} looks ready to race! Great choice with impressive odds!</p>`;
            
            // Existing message will be removed when race starts
            raceTrack.appendChild(messageDiv);
            
            // Enable start button if bet is valid
            validateBet();
        });
    });
    
    // Validate bet
    function validateBet() {
        const isValid = selectedHorse !== null && betAmount > 0 && betAmount <= credits;
        startRaceBtn.disabled = !isValid || isRacing;
    }
    
    // Reset race
    function resetRace() {
        // Reset race state
        isRacing = false;
        horsePositions = [0, 0, 0, 0, 0];
        horseFinished = [false, false, false, false, false];
        finishedHorses = [];
        
        // Reset horse positions on the track
        horses.forEach(horse => {
            horse.style.left = '0px';
            horse.classList.remove('winner');
        });
        
        // Reset lane indicators
        const laneIndicators = document.querySelectorAll('.lane-indicator');
        laneIndicators.forEach(indicator => {
            indicator.classList.remove('selected-lane', 'winning-lane');
        });
        
        // If there was a selected horse, highlight its lane again
        if (selectedHorse && selectedHorse >= 1 && selectedHorse <= 5) {
            const selectedLaneIndicator = document.querySelector(`#lane-${selectedHorse} .lane-indicator`);
            if (selectedLaneIndicator) {
                selectedLaneIndicator.classList.add('selected-lane');
            }
        }
        
        // Remove any previous results and messages
        const oldResults = document.querySelectorAll('.race-result');
        oldResults.forEach(result => {
            result.remove();
        });
        
        // Enable horse selection
        horseOptions.forEach(option => {
            option.style.pointerEvents = 'auto';
        });
        
        // Enable start button if bet is valid
        validateBet();
    }
    
    // Start race
    startRaceBtn.addEventListener('click', function() {
        if (isRacing || selectedHorse === null) return;
        
        // Check if player has enough credits
        if (betAmount > credits) {
            alert('Not enough credits!');
            return;
        }
        
        // Deduct bet amount
        credits -= betAmount;
        updateCreditsDisplay();
        
        // Start the race
        isRacing = true;
        this.disabled = true;
        
        // Disable horse selection during race
        horseOptions.forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        // Play gallop sound
        if (window.playSFX && typeof window.playSFX.horseGallop === 'function') {
            window.playSFX.horseGallop();
        }
        
        // Track width (minus horse width)
        const trackWidth = raceTrackLanes.clientWidth - 30;
        
        // Racing logic
        raceInterval = setInterval(() => {
            let allFinished = true;
            
            // Move each horse
            for (let i = 0; i < 5; i++) {
                if (!horseFinished[i]) {
                    // Random movement based on "odds" - modified to heavily favor house
                    let moveAmount;
                    
                    // Check if this horse is the player's selected horse
                    const isPlayerHorse = (i + 1) === selectedHorse;
                    
                    // Very small random chance (1%) for player's horse to get a huge boost
                    const luckyBoost = Math.random() < 0.01 && isPlayerHorse;
                    
                    if (luckyBoost) {
                        // Lucky boost gives player's horse a chance to win
                        moveAmount = Math.random() * 8 + 5; // Big boost
                        console.log("Lucky boost for player's horse!");
                    } else {
                        // Normal movement with player horse disadvantage
                        switch (i) {
                            case 0: // Thunder (3:1)
                                moveAmount = isPlayerHorse ? Math.random() * 3 + 1 : Math.random() * 6 + 3;
                                break;
                            case 1: // Lightning (5:2)
                                moveAmount = isPlayerHorse ? Math.random() * 3 + 1 : Math.random() * 7 + 4;
                                break;
                            case 2: // Rocket (2:1)
                                moveAmount = isPlayerHorse ? Math.random() * 2 + 1 : Math.random() * 8 + 5;
                                break;
                            case 3: // Blizzard (4:1)
                                moveAmount = isPlayerHorse ? Math.random() * 2.5 + 1 : Math.random() * 6 + 3;
                                break;
                            case 4: // Hurricane (5:1)
                                moveAmount = isPlayerHorse ? Math.random() * 3 + 1 : Math.random() * 5 + 3;
                                break;
                        }
                    }
                    
                    // Update position
                    horsePositions[i] += moveAmount;
                    horses[i].style.left = `${horsePositions[i]}px`;
                    
                    // Check if horse finished
                    if (horsePositions[i] >= trackWidth) {
                        horsePositions[i] = trackWidth;
                        horses[i].style.left = `${trackWidth}px`;
                        horseFinished[i] = true;
                        finishedHorses.push(i + 1); // Horse numbers are 1-based
                    }
                    
                    allFinished = allFinished && horseFinished[i];
                }
            }
            
            // Check if race is over
            if (allFinished || finishedHorses.length >= 3) {
                clearInterval(raceInterval);
                endRace();
            }
        }, 50);
    });
    
    // End race and determine winner
    function endRace() {
        isRacing = false;
        
        // Highlight the winner
        if (finishedHorses.length > 0) {
            const winningHorse = finishedHorses[0];
            horses[winningHorse - 1].classList.add('winner');
            
            // Highlight the winning lane indicator
            const winningLaneIndicator = document.querySelector(`#lane-${winningHorse} .lane-indicator`);
            if (winningLaneIndicator) {
                winningLaneIndicator.classList.add('winning-lane');
            }
            
            // Create result message
            const raceTrack = document.getElementById('race-track');
            const resultDiv = document.createElement('div');
            resultDiv.className = 'race-result';
            
            let resultMessage = '';
            let winnings = 0;
            
            // Calculate winnings based on which horse won and the selected bet
            if (winningHorse === selectedHorse) {
                // Player won - calculate winnings based on odds with increased payouts
                switch (selectedHorse) {
                    case 1: // Thunder (now 6:1)
                        winnings = betAmount * 6;
                        break;
                    case 2: // Lightning (now 8:1)
                        winnings = betAmount * 8;
                        break;
                    case 3: // Rocket (now 5:1)
                        winnings = betAmount * 5;
                        break;
                    case 4: // Blizzard (now 10:1)
                        winnings = betAmount * 10;
                        break;
                    case 5: // Hurricane (now 12:1)
                        winnings = betAmount * 12;
                        break;
                }
                
                resultDiv.classList.add('win');
                // Add an extra class for jackpot-like animation
                resultDiv.classList.add('jackpot-win');
                
                resultMessage = `<h3>🏆 INCREDIBLE WIN! 🏆</h3>
                                <p>Against all odds, your horse ${getHorseName(selectedHorse)} won!</p>
                                <p>You bet $${betAmount} and won $${winnings}!</p>`;
                
                // Add winnings to credits
                credits += winnings;
                updateCreditsDisplay();
                
                // Play big win sound instead of regular win
                if (window.playSFX && typeof window.playSFX.bigWin === 'function') {
                    window.playSFX.bigWin();
                }
            } else {
                resultDiv.classList.add('lose');
                resultMessage = `<h3>Horse #${winningHorse} (${getHorseName(winningHorse)}) won the race!</h3>
                                <p>You bet on ${getHorseName(selectedHorse)} and lost $${betAmount}.</p>
                                <p>Better luck next time!</p>`;
            }
            
            resultDiv.innerHTML = resultMessage + '<button id="race-again-btn" class="game-btn">Race Again</button>';
            
            // Add the result to the race track
            raceTrack.appendChild(resultDiv);
            
            // Add event listener to the race again button
            document.getElementById('race-again-btn').addEventListener('click', resetRace);
        }
    }
    
    // Helper function to get horse name by number
    function getHorseName(horseNumber) {
        const horseNames = ['Thunder', 'Lightning', 'Rocket', 'Blizzard', 'Hurricane'];
        return horseNames[horseNumber - 1] || `Horse #${horseNumber}`;
    }
    
    // Initialize the game
    resetRace();
}); 