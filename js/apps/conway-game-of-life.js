/**
 * Conway's Game of Life - Battle Edition
 * A two-color cellular automaton battle simulation with retro CRT aesthetics
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
        this.speed = 150; // milliseconds between generations (initial value, updated by slider)
        this.lastUpdate = 0;
        this.isInitialized = false;
        this.maxGenerations = 800; // Game ends after 800 generations
        this.gameEnded = false;
        
        // Battle system: 0 = dead, 1 = green team, 2 = red team
        this.currentTeam = 1; // Team to place when clicking (1 = green, 2 = red)
        this.greenCount = 0;
        this.redCount = 0;
        
        // UI elements
        this.startStopBtn = null;
        this.resetBtn = null;
        this.randomBtn = null;
        this.speedSlider = null;
        this.generationCounter = null;
        this.teamSelector = null;
        this.statsDisplay = null;
        
        // Mouse interaction
        this.isMouseDown = false;
        this.isToggling = false;
        this.toggleState = 1; // 1 = green, 2 = red
        
        // CRT effect properties
        this.scanlineOffset = 0;
        this.glowIntensity = 0.8;
        
        // Bind methods
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.update = this.update.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);
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
            this.addBattleControls();
            this.render();
            
            this.isInitialized = true;
            console.log('🎮 Conway\'s Battle Edition initialized');
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
        
        // Smooth rendering disabled for pixel-perfect retro look
        this.ctx.imageSmoothingEnabled = false;
        
        // Set up CRT-style canvas background
        this.canvas.style.background = 'radial-gradient(ellipse, #001100 0%, #000000 70%)';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.boxShadow = 'inset 0 0 30px rgba(0, 255, 0, 0.1), 0 0 20px rgba(0, 0, 0, 0.8)';
        
        // Set up resize observer for game windows
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
            // Fallback for browsers without ResizeObserver
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
        
        // Update canvas size
        const newWidth = containerRect.width - 4;
        const newHeight = containerRect.height - 4;
        
        // Only resize if dimensions actually changed
        if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
            
            // Recalculate grid dimensions
            const newCols = Math.floor(this.canvas.width / this.cellSize);
            const newRows = Math.floor(this.canvas.height / this.cellSize);
            
            // If grid size changed, preserve existing cells and resize grid
            if (newCols !== this.cols || newRows !== this.rows) {
                this.resizeGrid(newRows, newCols);
            }
            
            // Restore canvas properties
            this.ctx.imageSmoothingEnabled = false;
            
            // Re-render with new dimensions
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
        
        // Update dimensions
        this.rows = newRows;
        this.cols = newCols;
        
        // Create new grids
        this.grid = [];
        this.nextGrid = [];
        
        for (let row = 0; row < this.rows; row++) {
            this.grid[row] = [];
            this.nextGrid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                // Preserve existing cells if they fit in new grid
                if (row < oldRows && col < oldCols && oldGrid[row] && oldGrid[row][col] !== undefined) {
                    this.grid[row][col] = oldGrid[row][col];
                } else {
                    this.grid[row][col] = 0; // Dead cell
                }
                this.nextGrid[row][col] = 0;
            }
        }
        
        // Update stats
        this.updateStats();
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
                this.grid[row][col] = 0; // 0 = dead, 1 = green team, 2 = red team
                this.nextGrid[row][col] = 0;
            }
        }
        
        this.generation = 0;
        this.updateStats();
    }
    
    /**
     * Add battle-specific controls
     */
    addBattleControls() {
        const controlsContainer = document.getElementById('gameControls');
        if (!controlsContainer) return;
        
        // Add team selector
        const teamSelectorHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin: 10px 0;">
                <span style="color: #eaf1fb; font-weight: 600;">Team:</span>
                <button id="greenTeamBtn" class="game-btn" style="background: #00ff00; color: #000; padding: 8px 16px; border: 2px solid #00aa00;">Green</button>
                <button id="redTeamBtn" class="game-btn" style="background: #ff0000; color: #fff; padding: 8px 16px; border: 2px solid #aa0000;">Red</button>
            </div>
            <div id="battleStats" style="color: #eaf1fb; font-family: 'Courier New', monospace; font-size: 14px; margin: 10px 0; line-height: 1.5;">
                <div>🟢 Green: <span id="greenCount">0</span> | 🔴 Red: <span id="redCount">0</span></div>
                <div id="battleResult" style="font-weight: bold; margin-top: 5px;"></div>
            </div>
        `;
        
        controlsContainer.insertAdjacentHTML('beforeend', teamSelectorHTML);
        
        // Set up team selector events
        const greenBtn = document.getElementById('greenTeamBtn');
        const redBtn = document.getElementById('redTeamBtn');
        
        if (greenBtn) {
            greenBtn.addEventListener('click', () => this.selectTeam(1));
        }
        
        if (redBtn) {
            redBtn.addEventListener('click', () => this.selectTeam(2));
        }
        
        this.updateTeamSelector();
    }
    
    /**
     * Select which team to place when clicking
     */
    selectTeam(team) {
        this.currentTeam = team;
        this.updateTeamSelector();
    }
    
    /**
     * Update team selector visual state
     */
    updateTeamSelector() {
        const greenBtn = document.getElementById('greenTeamBtn');
        const redBtn = document.getElementById('redTeamBtn');
        
        if (greenBtn) {
            greenBtn.style.opacity = this.currentTeam === 1 ? '1' : '0.5';
            greenBtn.style.boxShadow = this.currentTeam === 1 ? '0 0 10px #00ff00' : 'none';
        }
        
        if (redBtn) {
            redBtn.style.opacity = this.currentTeam === 2 ? '1' : '0.5';
            redBtn.style.boxShadow = this.currentTeam === 2 ? '0 0 10px #ff0000' : 'none';
        }
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
            this.randomBtn.addEventListener('click', () => this.randomizeBattle());
        }
        
        if (this.speedSlider) {
            this.speedSlider.addEventListener('input', (e) => {
                // Invert the slider: left = slow (high value), right = fast (low value)
                const sliderValue = parseInt(e.target.value);
                this.speed = 1050 - sliderValue; // Range: 50-1000ms (inverted)
            });
        }
        
        // Canvas interaction
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mouseleave', this.handleMouseUp);
        this.canvas.addEventListener('click', this.handleClick);
        
        // Right click switches teams
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.currentTeam = this.currentTeam === 1 ? 2 : 1;
            this.updateTeamSelector();
        });
    }
    
    /**
     * Get canvas coordinates from mouse event (handles window resize/scaling)
     */
    getCanvasCoordinates(e) {
        // Always get fresh bounding rect to handle window resizing
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        return { row, col, x, y };
    }
    
    /**
     * Handle mouse down for drag-to-draw functionality
     */
    handleMouseDown(e) {
        this.isMouseDown = true;
        this.isToggling = true;
        
        const { row, col } = this.getCanvasCoordinates(e);
        
        if (this.isValidCell(row, col)) {
            this.toggleState = this.currentTeam;
            this.grid[row][col] = this.toggleState;
            this.updateStats();
            this.render();
        }
    }
    
    /**
     * Handle mouse move for drag-to-draw functionality
     */
    handleMouseMove(e) {
        if (!this.isMouseDown || !this.isToggling) return;
        
        const { row, col } = this.getCanvasCoordinates(e);
        
        if (this.isValidCell(row, col)) {
            this.grid[row][col] = this.toggleState;
            this.updateStats();
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
     * Handle click to place team cells
     */
    handleClick(e) {
        if (this.isRunning) return; // Don't allow editing while running
        
        const { row, col } = this.getCanvasCoordinates(e);
        
        if (this.isValidCell(row, col)) {
            // Toggle between current team and dead
            this.grid[row][col] = this.grid[row][col] === this.currentTeam ? 0 : this.currentTeam;
            this.updateStats();
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
        if (this.gameEnded) {
            this.reset();
            return;
        }
        
        this.isRunning = !this.isRunning;
        
        if (this.isRunning) {
            this.startStopBtn.textContent = 'Stop Battle';
            this.startStopBtn.style.background = '#ff4444';
            this.startStopBtn.style.borderColor = '#aa0000';
            this.startGame();
        } else {
            this.startStopBtn.textContent = 'Start Battle';
            this.startStopBtn.style.background = '#004400';
            this.startStopBtn.style.borderColor = '#00aa00';
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
        if (!this.isRunning || this.gameEnded) return;
        
        if (timestamp - this.lastUpdate >= this.speed) {
            this.nextGeneration();
            this.render();
            this.lastUpdate = timestamp;
            
            // Update scanline effect only if game is still running
            if (!this.gameEnded) {
                this.scanlineOffset = (this.scanlineOffset + 1) % this.canvas.height;
            }
        }
        
        // Only continue animation if game hasn't ended
        if (!this.gameEnded) {
            this.animationId = requestAnimationFrame(this.update);
        }
    }
    
    /**
     * Calculate the next generation with battle rules
     */
    nextGeneration() {
        // Check if game should end
        if (this.generation >= this.maxGenerations) {
            this.endGame();
            return;
        }
        
        // Calculate next state for all cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const currentState = this.grid[row][col];
                const neighbors = this.countTeamNeighbors(row, col);
                
                // Battle rules:
                // 1. Dead cells become the majority team if exactly 3 neighbors
                // 2. Living cells survive with 2-3 neighbors of any team
                // 3. Living cells convert to majority team if outnumbered 2:1
                // 4. Overpopulation (>3) or underpopulation (<2) kills cells
                
                const totalNeighbors = neighbors.green + neighbors.red;
                
                if (currentState === 0) { // Dead cell
                    if (totalNeighbors === 3) {
                        // Birth: becomes the majority team
                        this.nextGrid[row][col] = neighbors.green > neighbors.red ? 1 : 2;
                    } else {
                        this.nextGrid[row][col] = 0; // Stays dead
                    }
                } else { // Living cell (green or red)
                    if (totalNeighbors < 2 || totalNeighbors > 3) {
                        this.nextGrid[row][col] = 0; // Dies
                    } else if (totalNeighbors === 2 || totalNeighbors === 3) {
                        // Survival logic with team conversion
                        const myTeamCount = currentState === 1 ? neighbors.green : neighbors.red;
                        const enemyTeamCount = currentState === 1 ? neighbors.red : neighbors.green;
                        
                        // Convert if outnumbered 2:1 or more
                        if (enemyTeamCount >= myTeamCount * 2 && enemyTeamCount > 0) {
                            this.nextGrid[row][col] = currentState === 1 ? 2 : 1; // Convert
                        } else {
                            this.nextGrid[row][col] = currentState; // Survive
                        }
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
     * Count neighbors by team
     */
    countTeamNeighbors(row, col) {
        let green = 0;
        let red = 0;
        
        // Check all 8 neighboring cells
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip the cell itself
                
                const newRow = row + i;
                const newCol = col + j;
                
                // Check bounds
                if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                    const cellState = this.grid[newRow][newCol];
                    if (cellState === 1) green++;
                    else if (cellState === 2) red++;
                }
            }
        }
        
        return { green, red };
    }
    
    /**
     * End the game and show final results
     */
    endGame() {
        // Immediately stop the game and prevent further updates
        this.isRunning = false;
        this.gameEnded = true;
        this.stopGame();
        
        // Calculate final scores
        const totalCells = this.greenCount + this.redCount;
        const greenPercentage = totalCells > 0 ? Math.round((this.greenCount / totalCells) * 100) : 0;
        const redPercentage = totalCells > 0 ? Math.round((this.redCount / totalCells) * 100) : 0;
        
        // Determine winner
        let winner, winnerColor;
        if (this.greenCount > this.redCount) {
            winner = 'GREEN TEAM WINS!';
            winnerColor = '#00ff00';
        } else if (this.redCount > this.greenCount) {
            winner = 'RED TEAM WINS!';
            winnerColor = '#ff0000';
        } else {
            winner = 'TIE GAME!';
            winnerColor = '#ffff00';
        }
        
        // Update button
        this.startStopBtn.textContent = 'New Game';
        this.startStopBtn.style.background = '#0066aa';
        this.startStopBtn.style.borderColor = '#00aaff';
        
        // Final render to ensure clean state
        this.render();
        
        // Show final results
        const battleResult = document.getElementById('battleResult');
        if (battleResult) {
            battleResult.innerHTML = `
                <div style="text-align: center; margin-top: 10px;">
                    <div style="color: ${winnerColor}; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                        🏆 GAME OVER - ${winner}
                    </div>
                    <div style="font-size: 14px; line-height: 1.5;">
                        <div>📊 Final Scores after ${this.maxGenerations} generations:</div>
                        <div style="margin: 5px 0;">
                            🟢 Green: ${this.greenCount} cells (${greenPercentage}%)
                        </div>
                        <div style="margin: 5px 0;">
                            🔴 Red: ${this.redCount} cells (${redPercentage}%)
                        </div>
                        <div style="margin-top: 10px; font-size: 12px; opacity: 0.8;">
                            Click "New Game" to play again
                        </div>
                    </div>
                </div>
            `;
        }
        
        console.log(`🏆 Game Over! ${winner} - Green: ${this.greenCount}, Red: ${this.redCount}`);
    }
    
    /**
     * Reset the game to initial state
     */
    reset() {
        this.stopGame();
        this.gameEnded = false;
        this.initializeGrid();
        this.render();
        
        this.startStopBtn.textContent = 'Start Battle';
        this.startStopBtn.style.background = '#004400';
        this.startStopBtn.style.borderColor = '#00aa00';
        this.isRunning = false;
    }
    
    /**
     * Randomize the grid with both teams
     */
    randomizeBattle() {
        this.stopGame();
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const rand = Math.random();
                if (rand < 0.15) {
                    this.grid[row][col] = 1; // Green team
                } else if (rand < 0.30) {
                    this.grid[row][col] = 2; // Red team
                } else {
                    this.grid[row][col] = 0; // Dead
                }
            }
        }
        
        this.generation = 0;
        this.updateStats();
        this.render();
        
        this.startStopBtn.textContent = 'Start Battle';
        this.startStopBtn.style.background = '#004400';
        this.startStopBtn.style.borderColor = '#00aa00';
        this.isRunning = false;
    }
    
    /**
     * Update population stats and battle result
     */
    updateStats() {
        this.greenCount = 0;
        this.redCount = 0;
        
        // Count populations
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col] === 1) this.greenCount++;
                else if (this.grid[row][col] === 2) this.redCount++;
            }
        }
        
        // Update UI
        if (this.generationCounter) {
            const remaining = this.maxGenerations - this.generation;
            this.generationCounter.textContent = `Generation: ${this.generation}/${this.maxGenerations} (${remaining} left)`;
        }
        
        const greenDisplay = document.getElementById('greenCount');
        const redDisplay = document.getElementById('redCount');
        const battleResult = document.getElementById('battleResult');
        
        if (greenDisplay) greenDisplay.textContent = this.greenCount;
        if (redDisplay) redDisplay.textContent = this.redCount;
        
        if (battleResult) {
            const total = this.greenCount + this.redCount;
            if (total === 0) {
                battleResult.textContent = '💀 Extinction';
                battleResult.style.color = '#666';
            } else if (this.greenCount > this.redCount * 2) {
                battleResult.textContent = '🟢 Green Dominance';
                battleResult.style.color = '#00ff00';
            } else if (this.redCount > this.greenCount * 2) {
                battleResult.textContent = '🔴 Red Dominance';
                battleResult.style.color = '#ff0000';
            } else {
                battleResult.textContent = '⚔️ Battle Raging';
                battleResult.style.color = '#ffff00';
            }
        }
    }
    
    /**
     * Render the current grid state with CRT effects
     */
    render() {
        if (!this.ctx) return;
        
        // Clear canvas with CRT-style background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, '#001100');
        gradient.addColorStop(0.7, '#000800');
        gradient.addColorStop(1, '#000000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cells with glow effects
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cellState = this.grid[row][col];
                if (cellState > 0) {
                    const x = col * this.cellSize + 1;
                    const y = row * this.cellSize + 1;
                    const size = this.cellSize - 2;
                    
                    // Team colors with phosphor glow
                    if (cellState === 1) { // Green team
                        this.drawGlowingPixel(x, y, size, '#00ff00', '#004400');
                    } else if (cellState === 2) { // Red team
                        this.drawGlowingPixel(x, y, size, '#ff0000', '#440000');
                    }
                }
            }
        }
        
        // Add CRT scanlines effect
        this.drawScanlines();
        
        // Add subtle grid lines for retro feel
        this.drawRetroGrid();
        
        // Add CRT curvature overlay
        this.drawCRTOverlay();
    }
    
    /**
     * Draw a glowing pixel with phosphor effect
     */
    drawGlowingPixel(x, y, size, mainColor, glowColor) {
        // Outer glow
        this.ctx.shadowColor = mainColor;
        this.ctx.shadowBlur = 4;
        this.ctx.fillStyle = glowColor;
        this.ctx.fillRect(x - 1, y - 1, size + 2, size + 2);
        
        // Main pixel
        this.ctx.shadowBlur = 2;
        this.ctx.fillStyle = mainColor;
        this.ctx.fillRect(x, y, size, size);
        
        // Bright center
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = this.brightenColor(mainColor, 0.3);
        this.ctx.fillRect(x + 1, y + 1, Math.max(1, size - 2), Math.max(1, size - 2));
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 'transparent';
    }
    
    /**
     * Brighten a hex color
     */
    brightenColor(color, factor) {
        if (color === '#00ff00') return '#66ff66';
        if (color === '#ff0000') return '#ff6666';
        return color;
    }
    
    /**
     * Draw CRT scanlines
     */
    drawScanlines() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let y = this.scanlineOffset % 4; y < this.canvas.height; y += 4) {
            this.ctx.fillRect(0, y, this.canvas.width, 1);
        }
    }
    
    /**
     * Draw subtle retro grid
     */
    drawRetroGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let col = 0; col <= this.cols; col += 5) {
            const x = col * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let row = 0; row <= this.rows; row += 5) {
            const y = row * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw CRT screen curvature overlay
     */
    drawCRTOverlay() {
        // Vignette effect
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.max(this.canvas.width, this.canvas.height) / 2;
        
        const vignette = this.ctx.createRadialGradient(
            centerX, centerY, maxRadius * 0.5,
            centerX, centerY, maxRadius
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        
        this.ctx.fillStyle = vignette;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Cleanup when window is closed
     */
    destroy() {
        this.stopGame();
        this.isInitialized = false;
        
        // Clean up resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        } else {
            // Clean up fallback resize listener
            window.removeEventListener('resize', this.handleWindowResize);
        }
        
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mouseup', this.handleMouseUp);
            this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
            this.canvas.removeEventListener('click', this.handleClick);
            this.canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
        }
        
        console.log('🎮 Conway\'s Battle Edition destroyed');
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