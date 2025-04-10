// Arcade Game - Slot Machine
document.addEventListener('DOMContentLoaded', function() {
    console.log('Arcade game loading...');
    
    // Game elements
    const spinButton = document.getElementById('arcade-spin-btn');
    const arcadeDisplay = document.getElementById('arcade-display');
    const resultDisplay = document.getElementById('arcade-result');
    const creditsElements = document.querySelectorAll('.credits-amount');
    
    // Check if elements exist
    if (!spinButton) console.error('Missing spin button');
    if (!arcadeDisplay) console.error('Missing arcade display');
    if (!resultDisplay) console.error('Missing result display');
    
    console.log('Arcade element status:', { 
        spinButton: spinButton ? 'found' : 'missing', 
        arcadeDisplay: arcadeDisplay ? 'found' : 'missing', 
        resultDisplay: resultDisplay ? 'found' : 'missing' 
    });
    
    // If any critical element is missing, create a fallback message
    if (!spinButton || !arcadeDisplay || !resultDisplay) {
        console.error('Critical elements missing - creating fallback');
        const arcadeGame = document.querySelector('.arcade-game');
        if (arcadeGame) {
            arcadeGame.innerHTML = `
                <div style="color: red; padding: 20px; text-align: center;">
                    <h3>Game Error</h3>
                    <p>Could not initialize arcade game. Please refresh the page.</p>
                </div>
            `;
        }
        return;
    }
    
    // Game items with icons - using simpler icons that definitely exist in Font Awesome 6
    const reelItems = [
        { symbol: '<i class="fas fa-trophy"></i>', type: "jackpot", name: "Jackpot", multiplier: 10 },
        { symbol: '<i class="fas fa-gem"></i>', type: "win", name: "Diamond", multiplier: 5 },
        { symbol: '<i class="fas fa-apple-alt"></i>', type: "win", name: "Cherry", multiplier: 3 },
        { symbol: '<i class="fas fa-bell"></i>', type: "win", name: "Bell", multiplier: 2 },
        { symbol: '<i class="fas fa-star"></i>', type: "win", name: "Star", multiplier: 1.5 },
        { symbol: '<i class="fas fa-lemon"></i>', type: "lose", name: "Lemon", multiplier: -1 },
        { symbol: '<i class="fas fa-times"></i>', type: "lose", name: "X", multiplier: -1 },
        { symbol: '<i class="fas fa-bomb"></i>', type: "biglose", name: "Bomb", multiplier: -2 }
    ];
    
    // Game state
    let betAmount = 10;
    let credits = 1000;
    let isSpinning = false;
    
    // Initialize the game
    function init() {
        console.log('Initializing arcade game...');
        
        // Create initial reel display
        resetReel();
        
        // Get current credits from other games
        if (creditsElements.length > 0) {
            credits = parseInt(creditsElements[0].textContent) || 1000;
            updateCredits();
        }
        
        // Setup bet controls
        setupBetControls();
        
        // Set up spin button
        spinButton.addEventListener('click', handleSpin);
        
        console.log('Arcade game initialized successfully');
    }
    
    // Reset and generate new reel items
    function resetReel() {
        console.log('Resetting reel...');
        const reelHtml = generateReelItems();
        arcadeDisplay.innerHTML = reelHtml;
        console.log('Reel HTML generated:', reelHtml.substring(0, 100) + '...');
    }
    
    // Generate reel items HTML
    function generateReelItems() {
        console.log('Generating reel items...');
        let html = '';
        
        // Create exactly 9 items for consistent animation
        for (let i = 0; i < 9; i++) {
            const randomIndex = Math.floor(Math.random() * reelItems.length);
            const item = reelItems[randomIndex];
            html += `<div class="reel-item" data-type="${item.type}" data-name="${item.name}" data-multiplier="${item.multiplier}">
                <div class="symbol">${item.symbol}</div>
            </div>`;
        }
        
        console.log('Generated items with types:', html.match(/data-type="([^"]+)"/g));
        return html;
    }
    
    // Setup bet controls
    function setupBetControls() {
        console.log('Setting up bet controls...');
        const betButtons = document.querySelectorAll('.bet-btn');
        betButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                if (isSpinning) return;
                
                if (this.classList.contains('bet-down') && betAmount > 5) {
                    betAmount -= 5;
                } else if (this.classList.contains('bet-up') && betAmount < credits) {
                    betAmount += 5;
                }
                
                const currentBetElement = document.querySelector('.current-bet');
                if (currentBetElement) {
                    currentBetElement.textContent = betAmount;
                }
            });
        });
    }
    
    // Update credits display
    function updateCredits() {
        creditsElements.forEach(element => {
            element.textContent = credits;
        });
    }
    
    // Handle spin button click
    function handleSpin() {
        console.log('Spin button clicked!');
        if (isSpinning) {
            console.log('Already spinning, ignoring click');
            return;
        }
        
        // Check if player has enough credits
        if (credits < betAmount) {
            showResult("Not enough credits!", "lose");
            return;
        }
        
        // Start spinning
        isSpinning = true;
        spinButton.disabled = true;
        
        // Deduct bet
        credits -= betAmount;
        updateCredits();
        
        // Clear previous results
        hideResult();
        
        // Create a new set of random items
        resetReel();
        
        // Make sure transform is reset before applying animation
        arcadeDisplay.style.transform = '';
        
        // Apply spin animation
        arcadeDisplay.classList.add('spinning');
        
        // Add button press effect
        spinButton.classList.add('pulled');
        setTimeout(() => {
            spinButton.classList.remove('pulled');
        }, 300);
        
        console.log('Started spinning animation');
        
        // After a delay, stop spinning and show result
        setTimeout(() => {
            console.log('Stopping spin animation');
            
            // Stop spinning and start stopping animation
            arcadeDisplay.classList.remove('spinning');
            
            // Get all items
            const items = arcadeDisplay.querySelectorAll('.reel-item');
            console.log(`Found ${items.length} reel items`);
            
            const middleIndex = Math.floor(items.length / 2);
            const selectedItem = items[middleIndex];
            
            if (!selectedItem) {
                console.error("No item found at middle index:", middleIndex);
                isSpinning = false;
                spinButton.disabled = false;
                return;
            }
            
            // Highlight the selected item
            selectedItem.classList.add('selected');
            
            // Rigged outcome - 80% chance of bomb
            let itemType, itemName, itemMultiplier;
            
            const randomValue = Math.random();
            if (randomValue < 0.8) {
                // 80% chance of bomb (biglose)
                itemType = "biglose";
                itemName = "Bomb";
                itemMultiplier = -2;
                // Replace the symbol with a bomb
                selectedItem.querySelector('.symbol').innerHTML = '<i class="fas fa-bomb"></i>';
                // Update data attributes
                selectedItem.dataset.type = itemType;
                selectedItem.dataset.name = itemName;
                selectedItem.dataset.multiplier = itemMultiplier;
            } else {
                // Use the actual item that was randomly generated (20% chance)
                itemType = selectedItem.dataset.type || "lose";
                itemName = selectedItem.dataset.name || "Unknown";
                itemMultiplier = parseFloat(selectedItem.dataset.multiplier || 0);
            }
            
            console.log('Selected item:', { type: itemType, name: itemName, multiplier: itemMultiplier });
            
            // Add stopping animation with a small bounce effect
            arcadeDisplay.classList.add('stopping');
            
            // After stopping animation completes, show result
            setTimeout(() => {
                // Calculate winnings and show result
                handleResult(itemType, itemName, itemMultiplier, selectedItem);
                
                // Clean up animations
                arcadeDisplay.classList.remove('stopping');
                
                // Re-enable spin button after a delay
                setTimeout(() => {
                    isSpinning = false;
                    spinButton.disabled = false;
                    
                    if (selectedItem) {
                        selectedItem.classList.remove('selected', itemType);
                    }
                }, 3000);
            }, 500); // Wait for the stopping animation to complete
        }, 2000);
    }
    
    // Show result message
    function showResult(message, type) {
        console.log('Showing result:', message, type);
        
        // First hide any existing result
        hideResult();
        
        // Small delay to ensure the previous result is fully hidden
        setTimeout(() => {
            resultDisplay.textContent = message;
            resultDisplay.className = 'arcade-result ' + type;
            resultDisplay.classList.add('show');
            
            // Hide after 3 seconds
            setTimeout(() => {
                hideResult();
            }, 3000);
        }, 50);
    }
    
    // Hide result message
    function hideResult() {
        if (resultDisplay.classList.contains('show')) {
            resultDisplay.classList.remove('show');
            
            // Wait for transition to finish before clearing content
            setTimeout(() => {
                resultDisplay.textContent = '';
                resultDisplay.className = 'arcade-result';
                resultDisplay.classList.remove('shake');
            }, 300); // Match transition duration in CSS
        } else {
            // If not showing, just reset it directly
            resultDisplay.textContent = '';
            resultDisplay.className = 'arcade-result';
            resultDisplay.classList.remove('shake', 'show');
        }
    }
    
    // Handle result
    function handleResult(type, name, multiplier, element) {
        let message = "";
        let winnings = 0;
        
        // Add animation class to the selected item
        element.classList.add(type);
        
        // Calculate winnings based on result type
        if (type === 'jackpot') {
            winnings = betAmount * multiplier;
            message = `JACKPOT! You won ${winnings} credits!`;
            showResult(message, 'jackpot');
        } 
        else if (type === 'win') {
            winnings = betAmount * multiplier;
            message = `WIN! ${name} pays ${multiplier}x! You won ${winnings} credits!`;
            showResult(message, 'win');
        }
        else if (type === 'biglose') {
            winnings = betAmount * multiplier;
            message = `BOOM! ${name} costs ${Math.abs(multiplier)}x! You lost ${Math.abs(winnings)} credits!`;
            showResult(message, 'biglose');
            resultDisplay.classList.add('shake');
        }
        else if (type === 'lose') {
            winnings = betAmount * multiplier;
            message = `LOSS! ${name} - You lost your bet of ${betAmount} credits!`;
            showResult(message, 'lose');
        }
        
        // Update credits
        credits += winnings;
        if (credits < 0) credits = 0;
        
        // Flash credits display
        const creditsDisplay = document.querySelector('.credits-display');
        if (creditsDisplay) {
            creditsDisplay.classList.add('flash');
            setTimeout(() => {
                creditsDisplay.classList.remove('flash');
            }, 2000);
        }
        
        updateCredits();
    }
    
    // Initialize the game
    init();
}); 
