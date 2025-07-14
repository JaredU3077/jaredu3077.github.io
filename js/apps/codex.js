

class CodexApp {
    constructor() {
        this.name = 'Codex';
        this.icon = '📚';
        this.category = 'knowledge';
        this.description = '200 Layers of Financial Control';
        this.window = null;
        this.content = null; // Will store the HTML string for the app content
        this.searchInput = null;
        this.searchBtn = null;
        this.layersContainer = null;
        this.loadingIndicator = null;
        this.searchResultsContainer = null;
        this.isInitialized = false;
        this.parsedData = null;
        this.totalLayers = 0;
        this.windowManager = null;
    }

    async init() {
        if (this.isInitialized) return;
        
        this.createContentTemplate();
        this.isInitialized = true;
    }

    createContentTemplate() {
        // Create a temporary div to build the HTML structure
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
            <div class="codex-header">
                <div class="search-container">
                    <input type="text" class="search-input" placeholder="Search layers, instruments, concepts..." aria-label="Search codex content">
                    <button class="search-btn" aria-label="Search">🔍</button>
                </div>
            </div>
            <div class="codex-content">
                <div class="search-results-container" style="display: none; position: absolute; top: 0; left: 0; width: 100%; max-height: 300px; overflow-y: auto; z-index: 10;"></div>
                <div class="layers-container" style="position: relative; z-index: 1;"></div>
                <div class="loading-indicator" role="status" aria-live="polite">Loading knowledge base...</div>
            </div>
        `;
        
        // Store the full content HTML (header + content)
        this.content = tempDiv.innerHTML;
    }

    attachToWindow(windowEl) {
        if (!windowEl) return;
        
        this.window = windowEl;
        
        // Find the window-content div and inject our content there
        const windowContent = this.window.querySelector('.window-content');
        if (windowContent) {
            windowContent.innerHTML = this.content;
        } else {
            console.error('Window content div not found');
            return;
        }
        
        // Now that elements are in the DOM, get references
        this.searchInput = this.window.querySelector('.search-input');
        this.searchBtn = this.window.querySelector('.search-btn');
        this.layersContainer = this.window.querySelector('.layers-container');
        this.loadingIndicator = this.window.querySelector('.loading-indicator');
        this.searchResultsContainer = this.window.querySelector('.search-results-container');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load content if not already loaded
        if (!this.parsedData) {
            this.loadContent();
        } else {
            this.renderAllLayers();
        }
    }

    setupEventListeners() {
        // Search functionality (live search on input)
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }

        // Search button click
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                this.performSearch(this.searchInput.value);
            });
        }

        // Event delegation for search results clicks and keyboard navigation
        if (this.window) {
            this.window.addEventListener('click', (e) => {
                if (e.target.closest('.search-result-item')) {
                    const item = e.target.closest('.search-result-item');
                    this.handleSearchResultClick(item);
                }
            });
            
            // Add keyboard navigation for search results
            this.window.addEventListener('keydown', (e) => {
                if (e.target.closest('.search-result-item') && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    const item = e.target.closest('.search-result-item');
                    this.handleSearchResultClick(item);
                }
            });
        }

        // Hide search results when clicking outside
        if (this.window) {
            this.window.addEventListener('click', (e) => {
                if (!e.target.closest('.search-results-container') && 
                    !e.target.closest('.search-container')) {
                    if (this.searchResultsContainer) {
                        this.searchResultsContainer.style.display = 'none';
                    }
                }
            });
        }
    }

    async loadContent() {
        try {
            console.log('Loading codex.txt file...');
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
            
            console.log('Total layers loaded:', this.totalLayers);
            
            if (this.loadingIndicator) {
                this.loadingIndicator.style.display = 'none';
            }
            
            this.renderAllLayers();
            
        } catch (error) {
            console.error('Error loading Codex content:', error);
            if (this.loadingIndicator) {
                this.loadingIndicator.innerHTML = `
                    <div style="text-align: center; color: #ff6b6b; padding: 20px;">
                        ❌ Error loading Codex documentation<br>
                        <small>${error.message}</small>
                    </div>
                `;
                this.loadingIndicator.style.display = 'block';
            }
        }
    }

    parseCodexContent(rawText) {
        const lines = rawText.split('\n');
        const parsedData = {
            layers: {},
            searchIndex: {}, // Placeholder for potential future use
            introduction: [] // Store introductory content
        };
        
        let currentLayer = null;
        let currentLayerData = null;
        let inLayer = false;
        let foundFirstLayer = false;
        
        console.log('Parsing codex content...');
        console.log('Total lines:', lines.length);
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            const indentLevel = line.length - trimmed.length; // Count leading spaces
            
            // Check for layer headers
            if (indentLevel === 0 && trimmed.startsWith('Layer ')) {
                foundFirstLayer = true;
                const layerMatch = trimmed.match(/^Layer (\d+):\s*(.+)$/);
                if (layerMatch) {
                    // Save previous layer
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
            }
            
            // If we haven't found the first layer yet, collect introductory content
            if (!foundFirstLayer) {
                parsedData.introduction.push(trimmed);
                continue;
            }
            
            // Check for layer headers
            if (indentLevel === 0 && trimmed.startsWith('Layer ')) {
                const layerMatch = trimmed.match(/^Layer (\d+):\s*(.+)$/);
                if (layerMatch) {
                    // Save previous layer
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
            }
            
            // If in a layer, parse indented content
            if (inLayer && currentLayerData && indentLevel >= 4) {
                const cleanLine = line.substring(4).trim();
                
                if (indentLevel >= 8) {
                    // Sub-item
                    const subItem = line.substring(8).trim();
                    if (currentLayerData.instruments.length > 0) {
                        const lastInstrument = currentLayerData.instruments[currentLayerData.instruments.length - 1];
                        if (!lastInstrument.subItems) {
                            lastInstrument.subItems = [];
                        }
                        lastInstrument.subItems.push(subItem);
                    }
                } else {
                    // Indent level 4: either description or instrument
                    if (cleanLine.includes(':')) {
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
                        // Add to description
                        if (currentLayerData.description) {
                            currentLayerData.description += ' ' + cleanLine;
                        } else {
                            currentLayerData.description = cleanLine;
                        }
                    }
                }
            }
        }
        
        // Add the last layer
        if (currentLayer && currentLayerData) {
            parsedData.layers[currentLayer] = currentLayerData;
            console.log(`Saved final layer ${currentLayer}:`, currentLayerData.title);
        }
        
        console.log('Parsing complete. Total layers found:', Object.keys(parsedData.layers).length);
        console.log('Layer numbers:', Object.keys(parsedData.layers));
        
        return parsedData;
    }

    renderAllLayers() {
        if (!this.layersContainer || !this.parsedData) {
            console.warn('Cannot render layers: missing container or data');
            return;
        }
        
        this.layersContainer.innerHTML = '';
        
        // Render introduction content first
        if (this.parsedData.introduction && this.parsedData.introduction.length > 0) {
            this.layersContainer.innerHTML += `
                <section id="introduction" class="introduction-section">
                    <h2>Introduction</h2>
                    <div class="introduction-content">
                        ${this.parsedData.introduction.map(paragraph => `
                            <p>${paragraph}</p>
                        `).join('')}
                    </div>
                </section>
            `;
        }
        
        // Render all layers
        for (let layer = 1; layer <= this.totalLayers; layer++) {
            const layerContent = this.parsedData.layers[layer];
            if (!layerContent) continue;
            
            this.layersContainer.innerHTML += `
                <section id="layer-${layer}" class="layer-section">
                    <h2>Layer ${layer}: ${layerContent.title}</h2>
                    <div class="layer-description">${layerContent.description}</div>
                    <div class="layer-instruments">
                        ${layerContent.instruments.map(instrument => `
                            <article class="instrument-item">
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
                            </article>
                        `).join('')}
                    </div>
                </section>
            `;
        }
    }

    performSearch(query) {
        if (!query.trim() || !this.parsedData) {
            if (this.searchResultsContainer) this.searchResultsContainer.style.display = 'none';
            return;
        }

        const results = this.searchInParsedData(query);
        this.displaySearchResults(results, query);
    }

    searchInParsedData(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        for (const [layerNum, layerData] of Object.entries(this.parsedData.layers)) {
            let matchingInstruments = layerData.instruments.filter(instrument => 
                instrument.name.toLowerCase().includes(searchTerm) ||
                instrument.description.toLowerCase().includes(searchTerm) ||
                (instrument.subItems && instrument.subItems.some(sub => sub.toLowerCase().includes(searchTerm)))
            );
            
            if (layerData.title.toLowerCase().includes(searchTerm) ||
                layerData.description.toLowerCase().includes(searchTerm) ||
                matchingInstruments.length > 0) {
                results.push({
                    layer: parseInt(layerNum),
                    title: layerData.title,
                    description: layerData.description,
                    instruments: (layerData.title.toLowerCase().includes(searchTerm) || 
                                  layerData.description.toLowerCase().includes(searchTerm)) 
                                 ? layerData.instruments 
                                 : matchingInstruments
                });
            }
        }
        
        return results;
    }

    displaySearchResults(results, query) {
        if (!this.searchResultsContainer) return;
        
        if (results.length === 0) {
            this.searchResultsContainer.innerHTML = `
                <div class="search-results">
                    <h3>No results found for "${query}"</h3>
                    <p>Try searching for different terms or browse through the layers manually.</p>
                </div>
            `;
            this.searchResultsContainer.style.display = 'block';
            return;
        }

        this.searchResultsContainer.innerHTML = `
            <div class="search-results">
                <h3>Search Results for "${query}" (${results.length} found)</h3>
                ${results.map(result => `
                    <article class="search-result-item" data-layer="${result.layer}" role="button" tabindex="0">
                        <h4>Layer ${result.layer}: ${result.title}</h4>
                        <p>${result.description.substring(0, 150)}...</p>
                    </article>
                `).join('')}
            </div>
        `;
        this.searchResultsContainer.style.display = 'block';
    }

    minimize() {
        console.log('Codex minimize called');
    }

    maximize() {
        console.log('Codex maximize called');
    }

    close() {
        console.log('Codex close called');
    }

    focus() {
        console.log('Codex focus called');
    }

    handleSearchResultClick(item) {
        const layer = parseInt(item.dataset.layer);
        if (!isNaN(layer)) {
            const layerEl = this.layersContainer.querySelector(`#layer-${layer}`);
            if (layerEl) {
                layerEl.scrollIntoView({ behavior: 'smooth' });
                // Add a brief highlight effect
                layerEl.style.background = 'rgba(99, 102, 241, 0.1)';
                setTimeout(() => {
                    layerEl.style.background = '';
                }, 2000);
            }
            // Hide results after click for better UX
            this.searchResultsContainer.style.display = 'none';
        }
    }

    blur() {
        console.log('Codex blur called');
    }
}

// Export for global access
window.CodexApp = CodexApp; 