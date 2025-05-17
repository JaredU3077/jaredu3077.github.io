/**
 * Configuration Module
 * Contains constants and configuration values used across the application
 */

export const CONFIG = {
    // Window defaults
    WINDOW: {
        DEFAULT_WIDTH: '500px',
        DEFAULT_HEIGHT: '400px',
        MAXIMIZED_WIDTH: '90%',
        MAXIMIZED_HEIGHT: '80%',
        MAXIMIZED_MARGIN: '5%'
    },

    // Network visualization
    NETWORK: {
        UPDATE_INTERVAL: 3000,
        NODE_GROUPS: {
            ROUTER: { color: { background: '#ff0000' } },
            SWITCH: { color: { background: '#00ff00' } },
            SERVER: { color: { background: '#0000ff' } }
        },
        NODE_OPTIONS: {
            shape: 'dot',
            size: 20,
            font: {
                size: 12
            }
        },
        EDGE_OPTIONS: {
            width: 2,
            font: {
                size: 10
            }
        }
    },

    // Terminal commands
    COMMANDS: {
        HELP: 'Available commands: ping, clear, help, show resume, show jared',
        PING: 'Pinging 8.8.8.8... Reply from 8.8.8.8: 32ms'
    },

    // File paths
    PATHS: {
        RESUME: 'resume.txt',
        CODEX: 'codex.txt'
    }
};
