/**
 * Network Visualization Module
 * Handles network topology visualization and updates
 */

export class NetworkVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.network = null;
        this.updateInterval = null;
        this.initializeNetwork();
    }

    /**
     * Initialize the network visualization
     */
    initializeNetwork() {
        // Create nodes and edges for the network visualization
        const nodes = new vis.DataSet([
            { id: 1, label: 'Router 1', group: 'router' },
            { id: 2, label: 'Router 2', group: 'router' },
            { id: 3, label: 'Switch 1', group: 'switch' },
            { id: 4, label: 'Switch 2', group: 'switch' },
            { id: 5, label: 'Server 1', group: 'server' },
            { id: 6, label: 'Server 2', group: 'server' }
        ]);

        const edges = new vis.DataSet([
            { from: 1, to: 2, label: '10Gbps' },
            { from: 1, to: 3, label: '1Gbps' },
            { from: 2, to: 4, label: '1Gbps' },
            { from: 3, to: 5, label: '1Gbps' },
            { from: 4, to: 6, label: '1Gbps' }
        ]);

        const options = {
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
            }
        };

        this.network = new vis.Network(this.container, { nodes, edges }, options);
    }

    /**
     * Start periodic updates of the network visualization
     */
    startUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateWidgets();
        }, 3000);
        this.updateWidgets(); // Initial update
    }

    /**
     * Stop periodic updates
     */
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Update network widgets with mock data
     */
    updateWidgets() {
        const bandwidth = document.getElementById('bandwidth');
        const alerts = document.getElementById('alerts');
        
        if (bandwidth) {
            bandwidth.textContent = `${Math.floor(Math.random() * 100)} Mbps`;
        }
        
        if (alerts) {
            alerts.textContent = Math.random() > 0.8 ? 'Packet Loss Detected' : 'No alerts';
        }
    }

    /**
     * Fit the network visualization to the container
     */
    fit() {
        if (this.network) {
            this.network.fit();
        }
    }
}
