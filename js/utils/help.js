/**
 * @file Manages the help system and displays documentation to the user.
 * @author Jared U.
 */

import { CONFIG } from '../config.js';

/**
 * Manages the display of help content in a dedicated window.
 * @class HelpManager
 */
export class HelpManager {
    /**
     * Creates an instance of HelpManager.
     * @memberof HelpManager
     */
    constructor() {
        /** @type {Map<string, object>} */
        this.helpContent = new Map();
        this.initializeHelpContent();
    }

    /**
     * Initializes the help content, defining topics and their details.
     * @private
     * @memberof HelpManager
     */
    initializeHelpContent() {
        // Terminal Commands
        this.helpContent.set('terminal', {
            title: 'Terminal Commands',
            sections: [{
                title: 'Available Commands',
                commands: [
                    { name: 'help', description: 'Displays this help message.' },
                    { name: 'clear', description: 'Clears the terminal screen.' },
                    { name: 'ping [host]', description: 'Pings a host (defaults to localhost).' },
                    { name: 'show resume', description: 'Displays the resume.txt file.' },
                    { name: 'show jared', description: 'Displays a short bio.' },
                ]
            }]
        });

        // Keyboard Shortcuts
        this.helpContent.set('shortcuts', {
            title: 'Keyboard Shortcuts',
            sections: [{
                title: 'General',
                shortcuts: [
                    { key: 'Click Icons', description: 'Open applications from the desktop or Start Menu.' },
                    { key: 'Drag Header', description: 'Move windows around the screen.' },
                    { key: 'Drag Edges', description: 'Resize windows.' },
                ]
            }, {
                title: 'Terminal',
                shortcuts: [
                    { key: 'Enter', description: 'Execute a command.' },
                    { key: 'Arrow Up / Down', description: 'Navigate through command history.' },
                    { key: 'Ctrl+L or clear', description: 'Clear the terminal screen.' },
                ]
            }]
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
     * Gets help content for a specific topic.
     * @param {string} topic - The help topic to retrieve.
     * @returns {?object} The help content for the topic, or null if not found.
     * @memberof HelpManager
     */
    getHelpContent(topic) {
        return this.helpContent.get(topic) || null;
    }

    /**
     * Generates HTML for the help content.
     * @param {string} topic - The help topic to generate HTML for.
     * @returns {string} The generated HTML.
     * @private
     * @memberof HelpManager
     */
    generateHelpHTML(topic) {
        const content = this.getHelpContent(topic);
        if (!content) return '<p>Help topic not found.</p>';

        let html = `<h2>${content.title}</h2>`;

        content.sections.forEach(section => {
            html += `<div class="help-section"><h3>${section.title}</h3>`;

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
     * Shows the help window with content for a specific topic.
     * This method relies on the main script to have created the help window.
     * @param {string} [topic='terminal'] - The help topic to display.
     * @memberof HelpManager
     */
    showHelp(topic = 'terminal') {
        // This is a simplified approach. A more robust solution would be to
        // have the HelpManager create the window itself via the WindowManager.
        const windowManager = window.windowManager; // Accessing global windowManager
        if (windowManager) {
            const helpContent = this.generateHelpHTML(topic);
            const helpWindow = windowManager.createWindow({
                id: 'helpWindow',
                title: 'Help',
                content: `<div id="helpContent" class="help-content-container">${helpContent}</div>`,
                width: 500,
                height: 400,
                icon: '❓'
            });
        } else {
            console.error('WindowManager not found. Cannot display help.');
        }
    }
} 