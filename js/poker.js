// Poker Game Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Game state
    let deck = [];
    let playerHand = [];
    let currentBet = 10;
    let gamePhase = 'betting'; // betting, holding, drawing
    let heldCards = new Set();
    
    // DOM Elements
    const dealButton = document.querySelector('#poker-game .action-btn:nth-child(1)');
    const holdButton = document.querySelector('#poker-game .action-btn:nth-child(2)');
    const drawButton = document.querySelector('#poker-game .action-btn:nth-child(3)');
    const messageDisplay = document.querySelector('.poker-message');
    const cardElements = document.querySelectorAll('#poker-game .card');
    const betInput = document.querySelector('#poker-game .bet-input');
    const betUpButton = document.querySelector('#poker-game .bet-up');
    const betDownButton = document.querySelector('#poker-game .bet-down');
    
    // Card suits and values
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    // Initialize the game
    function initGame() {
        createDeck();
        shuffleDeck();
        updateButtons();
        updateBetInput();
        updateMessage('Place your bet and click Deal to start!');
        
        // Ensure card backs are visible
        cardElements.forEach(card => {
            card.className = 'card card-back';
            card.innerHTML = '';
        });
    }
    
    // Create a new deck
    function createDeck() {
        deck = [];
        for (let suit of suits) {
            for (let value of values) {
                deck.push({ suit, value });
            }
        }
    }
    
    // Shuffle the deck with a biased algorithm to make good hands less likely
    function shuffleDeck() {
        // First do a regular shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        // Sort face cards and aces toward the bottom of the deck
        // This makes them less likely to be dealt in the initial hand
        deck.sort((a, b) => {
            const highCards = ['J', 'Q', 'K', 'A'];
            const aIsHigh = highCards.includes(a.value);
            const bIsHigh = highCards.includes(b.value);
            
            if (aIsHigh && !bIsHigh) return 0.7; // High cards have 70% chance to be moved down
            if (!aIsHigh && bIsHigh) return -0.7;
            return Math.random() - 0.5; // Random sort for other cards
        });
    }
    
    // Update bet input
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
    
    // Deal initial hand with a bias against good starting cards
    function dealHand() {
        if (gamePhase !== 'betting') return;
        if (gameState.getCredits() < currentBet) {
            updateMessage('Not enough credits to bet!');
            return;
        }
        
        // Reset game state
        heldCards.clear();
        playerHand = [];
        gameState.removeCredits(currentBet);
        
        // Create a temporary biased deck
        const tempDeck = [...deck];
        
        // 80% chance to deal an unfavorable starting hand
        if (Math.random() < 0.8) {
            // Deal cards that are less likely to form winning combinations
            // Avoid cards of the same suit
            const usedSuits = new Set();
            const usedValues = new Set();
            
            // Deal 5 cards with bias against pairs, same suits, and sequences
            for (let i = 0; i < 5; i++) {
                // Find a card that doesn't form a potential winning combo
                let cardIndex = -1;
                let attempts = 0;
                
                while (cardIndex === -1 && attempts < 20) {
                    attempts++;
                    const randomIndex = Math.floor(Math.random() * tempDeck.length);
                    const card = tempDeck[randomIndex];
                    
                    // Check if this card might help create a good hand
                    const mightFormPair = usedValues.has(card.value);
                    const mightFormFlush = usedSuits.has(card.suit);
                    const isHighCard = ['J', 'Q', 'K', 'A'].includes(card.value);
                    
                    // Avoid cards that might create winning combinations
                    if (!mightFormPair && !mightFormFlush && !(isHighCard && usedValues.size < 2)) {
                        cardIndex = randomIndex;
                    }
                }
                
                // If we couldn't find a "bad" card after several attempts, just pick randomly
                if (cardIndex === -1) {
                    cardIndex = Math.floor(Math.random() * tempDeck.length);
                }
                
                // Add the card to the player's hand
                const card = tempDeck.splice(cardIndex, 1)[0];
                playerHand.push(card);
                usedSuits.add(card.suit);
                usedValues.add(card.value);
            }
        } else {
            // Deal 5 random cards (20% chance of a fair deal)
            for (let i = 0; i < 5; i++) {
                playerHand.push(deck.pop());
            }
        }
        
        displayCards();
        gamePhase = 'holding';
        updateButtons();
        updateMessage('Select cards to hold, then click Draw');
    }
    
    // Toggle hold on a card
    function toggleHold(index) {
        if (gamePhase !== 'holding') return;
        
        if (heldCards.has(index)) {
            heldCards.delete(index);
            cardElements[index].classList.remove('held');
        } else {
            heldCards.add(index);
            cardElements[index].classList.add('held');
        }
    }
    
    // Draw new cards
    function drawCards() {
        if (gamePhase !== 'holding') return;
        
        // Replace non-held cards
        for (let i = 0; i < playerHand.length; i++) {
            if (!heldCards.has(i)) {
                playerHand[i] = deck.pop();
            }
        }
        
        displayCards();
        gamePhase = 'betting';
        checkWin();
        updateButtons();
    }
    
    // Display cards on screen
    function displayCards() {
        // Reset all cards to back
        cardElements.forEach(card => {
            card.className = 'card card-back';
            card.innerHTML = '';
        });
        
        // Display player hand
        for (let i = 0; i < playerHand.length; i++) {
            if (i < cardElements.length) {
                const card = playerHand[i];
                const isRed = ['♥', '♦'].includes(card.suit);
                cardElements[i].className = 'card';
                cardElements[i].innerHTML = `
                    <div class="card-inner">
                        <div class="card-value-top ${isRed ? 'red' : 'black'}">${card.value}</div>
                        <div class="card-suit ${isRed ? 'red' : 'black'}">${card.suit}</div>
                        <div class="card-value-bottom ${isRed ? 'red' : 'black'}">${card.value}</div>
                    </div>
                `;
                
                // Add 'held' class if the card is being held
                if (heldCards.has(i)) {
                    cardElements[i].classList.add('held');
                }
            }
        }
    }
    
    // Check for winning hands
    function checkWin() {
        const result = evaluateHand(playerHand);
        let winAmount = 0;
        
        switch (result) {
            case 'Royal Flush':
                winAmount = currentBet * 800;
                break;
            case 'Straight Flush':
                winAmount = currentBet * 200;
                break;
            case 'Four of a Kind':
                winAmount = currentBet * 100;
                break;
            case 'Full House':
                winAmount = currentBet * 50;
                break;
            case 'Flush':
                winAmount = currentBet * 30;
                break;
            case 'Straight':
                winAmount = currentBet * 25;
                break;
            case 'Three of a Kind':
                winAmount = currentBet * 15;
                break;
            case 'Two Pair':
                winAmount = currentBet * 10;
                break;
            case 'Jacks or Better':
                winAmount = currentBet * 5;
                break;
        }
        
        if (winAmount > 0) {
            gameState.addCredits(winAmount);
            updateMessage(`${result}! You won ${winAmount} credits!`);
        } else {
            updateMessage('No win. Try again!');
        }
        
        // If deck is running low, create and shuffle a new one
        if (deck.length < 10) {
            createDeck();
            shuffleDeck();
        }
    }
    
    // Evaluate poker hand
    function evaluateHand(hand) {
        const values = hand.map(card => card.value);
        const suits = hand.map(card => card.suit);
        
        // Check for flush
        const isFlush = suits.every(suit => suit === suits[0]);
        
        // Check for straight
        const valueOrder = '23456789TJQKA';
        const sortedValues = values.map(v => v === '10' ? 'T' : v)
                                 .sort((a, b) => valueOrder.indexOf(a) - valueOrder.indexOf(b));
        let isStraight = false;
        for (let i = 0; i < sortedValues.length - 1; i++) {
            if (valueOrder.indexOf(sortedValues[i + 1]) - valueOrder.indexOf(sortedValues[i]) !== 1) {
                isStraight = false;
                break;
            }
            isStraight = true;
        }
        
        // Special case for Ace-low straight
        if (!isStraight && sortedValues.join('') === '2345A') {
            isStraight = true;
        }
        
        // Count value frequencies
        const valueCounts = {};
        values.forEach(value => {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
        });
        
        const frequencies = Object.values(valueCounts).sort((a, b) => b - a);
        
        // Check for royal flush
        if (isFlush && isStraight && sortedValues.join('') === 'TJQKA') {
            return 'Royal Flush';
        }
        
        // Check for straight flush
        if (isFlush && isStraight) {
            return 'Straight Flush';
        }
        
        // Check for four of a kind
        if (frequencies[0] === 4) {
            return 'Four of a Kind';
        }
        
        // Check for full house
        if (frequencies[0] === 3 && frequencies[1] === 2) {
            return 'Full House';
        }
        
        // Check for flush
        if (isFlush) {
            return 'Flush';
        }
        
        // Check for straight
        if (isStraight) {
            return 'Straight';
        }
        
        // Check for three of a kind
        if (frequencies[0] === 3) {
            return 'Three of a Kind';
        }
        
        // Check for two pair
        if (frequencies[0] === 2 && frequencies[1] === 2) {
            return 'Two Pair';
        }
        
        // Check for jacks or better
        const hasHighPair = Object.entries(valueCounts).some(([value, count]) => 
            count === 2 && ['J', 'Q', 'K', 'A'].includes(value)
        );
        if (hasHighPair) {
            return 'Jacks or Better';
        }
        
        return 'No Win';
    }
    
    // Update message display
    function updateMessage(msg) {
        messageDisplay.textContent = msg;
    }
    
    // Update button states
    function updateButtons() {
        dealButton.disabled = gamePhase !== 'betting';
        holdButton.disabled = gamePhase !== 'holding';
        drawButton.disabled = gamePhase !== 'holding';
    }
    
    // Event Listeners
    dealButton.addEventListener('click', dealHand);
    drawButton.addEventListener('click', drawCards);
    
    // Add click listeners to cards for holding
    cardElements.forEach((card, index) => {
        card.addEventListener('click', () => toggleHold(index));
    });
    
    // Add bet control listeners
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
    
    // Initialize the game
    initGame();
}); 