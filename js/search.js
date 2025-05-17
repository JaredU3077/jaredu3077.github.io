/**
 * @module Search
 * @description Handles search functionality for the Codex content
 */

/**
 * @class SearchManager
 * @classdesc Manages the search functionality for the Codex window
 * @property {Map} searchIndex - Index of searchable content
 * @property {Array} searchResults - Current search results
 * @property {string} currentQuery - Current search query
 */
export class SearchManager {
    /**
     * Creates a new SearchManager instance
     * @constructor
     */
    constructor() {
        /** @private */
        this.searchIndex = new Map();
        /** @private */
        this.searchResults = [];
        /** @private */
        this.currentQuery = '';
        this.initializeSearch();
    }

    /**
     * Initializes the search functionality
     * @private
     * @description Sets up the search input, results container, and event listeners
     */
    initializeSearch() {
        // Add search input to Codex window
        const codexHeader = document.querySelector('#codexWindow .window-header');
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" id="codexSearch" placeholder="Search Codex..." class="search-input">
            <div id="searchResults" class="search-results"></div>
        `;
        codexHeader.appendChild(searchContainer);

        // Initialize search input
        const searchInput = document.getElementById('codexSearch');
        const searchResults = document.getElementById('searchResults');

        // Add debounced search
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }

    /**
     * Indexes content for searching
     * @param {string} content - The HTML content to index
     * @description Parses the content and creates a searchable index of words
     */
    indexContent(content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        // Clear existing index
        this.searchIndex.clear();

        // Index headings and their content
        doc.querySelectorAll('h2, h3, h4, p, li').forEach(element => {
            const text = element.textContent.toLowerCase();
            const words = text.split(/\s+/);
            
            words.forEach(word => {
                if (word.length > 2) { // Ignore very short words
                    if (!this.searchIndex.has(word)) {
                        this.searchIndex.set(word, []);
                    }
                    this.searchIndex.get(word).push({
                        element: element.tagName.toLowerCase(),
                        text: element.textContent,
                        parent: element.parentElement?.tagName.toLowerCase() || '',
                        path: this.getElementPath(element)
                    });
                }
            });
        });
    }

    /**
     * Gets the DOM path for an element
     * @private
     * @param {HTMLElement} element - The element to get the path for
     * @returns {string} The CSS selector path to the element
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
     * Performs the search operation
     * @param {string} query - The search query
     * @description Searches the indexed content and displays results
     */
    performSearch(query) {
        this.currentQuery = query.toLowerCase();
        const searchResults = document.getElementById('searchResults');
        
        if (!this.currentQuery) {
            searchResults.style.display = 'none';
            return;
        }

        // Find matches
        const matches = new Set();
        const words = this.currentQuery.split(/\s+/);
        
        words.forEach(word => {
            if (this.searchIndex.has(word)) {
                this.searchIndex.get(word).forEach(match => {
                    matches.add(JSON.stringify(match));
                });
            }
        });

        // Convert matches to array and sort by relevance
        this.searchResults = Array.from(matches)
            .map(match => JSON.parse(match))
            .sort((a, b) => {
                // Prioritize matches in headings
                if (a.element.startsWith('h') && !b.element.startsWith('h')) return -1;
                if (!a.element.startsWith('h') && b.element.startsWith('h')) return 1;
                return 0;
            });

        // Display results
        this.displayResults();
    }

    /**
     * Displays the search results
     * @private
     * @description Renders the search results in the UI
     */
    displayResults() {
        const searchResults = document.getElementById('searchResults');
        
        if (this.searchResults.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No results found</div>';
            searchResults.style.display = 'block';
            return;
        }

        let html = '';
        this.searchResults.forEach(result => {
            const context = this.getResultContext(result);
            html += `
                <div class="search-result" data-path="${result.path}">
                    <div class="result-title">${this.highlightMatch(result.text)}</div>
                    <div class="result-context">${context}</div>
                </div>
            `;
        });

        searchResults.innerHTML = html;
        searchResults.style.display = 'block';

        // Add click handlers
        searchResults.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', () => {
                this.scrollToResult(result.dataset.path);
            });
        });
    }

    /**
     * Gets the context for a search result
     * @private
     * @param {Object} result - The search result object
     * @returns {string} The formatted context with highlighted matches
     */
    getResultContext(result) {
        const maxLength = 100;
        let text = result.text;
        
        if (text.length > maxLength) {
            const start = Math.max(0, text.indexOf(this.currentQuery) - 20);
            text = '...' + text.substr(start, maxLength) + '...';
        }
        
        return this.highlightMatch(text);
    }

    /**
     * Highlights matching text in the results
     * @private
     * @param {string} text - The text to highlight matches in
     * @returns {string} The text with highlighted matches
     */
    highlightMatch(text) {
        const regex = new RegExp(`(${this.currentQuery})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Scrolls to a search result
     * @private
     * @param {string} path - The CSS selector path to the result
     * @description Smoothly scrolls to the result and highlights it
     */
    scrollToResult(path) {
        const element = document.querySelector(path);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight');
            setTimeout(() => element.classList.remove('highlight'), 2000);
        }
    }
} 