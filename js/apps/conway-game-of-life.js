/**
 * Conway's Game of Life implementation
 * A cellular automaton simulation with interactive controls
 */

export class ConwayGameOfLife {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.grid = [];
        this.nextGrid = [];
        this.rows = 50;
        this.cols = 70;
        this.cellSize = 8;
        this.isRunning = false;
        this.generation = 0;
        this.animationId = null;
        this.speed = 200; // milliseconds between generations
        this.lastUpdate = 0;
        this.isInitialized = false;
        
        // UI elements
        this.startStopBtn = null;
        this.resetBtn = null;
        this.randomBtn = null;
        this.speedSlider = null;
        this.generationCounter = null;
        
        // Mouse interaction
        this.isMouseDown = false;
        this.isToggling = false;
        this.toggleState = true; // true = make alive, false = make dead
        
        // Bind methods
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.update = this.update.bind(this);
    }
    
    /**
     * Initialize the game when window is created
     */
    init() {
        if (this.isInitialized) return;
        
        setTimeout(() => {
            this.canvas = document.getElementById('lifeCanvas');
            this.startStopBtn = document.getElementById('startStopBtn');
            this.resetBtn = document.getElementById('resetBtn');
            this.randomBtn = document.getElementById('randomBtn');
            this.speedSlider = document.getElementById('speedSlider');
            this.generationCounter = document.getElementById('generationCounter');
            
            if (!this.canvas) {
                console.error('Conway Game of Life: Canvas not found');
                return;
            }
            
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
            this.initializeGrid();
            this.setupEventListeners();
            this.render();
            
            this.isInitialized = true;
            console.log('🎮 Conway\'s Game of Life initialized');
        }, 100);
    }
    
    /**
     * Setup canvas dimensions and properties
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Set canvas size to fill container
        this.canvas.width = containerRect.width - 4; // Account for border
        this.canvas.height = containerRect.height - 4;
        
        // Calculate grid dimensions based on canvas size
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        
        // Smooth rendering
        this.ctx.imageSmoothingEnabled = false;
    }
    
    /**
     * Initialize the grid with all dead cells
     */
    initializeGrid() {
        this.grid = [];
        this.nextGrid = [];
        
        for (let row = 0; row < this.rows; row++) {
            this.grid[row] = [];
            this.nextGrid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col] = 0; // 0 = dead, 1 = alive
                this.nextGrid[row][col] = 0;
            }
        }
        
        this.generation = 0;
        this.updateGenerationCounter();
    }
    
    /**
     * Setup event listeners for controls and canvas interaction
     */
    setupEventListeners() {
        // Control buttons
        if (this.startStopBtn) {
            this.startStopBtn.addEventListener('click', () => this.toggleRunning());
        }
        
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.reset());
        }
        
        if (this.randomBtn) {
            this.randomBtn.addEventListener('click', () => this.randomize());
        }
        
        if (this.speedSlider) {
            this.speedSlider.addEventListener('input', (e) => {
                this.speed = parseInt(e.target.value);
            });
        }
        
        // Canvas interaction
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mouseleave', this.handleMouseUp);
        this.canvas.addEventListener('click', this.handleClick);
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * Handle mouse down for drag-to-draw functionality
     */
    handleMouseDown(e) {
        this.isMouseDown = true;
        this.isToggling = true;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (this.isValidCell(row, col)) {
            this.toggleState = !this.grid[row][col]; // Toggle to opposite state
            this.grid[row][col] = this.toggleState ? 1 : 0;
            this.render();
        }
    }
    
    /**
     * Handle mouse move for drag-to-draw functionality
     */
    handleMouseMove(e) {
        if (!this.isMouseDown || !this.isToggling) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (this.isValidCell(row, col)) {
            this.grid[row][col] = this.toggleState ? 1 : 0;
            this.render();
        }
    }
    
    /**
     * Handle mouse up
     */
    handleMouseUp() {
        this.isMouseDown = false;
        this.isToggling = false;
    }
    
    /**
     * Handle click to toggle individual cells
     */
    handleClick(e) {
        if (this.isRunning) return; // Don't allow editing while running
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (this.isValidCell(row, col)) {
            this.grid[row][col] = this.grid[row][col] ? 0 : 1;
            this.render();
        }
    }
    
    /**
     * Check if cell coordinates are valid
     */
    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    /**
     * Toggle the game running state
     */
    toggleRunning() {
        this.isRunning = !this.isRunning;
        
        if (this.isRunning) {
            this.startStopBtn.textContent = 'Stop';
            this.startStopBtn.style.background = '#ff6b6b';
            this.startGame();
        } else {
            this.startStopBtn.textContent = 'Start';
            this.startStopBtn.style.background = '#4a90e2';
            this.stopGame();
        }
    }
    
    /**
     * Start the game animation
     */
    startGame() {
        this.lastUpdate = performance.now();
        this.animationId = requestAnimationFrame(this.update);
    }
    
    /**
     * Stop the game animation
     */
    stopGame() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Game update loop
     */
    update(timestamp) {
        if (!this.isRunning) return;
        
        if (timestamp - this.lastUpdate >= this.speed) {
            this.nextGeneration();
            this.render();
            this.lastUpdate = timestamp;
        }
        
        this.animationId = requestAnimationFrame(this.update);
    }
    
    /**
     * Calculate the next generation based on Conway's rules
     */
    nextGeneration() {
        // Calculate next state for all cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const neighbors = this.countNeighbors(row, col);
                const currentState = this.grid[row][col];
                
                // Conway's Game of Life rules:
                // 1. Any live cell with fewer than two live neighbors dies (underpopulation)
                // 2. Any live cell with two or three live neighbors lives on to the next generation
                // 3. Any live cell with more than three live neighbors dies (overpopulation)
                // 4. Any dead cell with exactly three live neighbors becomes a live cell (reproduction)
                
                if (currentState === 1) { // Currently alive
                    if (neighbors < 2 || neighbors > 3) {
                        this.nextGrid[row][col] = 0; // Dies
                    } else {
                        this.nextGrid[row][col] = 1; // Survives
                    }
                } else { // Currently dead
                    if (neighbors === 3) {
                        this.nextGrid[row][col] = 1; // Born
                    } else {
                        this.nextGrid[row][col] = 0; // Stays dead
                    }
                }
            }
        }
        
        // Swap grids
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
        
        this.generation++;
        this.updateGenerationCounter();
    }
    
    /**
     * Count living neighbors for a cell
     */
    countNeighbors(row, col) {
        let count = 0;
        
        // Check all 8 neighboring cells
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip the cell itself
                
                const newRow = row + i;
                const newCol = col + j;
                
                // Check bounds
                if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                    count += this.grid[newRow][newCol];
                }
            }
        }
        
        return count;
    }
    
    /**
     * Reset the game to initial state
     */
    reset() {
        this.stopGame();
        this.initializeGrid();
        this.render();
        
        this.startStopBtn.textContent = 'Start';
        this.startStopBtn.style.background = '#4a90e2';
        this.isRunning = false;
    }
    
    /**
     * Randomize the grid with living cells
     */
    randomize() {
        this.stopGame();
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col] = Math.random() < 0.3 ? 1 : 0; // 30% chance of being alive
            }
        }
        
        this.generation = 0;
        this.updateGenerationCounter();
        this.render();
        
        this.startStopBtn.textContent = 'Start';
        this.startStopBtn.style.background = '#4a90e2';
        this.isRunning = false;
    }
    
    /**
     * Update the generation counter display
     */
    updateGenerationCounter() {
        if (this.generationCounter) {
            this.generationCounter.textContent = `Generation: ${this.generation}`;
        }
    }
    
    /**
     * Render the current grid state
     */
    render() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines (subtle)
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let col = 0; col <= this.cols; col++) {
            const x = col * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.rows * this.cellSize);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let row = 0; row <= this.rows; row++) {
            const y = row * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.cols * this.cellSize, y);
            this.ctx.stroke();
        }
        
        // Draw living cells
        this.ctx.fillStyle = '#4a90e2';
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col] === 1) {
                    const x = col * this.cellSize + 1;
                    const y = row * this.cellSize + 1;
                    this.ctx.fillRect(x, y, this.cellSize - 2, this.cellSize - 2);
                }
            }
        }
    }
    
    /**
     * Cleanup when window is closed
     */
    destroy() {
        this.stopGame();
        this.isInitialized = false;
        
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mouseup', this.handleMouseUp);
            this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
            this.canvas.removeEventListener('click', this.handleClick);
            this.canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
        }
        
        console.log('🎮 Conway\'s Game of Life destroyed');
    }
}

// Global instance for window management
let gameOfLifeInstance = null;

// Export initialization function
export function initializeConwayGameOfLife() {
    if (!gameOfLifeInstance) {
        gameOfLifeInstance = new ConwayGameOfLife();
    }
    gameOfLifeInstance.init();
    return gameOfLifeInstance;
}

// Export cleanup function
export function destroyConwayGameOfLife() {
    if (gameOfLifeInstance) {
        gameOfLifeInstance.destroy();
        gameOfLifeInstance = null;
    }
} 