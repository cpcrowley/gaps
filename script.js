class GapsGame {
    constructor() {
        this.suits = ['♠', '♥', '♦', '♣'];
        this.cardsPerRow = 13; // Default to 13 cards per row
        this.ranks = this.generateRanks();
        this.board = [];
        this.selectedCard = null;
        this.gameWon = false;
        this.history = [];
        this.currentHistoryIndex = -1;
        this.lastRedealIndex = -1;
        this.redealCount = 0;
        this.settings = {
            cardHoverHighlighting: true,
            redealMode: 'strategic'
        };
    }

    generateRanks() {
        const allRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        // For N cards per row, we need N-1 ranks (2 through N-1) to leave space for gaps
        return allRanks.slice(0, this.cardsPerRow - 1);
    }

    setCardsPerRow(count) {
        if (count >= 4 && count <= 13) {
            this.cardsPerRow = count;
            this.ranks = this.generateRanks();
            
            // Clear the board to match the new size
            this.board = [];
            for (let row = 0; row < 4; row++) {
                this.board[row] = [];
                for (let col = 0; col < this.cardsPerRow; col++) {
                    this.board[row][col] = null;
                }
            }
            
            // Clear history when changing game size
            this.history = [];
            this.currentHistoryIndex = -1;
            this.lastRedealIndex = -1;
            
            // Reset game state
            this.selectedCard = null;
            this.gameWon = false;
        }
    }

    createDeck() {
        const deck = [];
        const allRanks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        // Only include ranks up to the current game size (plus Aces for gaps)
        const ranksToInclude = ['A', ...this.ranks];
        
        for (let suit of this.suits) {
            for (let rank of ranksToInclude) {
                deck.push({
                    suit: suit,
                    rank: rank,
                    isRed: suit === '♥' || suit === '♦'
                });
            }
        }
        return this.shuffle(deck);
    }

    shuffle(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    dealCards() {
        const deck = this.createDeck();
        this.board = [];
        
        let cardIndex = 0;
        for (let row = 0; row < 4; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cardsPerRow; col++) {
                this.board[row][col] = deck[cardIndex];
                cardIndex++;
            }
        }

        this.removeAces();
    }

    removeAces() {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                if (this.board[row][col] && this.board[row][col].rank === 'A') {
                    this.board[row][col] = null;
                }
            }
        }
    }

    isValidMove(card, targetRow, targetCol) {
        if (this.board[targetRow][targetCol] !== null) {
            return false;
        }

        if (targetCol === 0) {
            return card.rank === '2';
        }

        const leftCard = this.board[targetRow][targetCol - 1];
        if (!leftCard) {
            return false;
        }

        const leftRankIndex = this.ranks.indexOf(leftCard.rank);
        const cardRankIndex = this.ranks.indexOf(card.rank);
        
        return leftRankIndex + 1 === cardRankIndex && leftCard.suit === card.suit;
    }

    moveCard(fromRow, fromCol, toRow, toCol) {
        const card = this.board[fromRow][fromCol];
        if (this.isValidMove(card, toRow, toCol)) {
            this.board[toRow][toCol] = card;
            this.board[fromRow][fromCol] = null;
            
            // Save game state after successful move
            this.saveGameState();
            
            return true;
        }
        return false;
    }

    checkWin() {
        for (let row = 0; row < 4; row++) {
            let suit = null;
            for (let col = 0; col < this.cardsPerRow - 1; col++) { // -1 because we need one less than cardsPerRow for the sequence
                const card = this.board[row][col];
                if (!card) return false;
                
                if (col === 0) {
                    if (card.rank !== '2') return false;
                    suit = card.suit;
                } else {
                    const expectedRank = this.ranks[col];
                    if (card.rank !== expectedRank || card.suit !== suit) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    findValidGapsForCard(cardRow, cardCol) {
        const card = this.board[cardRow][cardCol];
        if (!card) return [];
        
        const validGaps = [];
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                if (this.board[row][col] === null) {
                    if (this.isValidMove(card, row, col)) {
                        validGaps.push({ row, col });
                    }
                }
            }
        }
        
        return validGaps;
    }

    showToast(message) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    findCardForGap(targetRow, targetCol) {
        if (targetCol === 0) {
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < this.cardsPerRow; col++) {
                    const card = this.board[row][col];
                    if (card && card.rank === '2') {
                        return { row, col, card };
                    }
                }
            }
        } else {
            const leftCard = this.board[targetRow][targetCol - 1];
            if (!leftCard) return null;
            
            const leftRankIndex = this.ranks.indexOf(leftCard.rank);
            if (leftRankIndex === -1 || leftRankIndex === this.ranks.length - 1) {
                return null;
            }
            
            const neededRank = this.ranks[leftRankIndex + 1];
            const neededSuit = leftCard.suit;
            
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < this.cardsPerRow; col++) {
                    const card = this.board[row][col];
                    if (card && card.rank === neededRank && card.suit === neededSuit) {
                        return { row, col, card };
                    }
                }
            }
        }
        return null;
    }

    areAllGapsDead() {
        // Check if all gaps are "dead" (no valid moves possible)
        let gapCount = 0;
        let deadGapCount = 0;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                if (this.board[row][col] === null) { // It's a gap
                    gapCount++;
                    // Check if any card can move to this gap
                    if (this.findCardForGap(row, col) !== null) {
                        return false; // Found a gap that can be filled
                    } else {
                        deadGapCount++;
                    }
                }
            }
        }
        
        // If we have gaps and they're all dead, enable redeal
        return gapCount > 0 && deadGapCount === gapCount;
    }

    // Alternative method to check if redeal should be available
    shouldEnableRedeal() {
        // Check if there are any valid moves possible
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                const card = this.board[row][col];
                if (card) {
                    const validGaps = this.findValidGapsForCard(row, col);
                    if (validGaps.length > 0) {
                        return false; // Found a valid move
                    }
                }
            }
        }
        
        // Check if there are any gaps that can be filled
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                if (this.board[row][col] === null) {
                    if (this.findCardForGap(row, col) !== null) {
                        return false; // Found a gap that can be filled
                    }
                }
            }
        }
        
        // No valid moves found, enable redeal
        return true;
    }

    findCorrectSequences() {
        // Find all cards that are in correct position from the left of each row
        const correctPositions = [];
        
        for (let row = 0; row < 4; row++) {
            correctPositions[row] = [];
            let sequenceLength = 0;
            
            // Check sequence starting from leftmost position
            for (let col = 0; col < this.cardsPerRow; col++) {
                const card = this.board[row][col];
                
                if (!card) break; // Gap found, sequence ends
                
                if (col === 0) {
                    // First position must be a 2
                    if (card.rank === '2') {
                        correctPositions[row][col] = true;
                        sequenceLength = 1;
                    } else {
                        break; // Not a 2, sequence invalid
                    }
                } else {
                    // Must be next card in sequence and same suit as previous
                    const expectedRank = this.ranks[col];
                    const previousCard = this.board[row][col - 1];
                    
                    if (card.rank === expectedRank && 
                        card.suit === previousCard.suit) {
                        correctPositions[row][col] = true;
                        sequenceLength++;
                    } else {
                        break; // Sequence broken
                    }
                }
            }
        }
        
        return correctPositions;
    }

    redeal() {
        if (this.settings.redealMode === 'strategic') {
            this.redealStrategic();
        } else {
            this.redealRandom();
        }
        
        // Increment redeal counter
        this.redealCount++;
        
        // Reset game state
        this.selectedCard = null;
        this.gameWon = false;
        
        // Mark this as a redeal point in history
        this.lastRedealIndex = this.currentHistoryIndex;
        
        // Save the state after redeal
        this.saveGameState();
    }

    redealStrategic() {
        // Find correct sequences to keep
        const correctPositions = this.findCorrectSequences();
        
        // Collect all cards that need to be redealt
        const cardsToRedeal = [];
        
        // Collect cards that are not in correct positions
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                const card = this.board[row][col];
                if (card && (!correctPositions[row] || !correctPositions[row][col])) {
                    cardsToRedeal.push(card);
                }
            }
        }
        
        // Clear positions that are not in correct sequences
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                if (!correctPositions[row] || !correctPositions[row][col]) {
                    this.board[row][col] = null;
                }
            }
        }
        
        // Create gaps after correct sequences
        for (let row = 0; row < 4; row++) {
            let lastCorrectCol = -1;
            
            // Find the last correct position in this row
            if (correctPositions[row]) {
                for (let col = 0; col < this.cardsPerRow; col++) {
                    if (correctPositions[row][col]) {
                        lastCorrectCol = col;
                    }
                }
            }
            
            // Create a gap after the last correct position
            const gapCol = lastCorrectCol + 1;
            if (gapCol < this.cardsPerRow) {
                this.board[row][gapCol] = null;
            }
        }
        
        // Shuffle the cards to be redealt
        const shuffledCards = this.shuffle(cardsToRedeal);
        
        // Deal the shuffled cards into empty positions, starting after the gap in each row
        let cardIndex = 0;
        for (let row = 0; row < 4; row++) {
            let lastCorrectCol = -1;
            
            // Find the last correct position in this row
            if (correctPositions[row]) {
                for (let col = 0; col < this.cardsPerRow; col++) {
                    if (correctPositions[row][col]) {
                        lastCorrectCol = col;
                    }
                }
            }
            
            // Start dealing after the gap (which is after the last correct position)
            const startDealCol = lastCorrectCol + 2; // +2 because gap is at lastCorrectCol + 1
            
            for (let col = startDealCol; col < this.cardsPerRow; col++) {
                if (cardIndex < shuffledCards.length) {
                    this.board[row][col] = shuffledCards[cardIndex];
                    cardIndex++;
                }
            }
        }
    }

    redealRandom() {
        // Find correct sequences to keep
        const correctPositions = this.findCorrectSequences();
        
        // Collect all cards that need to be redealt
        const cardsToRedeal = [];
        
        // Add aces back to the deck for redealing
        for (let suit of this.suits) {
            cardsToRedeal.push({
                suit: suit,
                rank: 'A',
                isRed: suit === '♥' || suit === '♦'
            });
        }
        
        // Collect cards that are not in correct positions
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                const card = this.board[row][col];
                if (card && (!correctPositions[row] || !correctPositions[row][col])) {
                    cardsToRedeal.push(card);
                }
            }
        }
        
        // Clear positions that are not in correct sequences
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                if (!correctPositions[row] || !correctPositions[row][col]) {
                    this.board[row][col] = null;
                }
            }
        }
        
        // Shuffle the cards to be redealt
        const shuffledCards = this.shuffle(cardsToRedeal);
        
        // Deal the shuffled cards into empty positions
        let cardIndex = 0;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                if (this.board[row][col] === null && cardIndex < shuffledCards.length) {
                    this.board[row][col] = shuffledCards[cardIndex];
                    cardIndex++;
                }
            }
        }
        
        // Remove aces again to create gaps
        this.removeAces();
    }

    handleCardClick(row, col) {
        if (this.gameWon) return;
        
        const card = this.board[row][col];
        if (!card) return;

        const validGaps = this.findValidGapsForCard(row, col);
        
        if (validGaps.length === 0) {
            this.showToast("This card cannot be moved - no valid gaps available");
            return;
        } else if (validGaps.length === 1) {
            const gap = validGaps[0];
            const moved = this.moveCard(row, col, gap.row, gap.col);
            if (moved) {
                this.selectedCard = null;
                this.render();
            }
        } else {
            this.selectedCard = { row, col, card };
            this.render();
        }
    }

    handleGapClick(row, col) {
        if (this.gameWon) return;
        
        if (this.selectedCard) {
            const moved = this.moveCard(
                this.selectedCard.row, 
                this.selectedCard.col, 
                row, 
                col
            );
            
            if (moved) {
                this.selectedCard = null;
                this.render();
            }
        } else {
            const cardToMove = this.findCardForGap(row, col);
            if (cardToMove) {
                const moved = this.moveCard(cardToMove.row, cardToMove.col, row, col);
                if (moved) {
                    this.render();
                }
            } else {
                this.showToast("No card can be moved to this gap");
            }
        }
    }

    handleGapHover(row, col, isHovering) {
        if (this.gameWon) return;
        
        // Remove any existing hover highlights
        this.clearHoverHighlights();
        
        if (isHovering) {
            const cardToMove = this.findCardForGap(row, col);
            if (cardToMove) {
                // Highlight the gap
                const gapElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (gapElement) {
                    gapElement.classList.add('hover-highlight');
                }
                
                // Highlight the card that can move there
                const cardElement = document.querySelector(`[data-row="${cardToMove.row}"][data-col="${cardToMove.col}"]`);
                if (cardElement) {
                    cardElement.classList.add('hover-target');
                }
            }
        }
    }

    clearHoverHighlights() {
        // Remove hover highlights from all elements
        const hoverGaps = document.querySelectorAll('.gap.hover-highlight');
        hoverGaps.forEach(gap => gap.classList.remove('hover-highlight'));
        
        const hoverCards = document.querySelectorAll('.card.hover-target');
        hoverCards.forEach(card => card.classList.remove('hover-target'));
        
        const hoverSourceCards = document.querySelectorAll('.card.hover-source');
        hoverSourceCards.forEach(card => card.classList.remove('hover-source'));
    }

    handleCardHover(row, col, isHovering) {
        if (this.gameWon) return;
        
        // Remove any existing hover highlights
        this.clearHoverHighlights();
        
        if (isHovering && this.settings.cardHoverHighlighting) {
            const currentCard = this.board[row][col];
            if (!currentCard) return;
            
            // Find the previous card in the same suit sequence
            const previousCard = this.findPreviousCardInSequence(currentCard);
            
            if (previousCard) {
                // Highlight the card we're hovering over
                const currentElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (currentElement) {
                    currentElement.classList.add('hover-source');
                }
                
                // Find the card that would move (the one after the previous card)
                const cardToMove = this.findCardAfterPrevious(previousCard);
                
                if (cardToMove) {
                    // Highlight the card that would move
                    const cardElement = document.querySelector(`[data-row="${cardToMove.row}"][data-col="${cardToMove.col}"]`);
                    if (cardElement) {
                        cardElement.classList.add('hover-target');
                    }
                }
            }
        }
    }

    findPreviousCardInSequence(card) {
        const cardRankIndex = this.ranks.indexOf(card.rank);
        if (cardRankIndex <= 0) return null; // No previous card for 2s
        
        const previousRank = this.ranks[cardRankIndex - 1];
        
        // Find the previous card in the same suit
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                const boardCard = this.board[row][col];
                if (boardCard && boardCard.rank === previousRank && boardCard.suit === card.suit) {
                    return { row, col, card: boardCard };
                }
            }
        }
        return null;
    }

    findCardAfterPrevious(previousCard) {
        const previousRankIndex = this.ranks.indexOf(previousCard.card.rank);
        if (previousRankIndex >= this.ranks.length - 1) return null; // Previous card is a King
        
        const nextRank = this.ranks[previousRankIndex + 1];
        
        // First, check if there's a card in the position to the right of the previous card
        const rightPosition = { row: previousCard.row, col: previousCard.col + 1 };
        if (rightPosition.col < this.cardsPerRow) {
            const rightCard = this.board[rightPosition.row][rightPosition.col];
            if (rightCard) {
                return { row: rightPosition.row, col: rightPosition.col, card: rightCard };
            }
        }
        
        // If no card to the right, find the next card in the same suit sequence
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                const boardCard = this.board[row][col];
                if (boardCard && boardCard.rank === nextRank && boardCard.suit === previousCard.card.suit) {
                    return { row, col, card: boardCard };
                }
            }
        }
        return null;
    }

    render() {
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = '';

        // Clear any existing hover highlights
        this.clearHoverHighlights();

        for (let row = 0; row < 4; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'row';
            
            for (let col = 0; col < this.cardsPerRow; col++) {
                const cell = this.board[row][col];
                const cellDiv = document.createElement('div');
                
                if (cell === null) {
                    cellDiv.className = 'gap';
                    cellDiv.textContent = 'GAP';
                    cellDiv.setAttribute('data-row', row);
                    cellDiv.setAttribute('data-col', col);
                    cellDiv.onclick = () => this.handleGapClick(row, col);
                    cellDiv.onmouseenter = () => this.handleGapHover(row, col, true);
                    cellDiv.onmouseleave = () => this.handleGapHover(row, col, false);
                } else {
                    cellDiv.className = `card ${cell.isRed ? 'red' : 'black'}`;
                    cellDiv.textContent = `${cell.rank}${cell.suit}`;
                    cellDiv.setAttribute('data-row', row);
                    cellDiv.setAttribute('data-col', col);
                    cellDiv.onclick = () => this.handleCardClick(row, col);
                    cellDiv.onmouseenter = () => this.handleCardHover(row, col, true);
                    cellDiv.onmouseleave = () => this.handleCardHover(row, col, false);
                    
                    if (this.selectedCard && 
                        this.selectedCard.row === row && 
                        this.selectedCard.col === col) {
                        cellDiv.classList.add('selected');
                    }
                }
                
                rowDiv.appendChild(cellDiv);
            }
            
            gameArea.appendChild(rowDiv);
        }

        const status = document.getElementById('status');
        if (this.checkWin()) {
            status.textContent = `🎉 Congratulations! You won! 🎉 (Redeals: ${this.redealCount})`;
            status.className = 'status win';
            this.gameWon = true;
        } else {
            status.textContent = `Redeals: ${this.redealCount}`;
            status.className = 'status';
        }

        // Update redeal button
        const redealBtn = document.getElementById('redeal-btn');
        if (this.gameWon) {
            redealBtn.disabled = true;
        } else if (this.shouldEnableRedeal()) {
            redealBtn.disabled = false;
            if (!this.selectedCard) {
                status.textContent = `All gaps are blocked! Click Redeal to continue. (Redeals: ${this.redealCount})`;
            }
        } else {
            redealBtn.disabled = true;
        }
        
        // Update undo button
        this.updateUndoButton();
    }

    saveGameState() {
        // Deep copy the current board state
        const boardCopy = [];
        for (let row = 0; row < 4; row++) {
            boardCopy[row] = [];
            for (let col = 0; col < this.cardsPerRow; col++) {
                boardCopy[row][col] = this.board[row][col] ? { ...this.board[row][col] } : null;
            }
        }
        
        const gameState = {
            board: boardCopy,
            selectedCard: this.selectedCard ? { ...this.selectedCard } : null,
            gameWon: this.gameWon,
            redealCount: this.redealCount
        };
        
        // Remove any history after current index (if we're undoing and then making a new move)
        this.history = this.history.slice(0, this.currentHistoryIndex + 1);
        
        // Add new state to history
        this.history.push(gameState);
        this.currentHistoryIndex++;
        
        // Update undo button state
        this.updateUndoButton();
    }

    restoreGameState(historyIndex) {
        if (historyIndex >= 0 && historyIndex < this.history.length) {
            const gameState = this.history[historyIndex];
            
            // Restore board
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < this.cardsPerRow; col++) {
                    this.board[row][col] = gameState.board[row][col] ? { ...gameState.board[row][col] } : null;
                }
            }
            
            // Restore other state
            this.selectedCard = gameState.selectedCard ? { ...gameState.selectedCard } : null;
            this.gameWon = gameState.gameWon;
            this.redealCount = gameState.redealCount;
            
            this.currentHistoryIndex = historyIndex;
            this.updateUndoButton();
        }
    }

    updateUndoButton() {
        const undoBtn = document.getElementById('undo-btn');
        // Enable undo if we can go back at least one step (but not beyond the last redeal)
        const canUndo = this.currentHistoryIndex > this.lastRedealIndex;
        undoBtn.disabled = !canUndo;
    }
}

