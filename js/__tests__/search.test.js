import { SearchManager } from '../search';

describe('SearchManager', () => {
    let searchManager;
    let mockContent;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = `
            <div id="codexWindow">
                <div class="window-header"></div>
            </div>
        `;

        // Initialize SearchManager
        searchManager = new SearchManager();

        // Mock content for testing
        mockContent = `
            <h2>Test Heading</h2>
            <p>This is a test paragraph with some content.</p>
            <h3>Another Heading</h3>
            <p>More test content here.</p>
        `;
    });

    describe('initialization', () => {
        test('should create search input and results container', () => {
            const searchInput = document.getElementById('codexSearch');
            const searchResults = document.getElementById('searchResults');
            
            expect(searchInput).toBeTruthy();
            expect(searchResults).toBeTruthy();
            expect(searchInput.placeholder).toBe('Search Codex...');
        });
    });

    describe('indexContent', () => {
        test('should index content correctly', () => {
            searchManager.indexContent(mockContent);
            
            // Check if common words are indexed
            expect(searchManager.searchIndex.has('test')).toBeTruthy();
            expect(searchManager.searchIndex.has('content')).toBeTruthy();
            
            // Check if short words are ignored
            expect(searchManager.searchIndex.has('is')).toBeFalsy();
        });

        test('should clear existing index before indexing new content', () => {
            searchManager.indexContent(mockContent);
            const initialSize = searchManager.searchIndex.size;
            
            searchManager.indexContent('<p>New content</p>');
            expect(searchManager.searchIndex.size).toBeLessThan(initialSize);
        });
    });

    describe('performSearch', () => {
        beforeEach(() => {
            searchManager.indexContent(mockContent);
        });

        test('should hide results for empty query', () => {
            const searchResults = document.getElementById('searchResults');
            searchManager.performSearch('');
            expect(searchResults.style.display).toBe('none');
        });

        test('should find and display matching results', () => {
            searchManager.performSearch('test');
            expect(searchManager.searchResults.length).toBeGreaterThan(0);
        });

        test('should prioritize matches in headings', () => {
            searchManager.performSearch('heading');
            const results = searchManager.searchResults;
            expect(results[0].element).toMatch(/^h[2-6]$/);
        });
    });

    describe('highlightMatch', () => {
        test('should highlight matching text', () => {
            const text = 'This is a test';
            const highlighted = searchManager.highlightMatch(text);
            expect(highlighted).toContain('<mark>');
        });

        test('should handle case-insensitive matches', () => {
            searchManager.currentQuery = 'TEST';
            const text = 'This is a test';
            const highlighted = searchManager.highlightMatch(text);
            expect(highlighted).toContain('<mark>test</mark>');
        });
    });

    describe('getResultContext', () => {
        test('should truncate long text', () => {
            const longText = 'A'.repeat(200);
            const result = { text: longText };
            const context = searchManager.getResultContext(result);
            expect(context.length).toBeLessThan(longText.length);
        });

        test('should include ellipsis for truncated text', () => {
            const longText = 'A'.repeat(200);
            const result = { text: longText };
            const context = searchManager.getResultContext(result);
            expect(context).toContain('...');
        });
    });

    describe('scrollToResult', () => {
        test('should add highlight class to element', () => {
            document.body.innerHTML = '<div id="testElement">Test</div>';
            searchManager.scrollToResult('#testElement');
            const element = document.getElementById('testElement');
            expect(element.classList.contains('highlight')).toBeTruthy();
        });

        test('should remove highlight class after timeout', () => {
            jest.useFakeTimers();
            document.body.innerHTML = '<div id="testElement">Test</div>';
            searchManager.scrollToResult('#testElement');
            jest.advanceTimersByTime(2000);
            const element = document.getElementById('testElement');
            expect(element.classList.contains('highlight')).toBeFalsy();
            jest.useRealTimers();
        });
    });
}); 