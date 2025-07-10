import { CODEX_DATA, searchCodex, getLayerContent } from '../data/codex-data.js';

class CodexApp {
    constructor() {
        this.name = 'Codex';
        this.icon = '📚';
        this.category = 'knowledge';
        this.description = 'Comprehensive Financial Knowledge Base';
        this.window = null;
        this.content = null;
        this.searchInput = null;
        this.layersContainer = null;
        this.currentLayer = 1;
        this.totalLayers = 0;
        this.isInitialized = false;
        this.parsedData = null;
        this.windowManager = null;
    }

    async init() {
        if (this.isInitialized) return;
        
        // Create a temporary window for content generation
        this.createTemporaryWindow();
        this.isInitialized = true;
    }

    createTemporaryWindow() {
        // Create a temporary div to hold the content structure
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
            <div class="codex-header">
                <div class="search-container">
                    <input type="text" class="search-input" placeholder="Search layers, instruments, concepts...">
                    <button class="search-btn">🔍</button>
                </div>
                <div class="layer-navigation">
                    <button class="nav-btn prev-btn">◀</button>
                    <span class="layer-info">Layer <span class="current-layer">1</span> of <span class="total-layers">-</span></span>
                    <button class="nav-btn next-btn">▶</button>
                </div>
            </div>
            <div class="codex-content">
                <div class="layers-container"></div>
                <div class="loading-indicator">Loading knowledge base...</div>
            </div>
        `;
        
        // Store the content for later use
        this.content = tempDiv.querySelector('.codex-content').innerHTML;
        
        // Get references to elements from the temporary div
        this.searchInput = tempDiv.querySelector('.search-input');
        this.layersContainer = tempDiv.querySelector('.layers-container');
        this.currentLayerSpan = tempDiv.querySelector('.current-layer');
        this.totalLayersSpan = tempDiv.querySelector('.total-layers');
        this.loadingIndicator = tempDiv.querySelector('.loading-indicator');
    }

    // Window controls are now handled by WindowManager
    // No need for custom setupWindowControls method

    setupEventListeners() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }

        // Navigation buttons - use event delegation to avoid null reference issues
        if (this.window) {
            this.window.addEventListener('click', (e) => {
                if (e.target.classList.contains('prev-btn')) {
                    if (this.currentLayer > 1) {
                        this.currentLayer--;
                        this.updateLayerDisplay();
                    }
                } else if (e.target.classList.contains('next-btn')) {
                    if (this.currentLayer < this.totalLayers) {
                        this.currentLayer++;
                        this.updateLayerDisplay();
                    }
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.window || !this.window.classList.contains('active')) return;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevBtn = this.window.querySelector('.prev-btn');
                if (prevBtn) prevBtn.click();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                const nextBtn = this.window.querySelector('.next-btn');
                if (nextBtn) nextBtn.click();
            }
        });
    }

    async loadContent() {
        try {
            console.log('Loading codex.txt file...');
            // Load the actual codex.txt file
            const response = await fetch('codex.txt');
            console.log('Fetch response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to load codex: ${response.status}`);
            }
            
            const rawText = await response.text();
            console.log('Raw text length:', rawText.length);
            console.log('First 200 characters:', rawText.substring(0, 200));
            
            this.parsedData = this.parseCodexContent(rawText);
            this.totalLayers = Object.keys(this.parsedData.layers).length;
            
            // Update DOM elements if they exist
            if (this.totalLayersSpan) {
                this.totalLayersSpan.textContent = this.totalLayers;
            }
            
            console.log('Total layers loaded:', this.totalLayers);
            
            // Hide loading indicator if it exists
            if (this.loadingIndicator) {
                this.loadingIndicator.style.display = 'none';
            }
            
            this.updateLayerDisplay();
            
        } catch (error) {
            console.error('Error loading Codex content:', error);
            if (this.loadingIndicator) {
                this.loadingIndicator.innerHTML = `
                    <div style="text-align: center; color: #ff6b6b; padding: 20px;">
                        ❌ Error loading Codex documentation<br>
                        <small>${error.message}</small>
                    </div>
                `;
            }
        }
    }

    parseCodexContent(rawText) {
        const lines = rawText.split('\n');
        const parsedData = {
            layers: {},
            searchIndex: {}
        };
        
        let currentLayer = null;
        let currentLayerData = null;
        let inLayer = false;
        let skipIntro = true; // Skip the introductory text
        
        console.log('Parsing codex content...');
        console.log('Total lines:', lines.length);
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // Skip introductory text until we hit the first layer
            if (skipIntro && !line.startsWith('Layer ')) {
                continue;
            }
            if (skipIntro && line.startsWith('Layer ')) {
                skipIntro = false;
            }
            
            // Check for layer headers (e.g., "Layer 1: Basic Instruments")
            const layerMatch = line.match(/^Layer (\d+):\s*(.+)$/);
            if (layerMatch) {
                // Save previous layer if exists
                if (currentLayer && currentLayerData) {
                    parsedData.layers[currentLayer] = currentLayerData;
                    console.log(`Saved layer ${currentLayer}:`, currentLayerData.title);
                }
                
                // Start new layer
                currentLayer = parseInt(layerMatch[1]);
                currentLayerData = {
                    title: layerMatch[2],
                    description: '',
                    instruments: []
                };
                inLayer = true;
                console.log(`Starting layer ${currentLayer}: ${layerMatch[2]}`);
                continue;
            }
            
            // If we're in a layer, parse the content
            if (inLayer && currentLayerData) {
                // Check if this line starts with 4 spaces (indented content)
                if (line.startsWith('    ')) {
                    const cleanLine = line.substring(4);
                    
                    // Check if this is a sub-item (starts with more spaces)
                    if (cleanLine.startsWith('    ')) {
                        // This is a sub-item, add it to the last instrument
                        const subItem = cleanLine.substring(4);
                        if (currentLayerData.instruments.length > 0) {
                            const lastInstrument = currentLayerData.instruments[currentLayerData.instruments.length - 1];
                            if (!lastInstrument.subItems) {
                                lastInstrument.subItems = [];
                            }
                            lastInstrument.subItems.push(subItem);
                        }
                    } else if (cleanLine.includes(':') && !cleanLine.startsWith('    ')) {
                        // This is an instrument
                        const colonIndex = cleanLine.indexOf(':');
                        const instrumentName = cleanLine.substring(0, colonIndex).trim();
                        const instrumentDesc = cleanLine.substring(colonIndex + 1).trim();
                        
                        currentLayerData.instruments.push({
                            name: instrumentName,
                            description: instrumentDesc,
                            subItems: []
                        });
                        console.log(`  Added instrument: ${instrumentName}`);
                    } else {
                        // This might be a description or additional content
                        if (!currentLayerData.description) {
                            currentLayerData.description = cleanLine;
                        } else {
                            // Add to existing description
                            currentLayerData.description += ' ' + cleanLine;
                        }
                    }
                } else if (line.startsWith('Layer ')) {
                    // We've hit the next layer, so we're done with current layer
                    inLayer = false;
                    i--; // Go back one line so we can process this layer header
                }
            }
        }
        
        // Don't forget to add the last layer
        if (currentLayer && currentLayerData) {
            parsedData.layers[currentLayer] = currentLayerData;
            console.log(`Saved final layer ${currentLayer}:`, currentLayerData.title);
        }
        
        console.log('Parsing complete. Total layers found:', Object.keys(parsedData.layers).length);
        console.log('Layer numbers:', Object.keys(parsedData.layers));
        
        return parsedData;
    }

    updateLayerDisplay() {
        if (!this.layersContainer) {
            console.warn('Layers container not available');
            return;
        }
        
        if (!this.parsedData || !this.parsedData.layers[this.currentLayer]) {
            this.layersContainer.innerHTML = `
                <div style="text-align: center; color: #ff6b6b; padding: 20px;">
                    ❌ Layer ${this.currentLayer} not found
                </div>
            `;
            return;
        }
        
        if (this.currentLayerSpan) {
            this.currentLayerSpan.textContent = this.currentLayer;
        }
        
        const layerContent = this.parsedData.layers[this.currentLayer];
        
        this.layersContainer.innerHTML = `
            <div class="layer-header">
                <h2>Layer ${this.currentLayer}: ${layerContent.title}</h2>
                <div class="layer-description">${layerContent.description}</div>
            </div>
            <div class="layer-instruments">
                ${layerContent.instruments.map(instrument => `
                    <div class="instrument-item">
                        <h3>${instrument.name}</h3>
                        <p>${instrument.description}</p>
                        ${instrument.subItems && instrument.subItems.length > 0 ? `
                            <div class="sub-items">
                                <ul>
                                    ${instrument.subItems.map(subItem => `
                                        <li>${subItem}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    performSearch(query) {
        if (!query.trim() || !this.parsedData) {
            this.updateLayerDisplay();
            return;
        }

        // Search through parsed data
        const searchResults = this.searchInParsedData(query);
        this.displaySearchResults(searchResults, query);
    }

    searchInParsedData(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        for (const [layerNum, layerData] of Object.entries(this.parsedData.layers)) {
            // Search in layer title
            if (layerData.title.toLowerCase().includes(searchTerm)) {
                results.push({
                    layer: parseInt(layerNum),
                    title: layerData.title,
                    description: layerData.description,
                    instruments: layerData.instruments
                });
                continue;
            }
            
            // Search in layer description
            if (layerData.description.toLowerCase().includes(searchTerm)) {
                results.push({
                    layer: parseInt(layerNum),
                    title: layerData.title,
                    description: layerData.description,
                    instruments: layerData.instruments
                });
                continue;
            }
            
            // Search in instruments
            const matchingInstruments = layerData.instruments.filter(instrument => 
                instrument.name.toLowerCase().includes(searchTerm) ||
                instrument.description.toLowerCase().includes(searchTerm)
            );
            
            if (matchingInstruments.length > 0) {
                results.push({
                    layer: parseInt(layerNum),
                    title: layerData.title,
                    description: layerData.description,
                    instruments: matchingInstruments
                });
            }
        }
        
        return results;
    }

    displaySearchResults(results, query) {
        if (results.length === 0) {
            this.layersContainer.innerHTML = `
                <div class="search-results">
                    <h3>No results found for "${query}"</h3>
                    <p>Try searching for different terms or browse through the layers manually.</p>
                </div>
            `;
            return;
        }

        this.layersContainer.innerHTML = `
            <div class="search-results">
                <h3>Search Results for "${query}" (${results.length} found)</h3>
                ${results.map(result => `
                    <div class="search-result-item" data-layer="${result.layer}">
                        <h4>Layer ${result.layer}: ${result.title}</h4>
                        <p>${result.description}</p>
                        ${result.instruments ? `
                            <div class="search-instruments">
                                <h5>Instruments:</h5>
                                <ul>
                                    ${result.instruments.map(instrument => `
                                        <li><strong>${instrument.name}</strong>: ${instrument.description}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    minimize() {
        // Window controls are handled by WindowManager
        console.log('Codex minimize called');
    }

    maximize() {
        // Window controls are handled by WindowManager
        console.log('Codex maximize called');
    }

    close() {
        // Window controls are handled by WindowManager
        console.log('Codex close called');
    }

    focus() {
        // Window controls are handled by WindowManager
        console.log('Codex focus called');
    }

    blur() {
        // Window controls are handled by WindowManager
        console.log('Codex blur called');
    }
}

// Export for global access
window.CodexApp = CodexApp; 