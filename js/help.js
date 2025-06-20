/**
 * Help System Module
 * Manages the help window and documentation
 */

import { CONFIG } from './config.js';

export class HelpManager {
    constructor() {
        this.helpContent = new Map();
        this.initializeHelpContent();
    }

    /**
     * Initialize help content for different sections
     */
    initializeHelpContent() {
        // Terminal Commands
        this.helpContent.set('terminal', {
            title: 'Terminal Commands',
            sections: [
                {
                    title: 'Basic Commands',
                    commands: [
                        { name: 'help', description: 'Display this help message' },
                        { name: 'clear', description: 'Clear the terminal screen' },
                        { name: 'date', description: 'Show current date and time' },
                        { name: 'echo [text]', description: 'Echo the provided text' }
                    ]
                },
                {
                    title: 'Window Management',
                    commands: [
                        { name: 'window list', description: 'List all windows and their states' },
                        { name: 'window focus [id]', description: 'Focus a specific window' }
                    ]
                },
                {
                    title: 'Network Commands',
                    commands: [
                        { name: 'network status', description: 'Show current network status' },
                        { name: 'network zoom [in/out/reset]', description: 'Control network zoom level' }
                    ]
                }
            ]
        });

        // Keyboard Shortcuts
        this.helpContent.set('shortcuts', {
            title: 'Keyboard Shortcuts',
            sections: [
                {
                    title: 'Window Management',
                    shortcuts: [
                        { key: 'Alt+N', description: 'Open Network Window' },
                        { key: 'Alt+T', description: 'Open Terminal Window' },
                        { key: 'Alt+C', description: 'Open Codex Window' },
                        { key: 'Alt+W', description: 'Open Widgets Window' },
                        { key: 'Escape', description: 'Close Active Window' },
                        { key: 'Alt+F4', description: 'Close Active Window' }
                    ]
                },
                {
                    title: 'Terminal',
                    shortcuts: [
                        { key: 'Ctrl+L', description: 'Clear Terminal' },
                        { key: 'Ctrl+U', description: 'Clear Input' },
                        { key: 'Ctrl+R', description: 'Reload Terminal' }
                    ]
                },
                {
                    title: 'Network',
                    shortcuts: [
                        { key: 'Ctrl+F', description: 'Fit Network' },
                        { key: 'Ctrl++', description: 'Zoom In' },
                        { key: 'Ctrl+-', description: 'Zoom Out' },
                        { key: 'Ctrl+0', description: 'Reset Zoom' }
                    ]
                }
            ]
        });

        // Window Controls
        this.helpContent.set('windows', {
            title: 'Window Controls',
            sections: [
                {
                    title: 'Window Operations',
                    controls: [
                        { name: 'Minimize', description: 'Click the minimize button or press Alt+Down' },
                        { name: 'Maximize', description: 'Click the maximize button or press Alt+Up' },
                        { name: 'Close', description: 'Click the close button or press Escape' },
                        { name: 'Move', description: 'Drag the window header' },
                        { name: 'Resize', description: 'Drag window edges or corners' }
                    ]
                },
                {
                    title: 'Window Snapping',
                    controls: [
                        { name: 'Edge Snapping', description: 'Drag window near screen edges' },
                        { name: 'Center Snapping', description: 'Drag window to screen center' },
                        { name: 'Window Snapping', description: 'Drag window near other windows' }
                    ]
                }
            ]
        });
    }

    /**
     * Get help content for a specific section
     * @param {string} section - The help section to retrieve
     * @returns {Object} The help content for the section
     */
    getHelpContent(section) {
        return this.helpContent.get(section) || null;
    }

    /**
     * Generate HTML for help content
     * @param {string} section - The help section to generate HTML for
     * @returns {string} The generated HTML
     */
    generateHelpHTML(section) {
        const content = this.getHelpContent(section);
        if (!content) return '';

        let html = `<h2>${content.title}</h2>`;

        content.sections.forEach(section => {
            html += `<div class="help-section">
                <h3>${section.title}</h3>`;

            if (section.commands) {
                html += '<div class="help-commands">';
                section.commands.forEach(cmd => {
                    html += `<div class="help-command">
                        <span class="command-name">${cmd.name}</span>
                        <span class="command-desc">${cmd.description}</span>
                    </div>`;
                });
                html += '</div>';
            }

            if (section.shortcuts) {
                html += '<div class="help-shortcuts">';
                section.shortcuts.forEach(shortcut => {
                    html += `<div class="help-shortcut">
                        <span class="shortcut-key">${shortcut.key}</span>
                        <span class="shortcut-desc">${shortcut.description}</span>
                    </div>`;
                });
                html += '</div>';
            }

            if (section.controls) {
                html += '<div class="help-controls">';
                section.controls.forEach(control => {
                    html += `<div class="help-control">
                        <span class="control-name">${control.name}</span>
                        <span class="control-desc">${control.description}</span>
                    </div>`;
                });
                html += '</div>';
            }

            html += '</div>';
        });

        return html;
    }

    /**
     * Show help window with specific section
     * @param {string} section - The help section to display
     */
    showHelp(section = 'terminal') {
        const helpWindow = document.getElementById('helpWindow');
        const helpContent = document.getElementById('helpContent');
        if (helpWindow && helpContent) {
            helpContent.setAttribute('aria-live', 'polite');
            helpContent.setAttribute('tabindex', '0');
            helpContent.innerHTML = this.generateHelpHTML(section);
            helpWindow.style.display = 'block';
        }
    }
} 