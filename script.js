class GapsGame {
    constructor() {
        this.suits = ['♠', '♥', '♦', '♣'];
        this.cardsPerRow = 5;
        this.ranks = this.generateRanks();
        this.board = [];
        this.selectedCard = null;
        this.gameWon = false;
        this.history = [];
        this.currentHistoryIndex = -1;
        this.lastRedealIndex = -1;
        this.redealCount = 0;
        
        // Statistics tracking
        this.stats = {
            totalGames: 0,
            completedGames: 0,
            totalRedeals: 0,
            totalMoves: 0,
            averageRedealsPerGame: 0,
            averageMovesPerGame: 0,
            completionRate: 0,
            currentGameMoves: 0,
            currentRedealMoves: 0
        };
        
        this.settings = {
            cardHoverHighlighting: true,
            redealMode: 'strategic',
            lookAheadSteps: 4,
            cardDisplay: 'text'
        };
        
        // Deck configurations for different naming conventions
        this.deckConfigs = {
            deck1: {
                directory: 'decks/deck1',
                naming: 'prefix', // clubs_7.png format
                suitNames: {
                    '♠': 'spades',
                    '♥': 'hearts', 
                    '♦': 'diamonds',
                    '♣': 'clubs'
                },
                rankNames: {
                    'A': '1',
                    '2': '2',
                    '3': '3', 
                    '4': '4',
                    '5': '5',
                    '6': '6',
                    '7': '7',
                    '8': '8',
                    '9': '9',
                    '10': '10',
                    'J': 'jack',
                    'Q': 'queen',
                    'K': 'king'
                }
            },
            deck2: {
                directory: 'decks/deck2',
                naming: 'prefix', // club_7.png format
                suitNames: {
                    '♠': 'spade',
                    '♥': 'heart', 
                    '♦': 'diamond',
                    '♣': 'club'
                },
                rankNames: {
                    'A': '1',
                    '2': '2',
                    '3': '3', 
                    '4': '4',
                    '5': '5',
                    '6': '6',
                    '7': '7',
                    '8': '8',
                    '9': '9',
                    '10': '10',
                    'J': 'jack',
                    'Q': 'queen',
                    'K': 'king'
                }
            },
            deck3: {
                directory: 'decks/deck3',
                naming: 'prefix', // club_7.png format
                suitNames: {
                    '♠': 'spade',
                    '♥': 'heart', 
                    '♦': 'diamond',
                    '♣': 'club'
                },
                rankNames: {
                    'A': '1',
                    '2': '2',
                    '3': '3', 
                    '4': '4',
                    '5': '5',
                    '6': '6',
                    '7': '7',
                    '8': '8',
                    '9': '9',
                    '10': '10',
                    'J': 'jack',
                    'Q': 'queen',
                    'K': 'king'
                }
            },
            deck4: {
                directory: 'decks/deck4',
                naming: 'prefix', // club_7.png format
                suitNames: {
                    '♠': 'spade',
                    '♥': 'heart', 
                    '♦': 'diamond',
                    '♣': 'club'
                },
                rankNames: {
                    'A': '1',
                    '2': '2',
                    '3': '3', 
                    '4': '4',
                    '5': '5',
                    '6': '6',
                    '7': '7',
                    '8': '8',
                    '9': '9',
                    '10': '10',
                    'J': 'jack',
                    'Q': 'queen',
                    'K': 'king'
                }
            }
        };
    }

    generateRanks() {
        const allRanks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        // For N cards per row, we need N-1 ranks (2 through N-1) to leave space for gaps
        return allRanks.slice(0, this.cardsPerRow - 1);
    }

    getCardImageFilename(card) {
        const deckConfig = this.deckConfigs[this.settings.cardDisplay];
        if (!deckConfig) {
            return null;
        }
        
        const suitName = deckConfig.suitNames[card.suit];
        const rankName = deckConfig.rankNames[card.rank];
        
        if (!suitName || !rankName) {
            return null;
        }
        
        if (deckConfig.naming === 'of') {
            // Format: 7_of_clubs.png
            return `${rankName}_of_${suitName}.png`;
        } else if (deckConfig.naming === 'prefix') {
            // Format: club_7.png
            return `${suitName}_${rankName}.png`;
        }
        
        return null;
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
            
            // Track the move for statistics
            this.trackMove();
            
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
        
        // Track redeal for statistics
        this.trackRedeal();
        
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
                
                // Build the chain of moves based on lookAheadSteps setting
                const moveChain = this.buildMoveChain(cardToMove, row, col);
                
                // Highlight all cards in the chain
                moveChain.forEach((move, index) => {
                    const cardElement = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
                    if (cardElement) {
                        cardElement.classList.add('hover-target');
                    }
                });
                
                // Draw arrows only if lookAheadSteps > 0
                if (this.settings.lookAheadSteps > 0) {
                    this.drawMoveChain(moveChain, gapElement);
                }
            }
        }
    }

    buildMoveChain(firstCard, gapRow, gapCol) {
        const chain = [firstCard];
        let currentPosition = { row: firstCard.row, col: firstCard.col };
        
        // Find additional moves based on lookAheadSteps setting
        const additionalMoves = Math.max(0, this.settings.lookAheadSteps - 1);
        for (let i = 0; i < additionalMoves; i++) {
            const nextMove = this.findNextMoveInChain(chain[chain.length - 1], currentPosition);
            if (nextMove) {
                // Check if this card is already in the chain to avoid duplicates
                const isDuplicate = chain.some(move => move.row === nextMove.row && move.col === nextMove.col);
                if (isDuplicate) {
                    break;
                }
                
                chain.push(nextMove);
                currentPosition = { row: nextMove.row, col: nextMove.col };
            } else {
                break; // No more moves possible
            }
        }
        
        return chain;
    }

    findNextMoveInChain(card, targetPosition) {
        // Find what card would move into the position left by the current card
        if (targetPosition.col === 0) {
            // Target position is leftmost, so it needs a 2
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < this.cardsPerRow; col++) {
                    const boardCard = this.board[row][col];
                    if (boardCard && boardCard.rank === '2') {
                        return { row, col, card: boardCard };
                    }
                }
            }
        } else {
            // Check the card to the left of the target position
            const leftCard = this.board[targetPosition.row][targetPosition.col - 1];
            if (!leftCard) {
                return null; // No card to the left, no move possible
            }
            
            const leftRankIndex = this.ranks.indexOf(leftCard.rank);
            if (leftRankIndex === -1 || leftRankIndex === this.ranks.length - 1) {
                return null; // Left card is a King or invalid, no move possible
            }
            
            const neededRank = this.ranks[leftRankIndex + 1];
            const neededSuit = leftCard.suit;
            
            // Find the card that would move into the target position
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < this.cardsPerRow; col++) {
                    const boardCard = this.board[row][col];
                    if (boardCard && boardCard.rank === neededRank && boardCard.suit === neededSuit) {
                        return { row, col, card: boardCard };
                    }
                }
            }
        }
        
        return null;
    }

    drawMoveChain(moveChain, gapElement) {
        if (moveChain.length === 0) return;
        
        // Draw arrow from first card to gap (darkest blue) with label "1"
        const firstCardElement = document.querySelector(`[data-row="${moveChain[0].row}"][data-col="${moveChain[0].col}"]`);
        if (firstCardElement) {
            this.drawArrow(firstCardElement, gapElement, '#1e3a8a', '1', false); // Dark blue, no arrowhead
        }
        
        // Draw arrows between subsequent cards with progressively lighter blue and labels 2-6
        const blueShades = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']; // Blue gradient
        
        for (let i = 0; i < moveChain.length - 1; i++) {
            const currentCardElement = document.querySelector(`[data-row="${moveChain[i].row}"][data-col="${moveChain[i].col}"]`);
            const nextCardElement = document.querySelector(`[data-row="${moveChain[i + 1].row}"][data-col="${moveChain[i + 1].col}"]`);
            
            if (currentCardElement && nextCardElement) {
                const colorIndex = Math.min(i, blueShades.length - 1);
                const labelNumber = (i + 2).toString(); // Labels start at 2 for subsequent arrows
                this.drawArrow(nextCardElement, currentCardElement, blueShades[colorIndex], labelNumber, false); // No arrowhead
            }
        }
    }

    drawArrow(fromElement, toElement, color = '#4CAF50', label = '', showArrowhead = true) {
        if (!fromElement || !toElement) return;
        
        // Get positions of both elements
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        const gameArea = document.getElementById('game-area');
        const gameAreaRect = gameArea.getBoundingClientRect();
        
        // Calculate relative positions within the game area
        const fromX = fromRect.left + fromRect.width / 2 - gameAreaRect.left;
        const fromY = fromRect.top + fromRect.height / 2 - gameAreaRect.top;
        const toX = toRect.left + toRect.width / 2 - gameAreaRect.left;
        const toY = toRect.top + toRect.height / 2 - gameAreaRect.top;
        
        // Create SVG overlay if it doesn't exist
        let svgOverlay = document.getElementById('arrow-overlay');
        if (!svgOverlay) {
            svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgOverlay.id = 'arrow-overlay';
            svgOverlay.style.position = 'absolute';
            svgOverlay.style.top = '0';
            svgOverlay.style.left = '0';
            svgOverlay.style.width = '100%';
            svgOverlay.style.height = '100%';
            svgOverlay.style.pointerEvents = 'none';
            svgOverlay.style.zIndex = '10';
            gameArea.style.position = 'relative';
            gameArea.appendChild(svgOverlay);
        }
        
        // Create unique marker ID for this color
        const markerId = `arrowhead-${color.replace('#', '')}`;
        
        // Create arrowhead marker if it doesn't exist in this SVG and arrowhead is requested
        if (showArrowhead && !svgOverlay.querySelector(`#${markerId}`)) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.id = markerId;
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '7');
            marker.setAttribute('refX', '9');
            marker.setAttribute('refY', '3.5');
            marker.setAttribute('orient', 'auto');
            
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
            polygon.setAttribute('fill', color);
            
            marker.appendChild(polygon);
            defs.appendChild(marker);
            svgOverlay.appendChild(defs);
        }
        
        // Create arrow path
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Calculate a slight offset for a more natural curve
        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const offset = Math.min(20, distance * 0.1); // Small offset for curve
        
        // Create a curved path
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2 + offset;
        
        arrow.setAttribute('d', `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`);
        arrow.setAttribute('stroke', color);
        arrow.setAttribute('stroke-width', '3');
        arrow.setAttribute('stroke-linecap', 'round');
        arrow.setAttribute('fill', 'none');
        if (showArrowhead) {
            arrow.setAttribute('marker-end', `url(#${markerId})`);
        }
        arrow.setAttribute('opacity', '0.8');
        
        svgOverlay.appendChild(arrow);
        
        // Add number label if provided
        if (label) {
            // Add circle background
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', midX);
            circle.setAttribute('cy', midY - 5);
            circle.setAttribute('r', '13'); // 20% smaller (16 * 0.8 = 13)
            circle.setAttribute('fill', 'white');
            circle.setAttribute('stroke', '#333');
            circle.setAttribute('stroke-width', '2');
            circle.setAttribute('opacity', '0.6'); // More transparent
            
            svgOverlay.appendChild(circle);
            
            // Add number text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', midX);
            text.setAttribute('y', midY - 5); // Slightly above the curve
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', '#ff0000'); // Red color
            text.setAttribute('font-size', '22px'); // 20% smaller (28px * 0.8 = 22px)
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('stroke', 'white');
            text.setAttribute('stroke-width', '2px');
            text.setAttribute('paint-order', 'stroke');
            text.textContent = label;
            
            svgOverlay.appendChild(text);
        }
    }

    removeArrows() {
        const svgOverlay = document.getElementById('arrow-overlay');
        if (svgOverlay) {
            svgOverlay.innerHTML = '';
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
        
        // Remove arrows
        this.removeArrows();
    }

    handleCardHover(row, col, isHovering) {
        if (this.gameWon) return;
        
        // Remove any existing hover highlights
        this.clearHoverHighlights();
        
        if (isHovering && this.settings.lookAheadSteps > 0) {
            const currentCard = this.board[row][col];
            if (!currentCard) return;
            
            // Highlight the card we're hovering over
            const currentElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (currentElement) {
                currentElement.classList.add('hover-source');
            }
            
            // Find where this card would go in its correct sequence
            const targetPosition = this.findCorrectPositionForCard(currentCard);
            
            if (targetPosition) {
                // Highlight the target position
                const targetElement = document.querySelector(`[data-row="${targetPosition.row}"][data-col="${targetPosition.col}"]`);
                if (targetElement) {
                    targetElement.classList.add('hover-highlight');
                }
                
                // Build and draw the move chain starting from the target position
                const moveChain = this.buildMoveChain({ ...currentCard, row, col }, targetPosition.row, targetPosition.col);
                if (moveChain.length > 0) {
                    this.drawMoveChain(moveChain, targetElement);
                }
            }
        }
    }

    findCorrectPositionForCard(card) {
        // Find the correct position for this card in its suit sequence
        const cardRankIndex = this.ranks.indexOf(card.rank);
        if (cardRankIndex === -1) return null;
        
        // Look for the previous card in the same suit sequence
        const previousRank = this.ranks[cardRankIndex - 1];
        if (!previousRank) return null; // This is a 2, should be in leftmost position
        
        // Find the previous card in the same suit
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow; col++) {
                const boardCard = this.board[row][col];
                if (boardCard && boardCard.rank === previousRank && boardCard.suit === card.suit) {
                    // Found the previous card, return the position to its right
                    const targetCol = col + 1;
                    if (targetCol < this.cardsPerRow) {
                        return { row, col: targetCol };
                    }
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
                    
                    if (this.settings.cardDisplay !== 'text') {
                        const imageFilename = this.getCardImageFilename(cell);
                        if (imageFilename) {
                            const deckConfig = this.deckConfigs[this.settings.cardDisplay];
                            const img = document.createElement('img');
                            img.src = `${deckConfig.directory}/${imageFilename}`;
                            img.alt = `${cell.rank}${cell.suit}`;
                            cellDiv.appendChild(img);
                        } else {
                            // Fallback to text if image not found
                            cellDiv.textContent = `${cell.rank}${cell.suit}`;
                        }
                    } else {
                        cellDiv.textContent = `${cell.rank}${cell.suit}`;
                    }
                    
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
        const redealsCount = document.getElementById('redeals-count');
        const movesCount = document.getElementById('moves-count');
        const redealMovesCount = document.getElementById('redeal-moves-count');
        const correctCardsCount = document.getElementById('correct-cards-count');
        
        // Update redeals count
        redealsCount.textContent = `Redeals: ${this.redealCount}`;
        
        // Update real-time statistics
        movesCount.textContent = `Moves: ${this.stats.currentGameMoves}`;
        redealMovesCount.textContent = `Since Redeal: ${this.stats.currentRedealMoves}`;
        correctCardsCount.textContent = `Correct: ${this.countCorrectCards()}`;
        
        if (this.checkWin()) {
            status.textContent = `🎉 Congratulations! You won! 🎉`;
            status.className = 'status win';
            if (!this.gameWon) {
                this.gameWon = true;
                this.trackGameCompletion();
            }
        } else {
            status.textContent = `Click New Game to start!`;
            status.className = 'status';
        }

        // Update redeal button
        const redealBtn = document.getElementById('redeal-btn');
        if (this.gameWon) {
            redealBtn.disabled = true;
        } else if (this.shouldEnableRedeal()) {
            redealBtn.disabled = false;
            if (!this.selectedCard) {
                status.textContent = `All gaps are blocked! Click Redeal to continue.`;
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

    // Statistics tracking methods
    trackMove() {
        this.stats.currentGameMoves++;
        this.stats.currentRedealMoves++;
        this.stats.totalMoves++;
        this.updateStats();
    }

    trackRedeal() {
        this.stats.totalRedeals++;
        this.stats.currentRedealMoves = 0;
        this.updateStats();
    }

    trackGameCompletion() {
        this.stats.completedGames++;
        this.updateStats();
    }

    trackNewGame() {
        this.stats.totalGames++;
        this.stats.currentGameMoves = 0;
        this.stats.currentRedealMoves = 0;
        this.updateStats();
    }

    updateStats() {
        if (this.stats.totalGames > 0) {
            this.stats.averageRedealsPerGame = (this.stats.totalRedeals / this.stats.totalGames).toFixed(1);
            this.stats.averageMovesPerGame = (this.stats.totalMoves / this.stats.totalGames).toFixed(1);
            this.stats.completionRate = ((this.stats.completedGames / this.stats.totalGames) * 100).toFixed(1);
        }
    }

    getStats() {
        return { ...this.stats };
    }

    countCorrectCards() {
        let correctCount = 0;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < this.cardsPerRow - 1; col++) { // -1 because we need one less than cardsPerRow for the sequence
                const card = this.board[row][col];
                if (!card) continue; // Skip gaps
                
                if (col === 0) {
                    // First position must be a 2
                    if (card.rank === '2') {
                        correctCount++;
                    }
                } else {
                    // Must be next card in sequence and same suit as previous
                    const expectedRank = this.ranks[col];
                    const previousCard = this.board[row][col - 1];
                    
                    if (previousCard && card.rank === expectedRank && card.suit === previousCard.suit) {
                        correctCount++;
                    } else {
                        break; // Sequence broken, stop counting for this row
                    }
                }
            }
        }
        
        return correctCount;
    }
}

let game = new GapsGame();

function newGame() {
    // Create new game instance but preserve the current settings and statistics
    const currentCardsPerRow = game.cardsPerRow;
    const currentSettings = { ...game.settings };
    const currentStats = { ...game.stats };
    
    game = new GapsGame();
    
    // Restore the settings
    game.setCardsPerRow(currentCardsPerRow);
    game.settings = currentSettings;
    
    // Restore the statistics
    game.stats = currentStats;
    
    // Track new game for statistics
    game.trackNewGame();
    
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

function showStats() {
    updateStatsUI();
    const statsModal = document.getElementById('stats-modal');
    statsModal.style.display = 'flex';
    
    // Add click event listener to close when clicking outside
    const closeStatsModal = (event) => {
        if (event.target === statsModal) {
            statsModal.style.display = 'none';
            document.removeEventListener('click', closeStatsModal);
        }
    };
    
    // Use setTimeout to avoid immediate closure
    setTimeout(() => {
        document.addEventListener('click', closeStatsModal);
    }, 10);
}

function closeStats() {
    const statsModal = document.getElementById('stats-modal');
    statsModal.style.display = 'none';
}

function updateStatsUI() {
    const stats = game.getStats();
    
    document.getElementById('total-games').textContent = stats.totalGames;
    document.getElementById('completed-games').textContent = stats.completedGames;
    document.getElementById('avg-redeals').textContent = stats.averageRedealsPerGame;
    document.getElementById('avg-moves').textContent = stats.averageMovesPerGame;
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
    const select = document.getElementById('cards-per-row-select-main');
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

function changeLookAhead() {
    const selectedRadio = document.querySelector('input[name="look-ahead"]:checked');
    if (selectedRadio) {
        const lookAheadSteps = parseInt(selectedRadio.value);
        game.settings.lookAheadSteps = lookAheadSteps;
        
        // Clear any existing hover highlights when changing the setting
        game.clearHoverHighlights();
    }
}

function changeCardDisplay() {
    const select = document.getElementById('card-display-select');
    const newDisplay = select.value;
    
    // Update the game setting
    game.settings.cardDisplay = newDisplay;
    
    // Re-render to show the new display mode
    game.render();
}

function updateSettingsUI() {
    // Update card hover highlighting toggle
    const cardHoverToggle = document.getElementById('card-hover-toggle');
    cardHoverToggle.classList.toggle('active', game.settings.cardHoverHighlighting);
    
    // Update redeal mode toggle
    const redealModeToggle = document.getElementById('redeal-mode-toggle');
    redealModeToggle.classList.toggle('active', game.settings.redealMode === 'strategic');
    
    // Update cards per row select
    const cardsPerRowSelect = document.getElementById('cards-per-row-select-main');
    cardsPerRowSelect.value = game.cardsPerRow;
    
    // Update look-ahead steps radio button
    const lookAheadRadio = document.querySelector(`input[name="look-ahead"][value="${game.settings.lookAheadSteps}"]`);
    if (lookAheadRadio) {
        lookAheadRadio.checked = true;
    }
    
    // Update card display select
    const cardDisplaySelect = document.getElementById('card-display-select');
    cardDisplaySelect.value = game.settings.cardDisplay;
}

// Initialize the UI when the page loads
document.addEventListener('DOMContentLoaded', function() {
    updateSettingsUI();
});

window.onload = () => {
    newGame();
    updateSettingsUI(); // Initialize settings UI with current game state
};