let game = new GapsGame();

function newGame() {
    // Create new game instance but preserve the current settings
    const currentCardsPerRow = game.cardsPerRow;
    const currentSettings = { ...game.settings };
    
    game = new GapsGame();
    
    // Restore the settings
    game.setCardsPerRow(currentCardsPerRow);
    game.settings = currentSettings;
    
    // Reset redeal count for new game
    game.redealCount = 0;
    
    game.dealCards();
    game.saveGameState(); // Save initial state
    game.render();
    document.getElementById('instructions-modal').style.display = 'none';
}

function redeal() {
    game.redeal();
    game.render();
}

function showInstructions() {
    const instructionsModal = document.getElementById('instructions-modal');
    instructionsModal.style.display = 'flex';
    
    // Add click event listener to close when clicking outside
    const closeInstructionsModal = (event) => {
        if (event.target === instructionsModal) {
            instructionsModal.style.display = 'none';
            document.removeEventListener('click', closeInstructionsModal);
        }
    };
    
    // Use setTimeout to avoid immediate closure
    setTimeout(() => {
        document.addEventListener('click', closeInstructionsModal);
    }, 10);
}

function closeInstructions() {
    const instructionsModal = document.getElementById('instructions-modal');
    instructionsModal.style.display = 'none';
}

function showSettings() {
    updateSettingsUI();
    const settingsModal = document.getElementById('settings-modal');
    settingsModal.style.display = 'flex';
    
    // Add click event listener to close when clicking outside
    const closeSettingsModal = (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
            document.removeEventListener('click', closeSettingsModal);
        }
    };
    
    // Use setTimeout to avoid immediate closure
    setTimeout(() => {
        document.addEventListener('click', closeSettingsModal);
    }, 10);
}

