/**
 * @file Help System Module - Provides contextual help and documentation
 * @author Jared U.
 */

export class HelpManager {
    constructor() {
        this.helpContent = {
            general: {
                title: 'Neu-OS Help System',
                sections: [
                    {
                        title: 'Navigation',
                        content: [
                            'Click the Start button to access applications',
                            'Double-click desktop icons to launch apps',
                            'Use Alt+Tab to switch between windows',
                            'Right-click windows for context menu'
                        ]
                    },
                    {
                        title: 'Applications',
                        content: [
                            'Terminal: Run network commands and view resume',
                            'Network Monitor: View interactive network topology',
                            'Skills: Explore technical capabilities',
                            'Projects: View portfolio and case studies',
                            'Device Manager: Browse network infrastructure'
                        ]
                    },
                    {
                        title: 'Keyboard Shortcuts',
                        content: [
                            'Ctrl+L: Clear terminal screen',
                            'Escape: Close start menu or dialogs',
                            'Tab: Auto-complete terminal commands',
                            'Arrow keys: Navigate command history'
                        ]
                    }
                ]
            },
            terminal: {
                title: 'Terminal Commands',
                sections: [
                    {
                        title: 'Network Commands',
                        content: [
                            'ping [host] - Test network connectivity',
                            'ifconfig - Show network interface configuration',
                            'netstat - Display network connections',
                            'tracert [host] - Trace route to destination',
                            'nslookup [domain] - DNS lookup'
                        ]
                    },
                    {
                        title: 'Information Commands',
                        content: [
                            'show resume - Display professional resume',
                            'show experience - Show detailed work history',
                            'show skills - List technical skills',
                            'show certifications - Display certifications'
                        ]
                    },
                    {
                        title: 'System Commands',
                        content: [
                            'help - Show available commands',
                            'clear - Clear terminal screen',
                            'exit - Close terminal window'
                        ]
                    }
                ]
            }
        };
    }

    /**
     * Shows the help window with general or contextual help
     * @param {string} [context='general'] - The help context to show
     */
    show(context = 'general') {
        // Get the window manager from global scope
        const windowManager = window.windowManager;
        if (!windowManager) {
            console.error('Window manager not available');
            return;
        }

        // Check if help window is already open
        const existingWindow = document.getElementById('helpWindow');
        if (existingWindow) {
            const windowObj = windowManager.windows.get('helpWindow');
            if (windowObj) {
                windowManager.focusWindow(windowObj);
                return;
            }
        }

        const helpData = this.helpContent[context] || this.helpContent.general;
        const helpContent = this.generateHelpContent(helpData);

        try {
            windowManager.createWindow({
                id: 'helpWindow',
                title: '❓ Help - Neu-OS',
                content: helpContent,
                width: 600,
                height: 500,
                icon: '❓'
            });
        } catch (error) {
            console.error('Failed to create help window:', error);
        }
    }

    /**
     * Generates HTML content for the help window
     * @param {object} helpData - The help data object
     * @returns {string} HTML content
     */
    generateHelpContent(helpData) {
        let content = `
            <div class="help-content-container" style="padding: 20px; height: 100%; overflow-y: auto;">
                <h2 style="color: #4a90e2; margin-bottom: 20px;">${helpData.title}</h2>
        `;

        helpData.sections.forEach(section => {
            content += `
                <div class="help-section" style="margin-bottom: 25px;">
                    <h3 style="color: #00d084; margin-bottom: 10px;">${section.title}</h3>
                    <ul style="list-style-type: none; padding: 0;">
            `;
            
            section.content.forEach(item => {
                content += `<li style="margin: 8px 0; padding: 8px; background: rgba(74, 144, 226, 0.1); border-radius: 4px; border-left: 3px solid #4a90e2;">• ${item}</li>`;
            });
            
            content += `
                    </ul>
                </div>
            `;
        });

        content += `
                <div style="margin-top: 30px; padding: 15px; background: rgba(0, 208, 132, 0.1); border-radius: 8px; border: 1px solid rgba(0, 208, 132, 0.3); text-align: center;">
                    <p style="margin: 0; color: #00d084; font-weight: 600;">💡 Pro Tip</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">Try running 'show resume' in the terminal to see my professional background!</p>
                </div>
            </div>
        `;

        return content;
    }

    /**
     * Shows contextual help for a specific application
     * @param {string} appId - The application ID
     */
    showContextualHelp(appId) {
        const context = appId === 'terminal' ? 'terminal' : 'general';
        this.show(context);
    }
} 