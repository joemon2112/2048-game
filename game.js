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

        // Tutorial Modal Functionality
        const tutorialModal = document.getElementById('tutorial-modal');
        const showTutorialBtn = document.getElementById('show-tutorial-btn');
        const closeTutorialBtn = document.querySelector('.close-tutorial');
        const startGameBtn = document.getElementById('start-game-btn');

        function openTutorial() {
            tutorialModal.style.display = 'block';
        }

        function closeTutorial() {
            tutorialModal.style.display = 'none';
        }

        showTutorialBtn.addEventListener('click', openTutorial);
        closeTutorialBtn.addEventListener('click', closeTutorial);
        startGameBtn.addEventListener('click', () => {
            closeTutorial();
            new Game2048(); // Directly create a new game instance
        });

        // Show tutorial on first visit
        if (!localStorage.getItem('tutorialShown')) {
            openTutorial();
            localStorage.setItem('tutorialShown', 'true');
        }

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
                tileElement.classList.add('tile');
                
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

    showModal(message, isWin) {
        const modal = document.createElement('div');
        modal.id = 'game-modal';
        modal.classList.add('modal');
        modal.classList.add(isWin ? 'win' : 'lose');

        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');

        const modalMessage = document.createElement('h2');
        modalMessage.textContent = message;

        const restartButton = document.createElement('button');
        restartButton.textContent = '新しいゲーム';
        restartButton.addEventListener('click', () => this.resetGame());

        modalContent.appendChild(modalMessage);
        modalContent.appendChild(restartButton);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);
    }

    closeModal() {
        const modal = document.getElementById('game-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
