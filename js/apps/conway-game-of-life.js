/**
 * Conway's Game of Life - Chillhouse Edition
 * A soothing ambient cellular automaton with flowing blue and purple life
 */

export class ConwayGameOfLife {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.grid = [];
        this.nextGrid = [];
        this.rows = 60;
        this.cols = 80;
        this.cellSize = 7;
        this.isRunning = false;
        this.generation = 0;
        this.animationId = null;
        this.speed = 180; // milliseconds between generations - slower for chill vibes
        this.lastUpdate = 0;
        this.isInitialized = false;
        
        // Battle system: 0 = dead, 1 = blue team, 2 = purple team
        this.blueCount = 0;
        this.purpleCount = 0;
        this.totalCells = 0;
        
        // Session timer
        this.sessionStartTime = Date.now();
        this.sessionTimer = null;
        
        // Victory and restart system
        this.victoryThreshold = 0.95; // 95% dominance
        this.restartDelay = 3000; // 3 seconds
        this.isRestarting = false;
        this.restartTimer = null;
        
        // Bind methods
        this.update = this.update.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.updateSessionTimer = this.updateSessionTimer.bind(this);
    }
    
    /**
     * Initialize the game when window is created
     */
    init() {
        if (this.isInitialized) return;
        
        setTimeout(() => {
            this.canvas = document.getElementById('lifeCanvas');
            
            if (!this.canvas) {
                console.error('Conway Game of Life: Canvas not found');
                return;
            }
            
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
            this.initializeGrid();
            this.setupSessionTimer();
            this.startAutomaticBattle();
            
            this.isInitialized = true;
            console.log('🌀 Conway\'s Chillhouse Edition initialized');
        }, 100);
    }
    
    /**
     * Setup canvas dimensions and properties
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Set canvas size to fill container
        this.canvas.width = containerRect.width - 4;
        this.canvas.height = containerRect.height - 4;
        
        // Calculate grid dimensions based on canvas size
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        
        // Smooth, minimalist rendering
        this.ctx.imageSmoothingEnabled = true;
        
        // Chillhouse ambient background
        this.canvas.style.background = 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 50%, #16213e 100%)';
        this.canvas.style.borderRadius = '16px';
        this.canvas.style.boxShadow = 'inset 0 0 40px rgba(139, 69, 19, 0.1), 0 0 30px rgba(0,0,0,0.3)';
        
        // Set up resize observer
        this.setupResizeObserver();
    }
    
    /**
     * Setup resize observer to handle window resizing
     */
    setupResizeObserver() {
        if (typeof ResizeObserver !== 'undefined') {
            const container = this.canvas.parentElement;
            this.resizeObserver = new ResizeObserver(() => {
                this.handleWindowResize();
            });
            this.resizeObserver.observe(container);
        } else {
            window.addEventListener('resize', this.handleWindowResize);
        }
    }
    
    /**
     * Handle window resize events
     */
    handleWindowResize() {
        if (!this.canvas || !this.ctx) return;
        
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        const newWidth = containerRect.width - 4;
        const newHeight = containerRect.height - 4;
        
        if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
            
            const newCols = Math.floor(this.canvas.width / this.cellSize);
            const newRows = Math.floor(this.canvas.height / this.cellSize);
            
            if (newCols !== this.cols || newRows !== this.rows) {
                this.resizeGrid(newRows, newCols);
            }
            
            this.ctx.imageSmoothingEnabled = true;
            this.render();
        }
    }
    
    /**
     * Resize grid while preserving existing cells
     */
    resizeGrid(newRows, newCols) {
        const oldGrid = this.grid;
        const oldRows = this.rows;
        const oldCols = this.cols;
        
        this.rows = newRows;
        this.cols = newCols;
        
        this.grid = [];
        this.nextGrid = [];
        
        for (let row = 0; row < this.rows; row++) {
            this.grid[row] = [];
            this.nextGrid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                if (row < oldRows && col < oldCols && oldGrid[row] && oldGrid[row][col] !== undefined) {
                    this.grid[row][col] = oldGrid[row][col];
                } else {
                    this.grid[row][col] = 0;
                }
                this.nextGrid[row][col] = 0;
            }
        }
        
        this.updateStats();
    }
    
    /**
     * Initialize the grid with random blue and purple cells
     */
    initializeGrid() {
        this.grid = [];
        this.nextGrid = [];
        
        for (let row = 0; row < this.rows; row++) {
            this.grid[row] = [];
            this.nextGrid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                // Random placement with 15% chance for each team
                const rand = Math.random();
                if (rand < 0.15) {
                    this.grid[row][col] = 1; // Blue team
                } else if (rand < 0.30) {
                    this.grid[row][col] = 2; // Purple team
                } else {
                    this.grid[row][col] = 0; // Dead cell
                }
                this.nextGrid[row][col] = 0;
            }
        }
        
        this.generation = 0;
        this.updateStats();
    }
    
    /**
     * Setup session timer display
     */
    setupSessionTimer() {
        // Create timer display in top right
        const container = this.canvas.parentElement;
        const timerDiv = document.createElement('div');
        timerDiv.id = 'sessionTimer';
        timerDiv.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(45, 27, 78, 0.8);
            padding: 10px 16px;
            border-radius: 25px;
            font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
            font-size: 13px;
            font-weight: 400;
            color: #e8d5ff;
            box-shadow: 0 4px 20px rgba(139, 69, 19, 0.2), inset 0 1px 0 rgba(255,255,255,0.1);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(232, 213, 255, 0.2);
        `;
        timerDiv.textContent = '0:00';
        container.appendChild(timerDiv);
        
        // Start session timer
        this.sessionTimer = setInterval(this.updateSessionTimer, 1000);
        this.updateSessionTimer();
    }
    
    /**
     * Update session timer display
     */
    updateSessionTimer() {
        const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timerDisplay = document.getElementById('sessionTimer');
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * Start the automatic battle
     */
    startAutomaticBattle() {
        this.isRunning = true;
        this.isRestarting = false;
        this.update();
    }
    
    /**
     * Main update loop
     */
    update(timestamp = 0) {
        if (!this.isRunning) return;
        
        if (timestamp - this.lastUpdate >= this.speed) {
            this.nextGeneration();
            this.render();
            this.lastUpdate = timestamp;
            
            // Check for victory condition
            this.checkVictoryCondition();
        }
        
        this.animationId = requestAnimationFrame(this.update);
    }
    
    /**
     * Calculate next generation
     */
    nextGeneration() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const neighbors = this.countTeamNeighbors(row, col);
                const currentCell = this.grid[row][col];
                
                // Conway's rules adapted for team battle
                if (currentCell === 0) {
                    // Dead cell - can be born if exactly 3 neighbors
                    const totalNeighbors = neighbors.blue + neighbors.purple;
                    if (totalNeighbors === 3) {
                        // Born as the dominant team
                        this.nextGrid[row][col] = neighbors.blue > neighbors.purple ? 1 : 2;
                    } else {
                        this.nextGrid[row][col] = 0;
                    }
                } else {
                    // Living cell - survives with 2-3 neighbors
                    const totalNeighbors = neighbors.blue + neighbors.purple;
                    if (totalNeighbors === 2 || totalNeighbors === 3) {
                        this.nextGrid[row][col] = currentCell;
                    } else {
                        this.nextGrid[row][col] = 0;
                    }
                }
            }
        }
        
        // Swap grids
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
        this.generation++;
        this.updateStats();
    }
    
    /**
     * Count team neighbors for a cell
     */
    countTeamNeighbors(row, col) {
        let blue = 0;
        let purple = 0;
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (this.isValidCell(newRow, newCol)) {
                    if (this.grid[newRow][newCol] === 1) blue++;
                    else if (this.grid[newRow][newCol] === 2) purple++;
                }
            }
        }
        
        return { blue, purple };
    }
    
    /**
     * Check if cell coordinates are valid
     */
    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    /**
     * Update team statistics
     */
    updateStats() {
        this.blueCount = 0;
        this.purpleCount = 0;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col] === 1) this.blueCount++;
                else if (this.grid[row][col] === 2) this.purpleCount++;
            }
        }
        
        this.totalCells = this.blueCount + this.purpleCount;
    }
    
    /**
     * Check for victory condition and handle restart
     */
    checkVictoryCondition() {
        if (this.isRestarting || this.totalCells === 0) return;
        
        const bluePercentage = this.totalCells > 0 ? this.blueCount / this.totalCells : 0;
        const purplePercentage = this.totalCells > 0 ? this.purpleCount / this.totalCells : 0;
        
        if (bluePercentage >= this.victoryThreshold || purplePercentage >= this.victoryThreshold) {
            this.isRestarting = true;
            this.isRunning = false;
            
            // Show peaceful restart indicator
            this.showRestartIndicator();
            
            // Restart after delay
            this.restartTimer = setTimeout(() => {
                this.initializeGrid();
                this.render();
                this.startAutomaticBattle();
            }, this.restartDelay);
        }
    }
    
    /**
     * Show peaceful restart indicator
     */
    showRestartIndicator() {
        const container = this.canvas.parentElement;
        const indicator = document.createElement('div');
        indicator.id = 'restartIndicator';
        indicator.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(22, 33, 62, 0.95);
            padding: 25px 40px;
            border-radius: 35px;
            font-family: 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
            font-size: 20px;
            font-weight: 300;
            color: #e8d5ff;
            text-align: center;
            box-shadow: 0 12px 40px rgba(139, 69, 19, 0.3), inset 0 2px 0 rgba(255,255,255,0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(232, 213, 255, 0.2);
            animation: peacefulPulse 3s ease-in-out;
        `;
        
        const winner = this.blueCount > this.purpleCount ? 'Blue' : 'Purple';
        const emoji = this.blueCount > this.purpleCount ? '🌀' : '✨';
        indicator.innerHTML = `${emoji} ${winner} emerges<div style="font-size: 16px; margin-top: 12px; opacity: 0.8; font-weight: 200;">~ flowing into the next cycle ~</div>`;
        
        container.appendChild(indicator);
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes peacefulPulse {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); filter: blur(2px); }
                15% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.02); filter: blur(0px); }
                25% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                75% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                85% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.02); filter: blur(0px); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); filter: blur(2px); }
            }
        `;
        document.head.appendChild(style);
        
        // Remove indicator after delay
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, this.restartDelay);
    }
    
    /**
     * Render the current grid state with chillhouse vibes
     */
    render() {
        if (!this.ctx) return;
        
        // Clear canvas with atmospheric background
        const bgGradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
        );
        bgGradient.addColorStop(0, '#2d1b4e');
        bgGradient.addColorStop(0.6, '#1a1a2e');
        bgGradient.addColorStop(1, '#16213e');
        
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cells with distinct colors and ambient glow
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cellState = this.grid[row][col];
                if (cellState > 0) {
                    const x = col * this.cellSize;
                    const y = row * this.cellSize;
                    const size = this.cellSize - 1;
                    
                    if (cellState === 1) { // Distinct blue team
                        this.drawChillCell(x, y, size, '#4da6ff', '#0066cc');
                    } else if (cellState === 2) { // Distinct purple team  
                        this.drawChillCell(x, y, size, '#b347d9', '#8e44ad');
                    }
                }
            }
        }
    }
    
    /**
     * Draw a cell with chillhouse ambient glow
     */
    drawChillCell(x, y, size, mainColor, shadowColor) {
        // Soft ambient glow
        this.ctx.shadowColor = mainColor;
        this.ctx.shadowBlur = 3;
        this.ctx.globalAlpha = 0.8;
        
        // Main cell with rounded corners
        this.ctx.fillStyle = mainColor;
        this.ctx.fillRect(x + 0.5, y + 0.5, size - 1, size - 1);
        
        // Brighter center for depth
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = this.lightenColor(mainColor);
        const centerSize = Math.max(1, size - 3);
        const centerOffset = (size - centerSize) / 2;
        this.ctx.fillRect(x + centerOffset + 0.5, y + centerOffset + 0.5, centerSize, centerSize);
        
        // Reset drawing state
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Lighten a color for depth effect
     */
    lightenColor(color) {
        if (color === '#4da6ff') return '#80c1ff';
        if (color === '#b347d9') return '#c966e8';
        return color;
    }
    
    /**
     * Cleanup when window is closed
     */
    destroy() {
        this.isRunning = false;
        this.isInitialized = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
            this.restartTimer = null;
        }
        
        // Clean up resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        } else {
            window.removeEventListener('resize', this.handleWindowResize);
        }
        
        // Clean up timer display
        const timerDisplay = document.getElementById('sessionTimer');
        if (timerDisplay && timerDisplay.parentNode) {
            timerDisplay.parentNode.removeChild(timerDisplay);
        }
        
        // Clean up restart indicator
        const restartIndicator = document.getElementById('restartIndicator');
        if (restartIndicator && restartIndicator.parentNode) {
            restartIndicator.parentNode.removeChild(restartIndicator);
        }
        
        console.log('🌀 Conway\'s Chillhouse Edition flowing away');
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