function closeSettings() {
    const settingsModal = document.getElementById('settings-modal');
    settingsModal.style.display = 'none';
}

function undo() {
    if (game.currentHistoryIndex > game.lastRedealIndex) {
        game.restoreGameState(game.currentHistoryIndex - 1);
        game.render();
    }
}

function toggleCardHover() {
    game.settings.cardHoverHighlighting = !game.settings.cardHoverHighlighting;
    updateSettingsUI();
}

function toggleRedealMode() {
    game.settings.redealMode = game.settings.redealMode === 'strategic' ? 'random' : 'strategic';
    updateSettingsUI();
}

function changeCardsPerRow() {
    const select = document.getElementById('cards-per-row-select');
    const newCount = parseInt(select.value);
    
    // Update the game size
    game.setCardsPerRow(newCount);
    
    // Deal new cards with the new size
    game.dealCards();
    
    // Save the initial state and render
    game.saveGameState();
    game.render();
    
    // Update the settings UI to reflect the change
    updateSettingsUI();
}

function updateSettingsUI() {
    const toggle = document.getElementById('card-hover-toggle');
    if (game.settings.cardHoverHighlighting) {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }

    const redealModeToggle = document.getElementById('redeal-mode-toggle');
    if (game.settings.redealMode === 'strategic') {
        redealModeToggle.classList.add('active');
    } else {
        redealModeToggle.classList.remove('active');
    }

    const cardsPerRowSelect = document.getElementById('cards-per-row-select');
    cardsPerRowSelect.value = game.cardsPerRow;
}

window.onload = () => {
    newGame();
    updateSettingsUI(); // Initialize settings UI with current game state
}; 