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
        DEFAULT_NODES: [
            { id: 1, label: 'Router 1', group: 'router' },
            { id: 2, label: 'Router 2', group: 'router' },
            { id: 3, label: 'Switch 1', group: 'switch' },
            { id: 4, label: 'Switch 2', group: 'switch' },
            { id: 5, label: 'Server 1', group: 'server' },
            { id: 6, label: 'Server 2', group: 'server' }
        ],
        DEFAULT_EDGES: [
            { from: 1, to: 2, label: '10Gbps' },
            { from: 1, to: 3, label: '1Gbps' },
            { from: 2, to: 4, label: '1Gbps' },
            { from: 3, to: 5, label: '1Gbps' },
            { from: 4, to: 6, label: '1Gbps' }
        ],
        DEFAULT_OPTIONS: {
            nodes: {
                shape: 'dot',
                size: 20,
                font: {
                    size: 12
                }
            },
            edges: {
                width: 2,
                font: {
                    size: 10
                }
            },
            groups: {
                router: { color: { background: '#ff0000' } },
                switch: { color: { background: '#00ff00' } },
                server: { color: { background: '#0000ff' } }
            },
            physics: {
                stabilization: {
                    iterations: 100
                }
            },
            interaction: {
                dragNodes: true,
                dragView: true,
                zoomView: true
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
