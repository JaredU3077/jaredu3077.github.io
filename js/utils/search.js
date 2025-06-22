/**
 * @file Manages search functionality for text-based content.
 * @author Jared U.
 */

import { ContentParser } from './parser.js';
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
    }

    /**
     * Initializes the search functionality for a given window.
     * This should be called after the target window is created and in the DOM.
     * @memberof SearchManager
     */
    initializeSearch() {
        // Add search input to Codex window
        const codexHeader = document.querySelector('#codexWindow .window-header');
        if (!codexHeader) return; // Defensive: only run if window exists
        // Prevent duplicate search bar
        if (codexHeader.querySelector('.search-container')) return;
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
        if (searchInput) searchInput.setAttribute('aria-label', 'Search Codex');
        if (searchResults) searchResults.setAttribute('aria-live', 'polite');

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
            const content = await ContentParser.loadAndParseContent(CONFIG.PATHS.CODEX);
            const codexContent = document.getElementById('codexContent');
            if (codexContent) {
                codexContent.innerHTML = content;
                this.indexContent(content);
            }
        } catch (error) {
            console.error('Error loading Codex content:', error);
        }
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
     * Displays the search results in the UI.
     * @private
     * @memberof SearchManager
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
     * Gets a snippet of context for a search result.
     * @param {object} result - The search result object.
     * @returns {string} The formatted context with highlighted matches.
     * @private
     * @memberof SearchManager
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
     * Highlights the matching query text within a string.
     * @param {string} text - The text to highlight.
     * @returns {string} The text with `<mark>` tags around the matches.
     * @private
     * @memberof SearchManager
     */
    highlightMatch(text) {
        const regex = new RegExp(`(${this.currentQuery})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Scrolls the content view to the selected search result.
     * @param {string} path - The CSS selector path to the result element.
     * @private
     * @memberof Search.
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