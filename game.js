class Game2048 {
    static COLORS = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };
    constructor(gridSize = 4) {
        this.gridSize = gridSize;
        this.grid = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
        this.score = 0;
        this.bestScore = localStorage.getItem('best2048Score') || 0;
        this.gameContainer = document.getElementById('grid');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.newGameButton = document.getElementById('new-game');

        this.setupEventListeners();
        this.updateScoreDisplay();
        this.renderGrid();
        this.spawnTile();
        this.spawnTile();
    }

    initializeGrid() {
        this.grid = Array.from({ length: this.gridSize }, () => 
            Array(this.gridSize).fill(0)
        );
        this.gameContainer.innerHTML = '';
        this.gameContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        this.spawnTile();
        this.spawnTile();
        this.renderGrid();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': this.move('up'); break;
                case 'ArrowDown': this.move('down'); break;
                case 'ArrowLeft': this.move('left'); break;
                case 'ArrowRight': this.move('right'); break;
            }
        });

        this.newGameButton.addEventListener('click', () => this.resetGame());
    }

    spawnTile() {
        const emptyCells = [];
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
            this.renderGrid();
        }
    }

    renderGrid() {
        this.gameContainer.innerHTML = '';
        this.gameContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const tileValue = this.grid[r][c];
                const tileElement = document.createElement('div');
                tileElement.classList.add('grid-cell');
                tileElement.dataset.row = r;
                tileElement.dataset.col = c;
                
                if (tileValue !== 0) {
                    tileElement.textContent = tileValue;
                    tileElement.classList.add(`tile-${tileValue}`);
                    tileElement.style.backgroundColor = Game2048.COLORS[tileValue] || '#cdc1b4';
                    tileElement.style.color = tileValue > 4 ? 'white' : 'black';
                    tileElement.style.animation = 'pop-in 0.2s ease-out';
                }
                
                this.gameContainer.appendChild(tileElement);
            }
        }
    }

    move(direction) {
        let moved = false;
        const rotatedGrid = this.rotateGrid(direction);

        for (let r = 0; r < this.gridSize; r++) {
            const row = rotatedGrid[r].filter(val => val !== 0);
            
            for (let c = 0; c < row.length - 1; c++) {
                if (row[c] === row[c + 1]) {
                    row[c] *= 2;
                    this.score += row[c];
                    row.splice(c + 1, 1);
                    moved = true;
                }
            }

            while (row.length < this.gridSize) {
                row.push(0);
            }

            rotatedGrid[r] = row;
            if (JSON.stringify(rotatedGrid[r]) !== JSON.stringify(this.grid[r])) {
                moved = true;
            }
        }

        this.grid = this.unrotateGrid(rotatedGrid, direction);
        
        if (moved) {
            this.spawnTile();
            this.updateScoreDisplay();
            this.checkGameOver();
        }
    }

    rotateGrid(direction) {
        let rotated = JSON.parse(JSON.stringify(this.grid));
        
        switch(direction) {
            case 'left':
                return rotated;
            case 'right':
                return rotated.map(row => row.reverse());
            case 'up':
                return rotated[0].map((_, colIndex) => rotated.map(row => row[colIndex]).reverse());
            case 'down':
                return rotated[0].map((_, colIndex) => rotated.map(row => row[colIndex]));
        }
    }

    unrotateGrid(rotatedGrid, direction) {
        switch(direction) {
            case 'left':
                return rotatedGrid;
            case 'right':
                return rotatedGrid.map(row => row.reverse());
            case 'up':
                return rotatedGrid[0].map((_, colIndex) => 
                    rotatedGrid.map(row => row[colIndex]).reverse()
                );
            case 'down':
                return rotatedGrid[0].map((_, colIndex) => 
                    rotatedGrid.map(row => row[colIndex])
                );
        }
    }

    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('best2048Score', this.bestScore);
        }
        
        this.bestScoreElement.textContent = this.bestScore;
    }

    checkGameOver() {
        // Check if 2048 is reached
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] === 2048) {
                    this.showModal('おめでとう！2048に到達しました！', true);
                    return;
                }
            }
        }

        // Check if there are any empty cells
        const hasEmptyCell = this.grid.some(row => row.includes(0));
        if (hasEmptyCell) return;

        // Check if any moves are possible
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (
                    (r > 0 && this.grid[r][c] === this.grid[r-1][c]) ||
                    (r < this.gridSize - 1 && this.grid[r][c] === this.grid[r+1][c]) ||
                    (c > 0 && this.grid[r][c] === this.grid[r][c-1]) ||
                    (c < this.gridSize - 1 && this.grid[r][c] === this.grid[r][c+1])
                ) {
                    return;
                }
            }
        }

        this.showModal('ゲームオーバー！もう一度挑戦してください。', false);
    }

    resetGame() {
        this.score = 0;
        this.initializeGrid();
        this.updateScoreDisplay();
        this.spawnTile();
        this.spawnTile();
        this.closeModal();
    }

    initGrid() {
        // Reset the grid
        this.grid = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(0));
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        
        // Clear existing grid display
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';
        
        // Recreate grid cells
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                gridElement.appendChild(cell);
            }
        }
        
        // Add initial tiles
        this.initializeGrid();
        
        // Reattach event listeners
        this.setupEventListeners();
    }

    // Rotate grid for different move directions
    rotateGrid(direction) {
        let rotated = JSON.parse(JSON.stringify(this.grid));
        
        switch(direction) {
            case 'left':
                return rotated;
            case 'right':
                return rotated.map(row => row.reverse());
            case 'up':
                return rotated[0].map((_, colIndex) => rotated.map(row => row[colIndex]).reverse());
            case 'down':
                return rotated[0].map((_, colIndex) => rotated.map(row => row[colIndex]));
        }
    }

    // Add visual feedback for tile merging
    addMergeTileEffect(row, col) {
        const gridElement = document.getElementById('grid');
        const cell = gridElement.querySelector(`[data-row='${row}'][data-col='${col}']`);
        if (cell) {
            cell.classList.add('merge');
            setTimeout(() => {
                cell.classList.remove('merge');
            }, 300);
        }
    }

    // Add score popup effect
    showScorePopup(score, row, col) {
        const gridElement = document.getElementById('grid');
        const popup = document.createElement('div');
        popup.classList.add('score-popup');
        popup.textContent = `+${score}`;
        
        const cell = gridElement.querySelector(`[data-row='${row}'][data-col='${col}']`);
        if (cell) {
            const rect = cell.getBoundingClientRect();
            popup.style.left = `${rect.left + rect.width / 2}px`;
            popup.style.top = `${rect.top}px`;
            document.body.appendChild(popup);

            setTimeout(() => {
                document.body.removeChild(popup);
            }, 1000);
        }
    }

    // Merge tiles with visual feedback
    mergeTiles(row, col, newValue) {
        this.grid[row][col] = newValue;
        this.score += newValue;
        document.getElementById('score').textContent = this.score;
    }

    closeModal() {
        const modal = document.getElementById('game-modal');
        if (modal) {
            modal.remove();
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Ensure tutorial modal is set up
    const tutorialModal = document.getElementById('tutorial-modal');
    const showTutorialBtn = document.createElement('button');
    showTutorialBtn.id = 'show-tutorial-btn';
    showTutorialBtn.textContent = 'チュートリアル';
    showTutorialBtn.style.position = 'fixed';
    showTutorialBtn.style.bottom = '20px';
    showTutorialBtn.style.right = '20px';
    showTutorialBtn.style.backgroundColor = '#4CAF50';
    showTutorialBtn.style.color = 'white';
    showTutorialBtn.style.border = 'none';
    showTutorialBtn.style.padding = '10px 20px';
    showTutorialBtn.style.borderRadius = '5px';
    showTutorialBtn.style.cursor = 'pointer';
    showTutorialBtn.style.fontSize = '16px';
    showTutorialBtn.style.transition = 'background-color 0.3s ease';
    showTutorialBtn.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    showTutorialBtn.addEventListener('mouseover', () => {
        showTutorialBtn.style.backgroundColor = '#45a049';
    });
    showTutorialBtn.addEventListener('mouseout', () => {
        showTutorialBtn.style.backgroundColor = '#4CAF50';
    });
    document.body.appendChild(showTutorialBtn);

    const closeTutorialBtn = document.querySelector('.close-tutorial');
    const startGameBtn = document.getElementById('start-game-btn');

    // Set up tutorial modal functionality
    if (tutorialModal && showTutorialBtn && closeTutorialBtn && startGameBtn) {
        showTutorialBtn.addEventListener('click', function() {
            tutorialModal.style.display = 'block';
        });

        closeTutorialBtn.addEventListener('click', function() {
            tutorialModal.style.display = 'none';
        });

        startGameBtn.addEventListener('click', function(event) {
            event.preventDefault();
            tutorialModal.style.display = 'none';
            
            // Clear existing grid
            const gridElement = document.getElementById('grid');
            if (gridElement) {
                gridElement.innerHTML = '';
            }
            
            // Start new game
            new Game2048();
        });

        // Show tutorial on first visit
        if (!localStorage.getItem('tutorialShown')) {
            tutorialModal.style.display = 'block';
            localStorage.setItem('tutorialShown', 'true');
        }
    } else {
        console.error('One or more tutorial modal elements not found');
    }

    // Initialize the game
    new Game2048();
});

// Add tutorial button to the page
function addTutorialButton() {
    const tutorialBtn = document.createElement('button');
    tutorialBtn.id = 'show-tutorial-btn';
    tutorialBtn.textContent = 'チュートリアル';
    document.body.appendChild(tutorialBtn);

    tutorialBtn.addEventListener('click', () => {
        const tutorialModal = document.getElementById('tutorial-modal');
        tutorialModal.style.display = 'block';
    });
}

// Initialize the game when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Game2048();
    });
} else {
    new Game2048();
}
