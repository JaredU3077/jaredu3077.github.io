/**
 * Content Parser Module
 * Handles parsing and formatting of text content for both codex.txt and resume.txt
 */

export class ContentParser {
    /**
     * Parse and format text content into HTML
     * @param {string} text - The text content to parse
     * @returns {string} Formatted HTML content
     */
    static parseTextContent(text) {
        const lines = text.trim().split('\n');
        let htmlContent = '';
        let inSection = false;
        let inJobDetails = false;

        lines.forEach((line, index) => {
            if (!line.trim()) return;

            line = line.replace(/\r/g, '');

            // Check for main heading (e.g., "Jared - Senior Network Engineer Resume")
            if (line.match(/^[A-Za-z\s-]+Resume$/)) {
                htmlContent += `<div class="terminal-heading">${line}</div>`;
                inJobDetails = false;
                return;
            }

            // Check for section headings (e.g., "Professional Experience")
            if (line.match(/^[A-Za-z\s]+$/)) {
                if (inSection) {
                    htmlContent += '</div>';
                }
                htmlContent += `<div class="terminal-section"><div class="terminal-subheading">${line}</div>`;
                inSection = true;
                inJobDetails = false;
                return;
            }

            // Check for job titles (e.g., "Senior Network Engineer")
            if (line.match(/^\s{4}[A-Za-z\s]+$/)) {
                htmlContent += `<div class="terminal-subheading2">${line.trim()}</div>`;
                inJobDetails = false;
                return;
            }

            // Check for company and date lines
            if (line.match(/^\s{4}[A-Za-z\s,-]+, [A-Z]{2}$/) || line.match(/^\s{4}[A-Za-z]+ \d{4} - (?:[A-Za-z]+ \d{4}|Present)$/)) {
                htmlContent += `<div class="terminal-subheading2">${line.trim()}</div>`;
                inJobDetails = true;
                return;
            }

            // Check for skill categories
            if (line.match(/^\s{4}- [A-Za-z\s&]+:/)) {
                const [category, details] = line.split(':', 2);
                htmlContent += `<div><span class="terminal-subheading2">${category.trim()}:</span> <span class="terminal-detail">${details.trim()}</span></div>`;
                inJobDetails = false;
                return;
            }

            // Treat as job details or other lines
            if (inJobDetails) {
                htmlContent += `<div class="terminal-detail">${line.trim()}</div>`;
            } else {
                htmlContent += `<div>${line.trim()}</div>`;
            }
        });

        if (inSection) {
            htmlContent += '</div>';
        }

        return htmlContent;
    }

    /**
     * Load and parse content from a file
     * @param {string} filePath - Path to the file to load
     * @returns {Promise<string>} Promise resolving to formatted HTML content
     */
    static async loadAndParseContent(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Failed to load ${filePath}`);
            const text = await response.text();
            return this.parseTextContent(text);
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            throw error;
        }
    }
}
