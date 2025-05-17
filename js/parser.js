/**
 * Content Parser Module
 * Handles parsing and formatting of text content for both codex.txt and resume.txt
 */

import { AppError, ErrorTypes, sanitizeHTML, showLoading, hideLoading } from './utils.js';

export class ContentParser {
    /**
     * Parse and format text content into HTML
     * @param {string} text - The text content to parse
     * @returns {string} Formatted HTML content
     * @throws {AppError} If text is invalid or parsing fails
     */
    static parseTextContent(text) {
        if (!text || typeof text !== 'string') {
            throw new AppError('Invalid text content', ErrorTypes.VALIDATION, { text });
        }

        const lines = text.trim().split('\n');
        let htmlContent = '';
        let inSection = false;
        let inJobDetails = false;

        try {
            lines.forEach((line, index) => {
                if (!line.trim()) return;

                line = line.replace(/\r/g, '');

                // Check for main heading (e.g., "Jared - Senior Network Engineer Resume")
                if (line.match(/^[A-Za-z\s-]+Resume$/)) {
                    htmlContent += `<div class="terminal-heading">${sanitizeHTML(line)}</div>`;
                    inJobDetails = false;
                    return;
                }

                // Check for section headings (e.g., "Professional Experience")
                if (line.match(/^[A-Za-z\s]+$/)) {
                    if (inSection) {
                        htmlContent += '</div>';
                    }
                    htmlContent += `<div class="terminal-section"><div class="terminal-subheading">${sanitizeHTML(line)}</div>`;
                    inSection = true;
                    inJobDetails = false;
                    return;
                }

                // Check for job titles (e.g., "Senior Network Engineer")
                if (line.match(/^\s{4}[A-Za-z\s]+$/)) {
                    htmlContent += `<div class="terminal-subheading2">${sanitizeHTML(line.trim())}</div>`;
                    inJobDetails = false;
                    return;
                }

                // Check for company and date lines
                if (line.match(/^\s{4}[A-Za-z\s,-]+, [A-Z]{2}$/) || line.match(/^\s{4}[A-Za-z]+ \d{4} - (?:[A-Za-z]+ \d{4}|Present)$/)) {
                    htmlContent += `<div class="terminal-subheading2">${sanitizeHTML(line.trim())}</div>`;
                    inJobDetails = true;
                    return;
                }

                // Check for skill categories
                if (line.match(/^\s{4}- [A-Za-z\s&]+:/)) {
                    const [category, details] = line.split(':', 2);
                    htmlContent += `<div><span class="terminal-subheading2">${sanitizeHTML(category.trim())}:</span> <span class="terminal-detail">${sanitizeHTML(details.trim())}</span></div>`;
                    inJobDetails = false;
                    return;
                }

                // Treat as job details or other lines
                if (inJobDetails) {
                    htmlContent += `<div class="terminal-detail">${sanitizeHTML(line.trim())}</div>`;
                } else {
                    htmlContent += `<div>${sanitizeHTML(line.trim())}</div>`;
                }
            });

            if (inSection) {
                htmlContent += '</div>';
            }

            return htmlContent;
        } catch (error) {
            throw new AppError('Failed to parse content', ErrorTypes.VALIDATION, { error });
        }
    }

    /**
     * Load and parse content from a file
     * @param {string} filePath - Path to the file to load
     * @param {HTMLElement} container - Container to show loading indicator in
     * @returns {Promise<string>} Promise resolving to formatted HTML content
     * @throws {AppError} If file loading or parsing fails
     */
    static async loadAndParseContent(filePath, container) {
        let loadingIndicator = null;
        try {
            if (container) {
                loadingIndicator = showLoading(container, 'Loading content...');
            }

            const response = await fetch(filePath);
            if (!response.ok) {
                throw new AppError(`Failed to load ${filePath}`, ErrorTypes.FILE_LOAD, {
                    status: response.status,
                    statusText: response.statusText
                });
            }

            const text = await response.text();
            const content = this.parseTextContent(text);

            return content;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error loading ${filePath}`, ErrorTypes.FILE_LOAD, { error });
        } finally {
            if (loadingIndicator) {
                hideLoading(loadingIndicator);
            }
        }
    }
}
