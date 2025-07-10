/**
 * @file Manages search functionality for text-based content.
 * @author Jared U.
 */


import { CONFIG } from '../config.js';

/**
 * Manages indexing and searching of content within the application.
 * @class SearchManager
 */
export class SearchManager {
    /**
     * Creates an instance of SearchManager.
     * @memberof SearchManager
     */
    constructor() {
        /** @private */
        this.searchIndex = new Map();
        /** @private */
        this.searchResults = [];
        /** @private */
        this.currentQuery = '';
        /** @private */
        this.fullContent = '';
    }

    /**
     * Initializes the search functionality for a given window.
     * This should be called after the target window is created and in the DOM.
     * @memberof SearchManager
     */
    initializeSearch() {
        // Find the codex window content area
        const codexContent = document.querySelector('#codexWindow .window-content');
        if (!codexContent) return; // Defensive: only run if window exists
        
        // Add search input and content area - content visible by default
        codexContent.innerHTML = `
            <div class="codex-container" style="height: 100%; display: flex; flex-direction: column;">
                <div class="search-header" style="padding: 15px; border-bottom: 1px solid #26334d; flex-shrink: 0;">
                    <input type="text" id="codexSearch" placeholder="Search Codex..." class="search-input" 
                           style="width: 100%; padding: 10px; background: #1e2530; border: 1px solid #26334d; border-radius: 8px; color: #eaf1fb; font-size: 14px;">
                    <div id="searchResults" class="search-results" style="display: none; max-height: 200px; overflow-y: auto; margin-top: 10px; background: #1e2530; border-radius: 8px; border: 1px solid #26334d;"></div>
                </div>
                <div id="codexContent" class="codex-content" style="flex-grow: 1; overflow-y: auto; padding: 20px;">
                    <div class="loading" style="text-align: center; padding: 40px; color: #a0a0a0;">
                        📚 Loading Codex documentation...
                    </div>
                </div>
            </div>
        `;

        // Initialize search input
        const searchInput = document.getElementById('codexSearch');
        const searchResults = document.getElementById('searchResults');
        if (searchInput) searchInput.setAttribute('aria-label', 'Search Codex');
        if (searchResults) searchResults.setAttribute('aria-live', 'polite');

        // Add debounced search
        let debounceTimer;
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });

            // Show/hide search results on focus/blur
            searchInput.addEventListener('focus', () => {
                if (this.currentQuery && this.searchResults.length > 0) {
                    searchResults.style.display = 'block';
                }
            });

            // Clear search when input is cleared
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    searchResults.style.display = 'none';
                    this.currentQuery = '';
                }
            });
        }

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            const searchContainer = document.querySelector('#codexWindow .search-header');
            if (searchContainer && !searchContainer.contains(e.target)) {
                if (searchResults) searchResults.style.display = 'none';
            }
        });

        // Load and index initial content
        this.loadAndIndexContent();
    }

    /**
     * Loads content from the codex.txt file and indexes it for searching.
     * @private
     * @async
     * @memberof SearchManager
     */
    async loadAndIndexContent() {
        try {
            // Load raw content
            const response = await fetch(CONFIG.PATHS.CODEX);
            if (!response.ok) {
                throw new Error(`Failed to load codex: ${response.status}`);
            }

            const rawText = await response.text();
            const formattedContent = this.formatCodexContent(rawText);
            
            const codexContent = document.getElementById('codexContent');
            if (codexContent) {
                codexContent.innerHTML = formattedContent;
                this.fullContent = formattedContent;
                this.indexContent(formattedContent);
            }
        } catch (error) {
            console.error('Error loading Codex content:', error);
            const codexContent = document.getElementById('codexContent');
            if (codexContent) {
                codexContent.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #ff4d4d;">
                        ❌ Error loading Codex documentation<br>
                        <span style="font-size: 0.9em; color: #a0a0a0;">${error.message}</span>
                    </div>
                `;
            }
        }
    }

    /**
     * Formats the raw codex text into structured HTML.
     * @param {string} rawText - The raw text content from codex.txt
     * @returns {string} Formatted HTML content
     * @private
     * @memberof SearchManager
     */
    formatCodexContent(rawText) {
        const lines = rawText.split('\n');
        let html = '<div class="codex-document">';
        let currentLayer = null;
        let inList = false;
        let elementCounter = 0;

        // Add document header
        html += `
            <div class="codex-header" id="codex-element-${elementCounter++}" style="margin-bottom: 30px; padding: 20px; background: #1e2530; border-radius: 12px; border-left: 4px solid #4a90e2;">
                <h1 style="color: #4a90e2; margin: 0 0 10px 0; font-size: 1.8em;">📚 Financial Instruments Codex</h1>
                <p style="color: #a0a0a0; margin: 0; font-size: 0.95em;">Comprehensive documentation of financial instruments and control mechanisms</p>
            </div>
        `;

        lines.forEach((line, index) => {
            line = line.trim();
            if (!line) return;

            // Check for layer headers (e.g., "Layer 1: Basic Instruments")
            const layerMatch = line.match(/^Layer (\d+): (.+)$/);
            if (layerMatch) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                const [, number, title] = layerMatch;
                currentLayer = number;
                html += `
                    <div class="layer-section" id="codex-element-${elementCounter++}" style="margin: 25px 0;">
                        <h2 class="layer-header" id="layer-${number}" style="color: #00d084; margin: 0 0 15px 0; padding: 10px 0; border-bottom: 2px solid #00d084; font-size: 1.4em;">
                            Layer ${number}: ${this.escapeHtml(title)}
                        </h2>
                `;
                return;
            }

            // Check for main section headers (standalone lines that aren't indented)
            if (line.match(/^[A-Za-z][^:]*$/) && !line.includes('    ') && !currentLayer) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += `<h3 id="codex-element-${elementCounter++}" style="color: #4a90e2; margin: 20px 0 10px 0; font-size: 1.2em;">${this.escapeHtml(line)}</h3>`;
                return;
            }

            // Check for list items (indented with spaces)
            if (line.match(/^\s{4,}/)) {
                if (!inList) {
                    html += `<ul id="codex-element-${elementCounter++}" style="margin: 10px 0; padding-left: 20px;">`;
                    inList = true;
                }
                const cleanLine = line.replace(/^\s+/, '');
                
                // Handle sub-items with descriptions (containing colons)
                if (cleanLine.includes(':')) {
                    const [term, ...descParts] = cleanLine.split(':');
                    const description = descParts.join(':').trim();
                    html += `<li id="codex-element-${elementCounter++}" style="margin: 8px 0; line-height: 1.4;"><strong style="color: #4a90e2;">${this.escapeHtml(term.trim())}:</strong> <span style="color: #eaf1fb;">${this.escapeHtml(description)}</span></li>`;
                } else {
                    html += `<li id="codex-element-${elementCounter++}" style="margin: 8px 0; line-height: 1.4;">${this.escapeHtml(cleanLine)}</li>`;
                }
                return;
            }

            // Regular paragraphs
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += `<p id="codex-element-${elementCounter++}" style="margin: 12px 0; line-height: 1.5; color: #eaf1fb;">${this.escapeHtml(line)}</p>`;
        });

        if (inList) {
            html += '</ul>';
        }

        if (currentLayer) {
            html += '</div>'; // Close last layer section
        }

        html += '</div>'; // Close codex-document

        return html;
    }

    /**
     * Escapes HTML characters to prevent XSS.
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     * @private
     * @memberof SearchManager
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Creates a searchable index from a string of HTML content.
     * @param {string} content - The HTML content to index.
     * @private
     * @memberof SearchManager
     */
    indexContent(content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        // Clear existing index
        this.searchIndex.clear();

        // Index headings and their content with better weighting
        doc.querySelectorAll('h1, h2, h3, h4, p, li').forEach(element => {
            const text = element.textContent.toLowerCase();
            const words = text.split(/[^\w]+/).filter(word => word.length > 2);
            
            // Weight different elements differently
            let weight = 1;
            if (element.tagName.toLowerCase().startsWith('h')) {
                weight = parseInt(element.tagName.charAt(1)) <= 2 ? 3 : 2; // h1, h2 get higher weight
            }
            
            // Get element ID for reliable targeting
            const elementId = element.id || this.generateElementId(element);
            
            words.forEach(word => {
                if (!this.searchIndex.has(word)) {
                    this.searchIndex.set(word, []);
                }
                this.searchIndex.get(word).push({
                    element: element.tagName.toLowerCase(),
                    text: element.textContent,
                    weight: weight,
                    parent: element.parentElement?.tagName.toLowerCase() || '',
                    elementId: elementId,
                    path: this.getElementPath(element)
                });
            });
        });
    }

    /**
     * Generates a unique ID for an element based on its content
     * @param {HTMLElement} element - The element to generate an ID for
     * @returns {string} A unique element ID
     * @private
     * @memberof SearchManager
     */
    generateElementId(element) {
        const text = element.textContent.trim();
        const tagName = element.tagName.toLowerCase();
        
        // Create a simple hash from the text content
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return `${tagName}-${Math.abs(hash)}`;
    }

    /**
     * Generates a CSS selector path to a given HTML element.
     * @param {HTMLElement} element - The element to get the path for.
     * @returns {string} The CSS selector path.
     * @private
     * @memberof SearchManager
     */
    getElementPath(element) {
        const path = [];
        let current = element;
        
        while (current && current.tagName !== 'BODY') {
            let selector = current.tagName.toLowerCase();
            if (current.id) {
                selector += `#${current.id}`;
            } else if (current.className) {
                selector += `.${current.className.split(' ').join('.')}`;
            }
            path.unshift(selector);
            current = current.parentElement;
        }
        
        return path.join(' > ');
    }

    /**
     * Performs a search against the indexed content.
     * @param {string} query - The search query.
     * @memberof SearchManager
     */
    performSearch(query) {
        this.currentQuery = query.toLowerCase().trim();
        const searchResults = document.getElementById('searchResults');
        
        if (!this.currentQuery) {
            searchResults.style.display = 'none';
            return;
        }

        // Find matches with fuzzy search support
        const matches = new Map();
        const queryWords = this.currentQuery.split(/\s+/);
        
        queryWords.forEach(queryWord => {
            // Direct matches
            if (this.searchIndex.has(queryWord)) {
                this.searchIndex.get(queryWord).forEach(match => {
                    const key = `${match.path}-${match.text}`;
                    if (!matches.has(key)) {
                        matches.set(key, { ...match, score: match.weight * 2 });
                    } else {
                        matches.get(key).score += match.weight * 2;
                    }
                });
            }
            
            // Partial matches
            for (const [word, entries] of this.searchIndex) {
                if (word.includes(queryWord) && word !== queryWord) {
                    entries.forEach(match => {
                        const key = `${match.path}-${match.text}`;
                        if (!matches.has(key)) {
                            matches.set(key, { ...match, score: match.weight });
                        } else {
                            matches.get(key).score += match.weight;
                        }
                    });
                }
            }
        });

        // Convert to array and sort by score
        this.searchResults = Array.from(matches.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Limit to top 10 results

        this.displayResults();
    }

    /**
     * Displays the search results in the UI.
     * @private
     * @memberof SearchManager
     */
    displayResults() {
        const searchResults = document.getElementById('searchResults');
        
        if (this.searchResults.length === 0) {
            searchResults.innerHTML = '<div style="padding: 15px; color: #a0a0a0; text-align: center;">No results found</div>';
            searchResults.style.display = 'block';
            return;
        }

        let html = '';
        this.searchResults.forEach((result, index) => {
            const context = this.getResultContext(result);
            const elementType = result.element.startsWith('h') ? '📄' : '📝';
            html += `
                <div class="search-result" data-element-id="${result.elementId}" data-path="${result.path}"
                     style="padding: 10px 15px; border-bottom: 1px solid #26334d; cursor: pointer; transition: background-color 0.2s;"
                     onmouseover="this.style.backgroundColor='#26334d'" 
                     onmouseout="this.style.backgroundColor='transparent'">
                    <div style="color: #4a90e2; font-weight: bold; margin-bottom: 5px;">
                        ${elementType} ${this.highlightMatch(result.text.substring(0, 80))}${result.text.length > 80 ? '...' : ''}
                    </div>
                    <div style="color: #a0a0a0; font-size: 0.85em;">${context}</div>
                </div>
            `;
        });

        searchResults.innerHTML = html;
        searchResults.style.display = 'block';

        // Add click handlers
        searchResults.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', () => {
                const elementId = result.dataset.elementId;
                const path = result.dataset.path;
                console.log('Search result clicked:', { elementId, path });
                this.scrollToResult(elementId, path);
                searchResults.style.display = 'none';
            });
        });
    }

    /**
     * Gets a snippet of context for a search result.
     * @param {object} result - The search result object.
     * @returns {string} The formatted context with highlighted matches.
     * @private
     * @memberof SearchManager
     */
    getResultContext(result) {
        const maxLength = 120;
        let text = result.text;
        
        // Find the query position for better context
        const queryPos = text.toLowerCase().indexOf(this.currentQuery.split(' ')[0]);
        if (queryPos > -1 && text.length > maxLength) {
            const start = Math.max(0, queryPos - 40);
            const end = Math.min(text.length, start + maxLength);
            text = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
        } else if (text.length > maxLength) {
            text = text.substring(0, maxLength) + '...';
        }
        
        return this.highlightMatch(text);
    }

    /**
     * Highlights the matching query text within a string.
     * @param {string} text - The text to highlight.
     * @returns {string} The text with `<mark>` tags around the matches.
     * @private
     * @memberof SearchManager
     */
    highlightMatch(text) {
        if (!this.currentQuery) return text;
        
        const words = this.currentQuery.split(/\s+/);
        let highlightedText = text;
        
        words.forEach(word => {
            const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark style="background-color: #4a90e2; color: #fff; padding: 2px 4px; border-radius: 3px;">$1</mark>');
        });
        
        return highlightedText;
    }

    /**
     * Scrolls the content view to the selected search result.
     * @param {string} elementId - The element ID to scroll to
     * @param {string} path - The CSS selector path as fallback
     * @private
     * @memberof SearchManager
     */
    scrollToResult(elementId, path) {
        const codexContent = document.getElementById('codexContent');
        let targetElement = null;
        
        // Try multiple approaches to find the element
        
        // 1. Try finding by element ID first (most reliable)
        if (elementId) {
            targetElement = document.getElementById(elementId);
            if (!targetElement) {
                // Try finding within the codex content specifically
                targetElement = codexContent.querySelector(`#${elementId}`);
            }
        }
        
        // 2. If ID search failed, try finding by path
        if (!targetElement && path) {
            try {
                targetElement = codexContent.querySelector(path.split(' > ').pop());
            } catch (e) {
                console.warn('Path selector failed:', path);
            }
        }
        
        // 3. If still not found, try a more flexible search
        if (!targetElement && elementId) {
            // Try finding by partial ID match
            targetElement = codexContent.querySelector(`[id*="${elementId.split('-')[0]}"]`);
        }
        
        // 4. Last resort: try finding by text content
        if (!targetElement) {
            const searchText = this.currentQuery;
            const allElements = codexContent.querySelectorAll('h1, h2, h3, h4, p, li');
            for (const el of allElements) {
                if (el.textContent.toLowerCase().includes(searchText)) {
                    targetElement = el;
                    break;
                }
            }
        }
        
        if (targetElement) {
            console.log('Scrolling to element:', targetElement);
            
            // Ensure the codex content container scrolls, not the window
            const codexContainer = targetElement.closest('#codexContent');
            
            // Calculate the position within the scrollable container
            const containerRect = codexContent.getBoundingClientRect();
            const elementRect = targetElement.getBoundingClientRect();
            const relativeTop = elementRect.top - containerRect.top + codexContent.scrollTop;
            
            // Scroll to the calculated position (center the element)
            const scrollToPosition = relativeTop - (codexContent.clientHeight / 2) + (targetElement.offsetHeight / 2);
            
            // Use scrollTo if available, otherwise use scrollTop for broader compatibility
            if (codexContent.scrollTo) {
                codexContent.scrollTo({
                    top: Math.max(0, scrollToPosition),
                    behavior: 'smooth'
                });
            } else {
                // Fallback for older browsers
                codexContent.scrollTop = Math.max(0, scrollToPosition);
            }
            
            // Add highlight effect with better visibility
            const originalStyle = {
                background: targetElement.style.background,
                borderRadius: targetElement.style.borderRadius,
                padding: targetElement.style.padding,
                transition: targetElement.style.transition,
                outline: targetElement.style.outline
            };
            
            targetElement.style.background = 'transparent';
            targetElement.style.borderRadius = '8px';
            targetElement.style.padding = '10px';
            targetElement.style.transition = 'all 0.3s ease';
            targetElement.style.outline = '2px solid #4a90e2';
            
            // Remove highlight after delay
            setTimeout(() => {
                targetElement.style.background = originalStyle.background;
                targetElement.style.borderRadius = originalStyle.borderRadius;
                targetElement.style.padding = originalStyle.padding;
                targetElement.style.transition = originalStyle.transition;
                targetElement.style.outline = originalStyle.outline;
            }, 3000);
        } else {
            console.warn('Could not find target element for scroll:', { elementId, path });
        }
    }
} 