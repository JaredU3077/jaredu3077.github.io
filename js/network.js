/**
 * Network Visualization Module
 * Handles network topology visualization and updates
 */

import { CONFIG, configManager } from './config.js';

export class NetworkVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.network = null;
        this.updateInterval = null;
        this.networkState = this.loadNetworkState();
        this.initializeNetwork();
        this.initializeConfigListener();
    }

    /**
     * Initialize configuration change listener
     */
    initializeConfigListener() {
        window.addEventListener('configChanged', (event) => {
            const newConfig = event.detail;
            this.handleConfigUpdate(newConfig);
        });
    }

    /**
     * Handle configuration updates
     * @param {Object} newConfig - New configuration
     */
    handleConfigUpdate(newConfig) {
        // Update network update interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.startUpdates();
        }

        // Update network options if needed
        if (this.network) {
            const networkConfig = newConfig.NETWORK;
            if (networkConfig) {
                this.network.setOptions({
                    ...networkConfig.DEFAULT_OPTIONS,
                    ...this.networkState.options
                });
            }
        }
    }

    /**
     * Load saved network state from localStorage
     * @returns {Object} Network state object
     */
    loadNetworkState() {
        const savedState = localStorage.getItem('networkState');
        if (savedState) {
            return JSON.parse(savedState);
        }
        return {
            nodes: CONFIG.NETWORK.DEFAULT_NODES,
            edges: CONFIG.NETWORK.DEFAULT_EDGES,
            options: CONFIG.NETWORK.DEFAULT_OPTIONS,
            layout: {
                zoom: 1,
                position: { x: 0, y: 0 }
            }
        };
    }

    /**
     * Save network state to localStorage
     */
    saveNetworkState() {
        if (this.network) {
            const view = this.network.getViewPosition();
            const zoom = this.network.getScale();
            
            this.networkState.layout = {
                zoom,
                position: view
            };
            
            localStorage.setItem('networkState', JSON.stringify(this.networkState));
        }
    }

    /**
     * Initialize the network visualization
     */
    initializeNetwork() {
        const nodes = new vis.DataSet(this.networkState.nodes);
        const edges = new vis.DataSet(this.networkState.edges);
        const options = {
            ...CONFIG.NETWORK.DEFAULT_OPTIONS,
            ...this.networkState.options,
            nodes: {
                ...CONFIG.NETWORK.DEFAULT_OPTIONS.nodes,
                ...this.networkState.options.nodes
            },
            edges: {
                ...CONFIG.NETWORK.DEFAULT_OPTIONS.edges,
                ...this.networkState.options.edges
            }
        };

        this.network = new vis.Network(this.container, { nodes, edges }, options);

        // Restore saved layout
        if (this.networkState.layout) {
            this.network.moveTo({
                position: this.networkState.layout.position,
                scale: this.networkState.layout.zoom
            });
        }

        // Add event listeners for state persistence
        this.network.on('stabilizationIterationsDone', () => {
            this.saveNetworkState();
        });

        this.network.on('dragEnd', () => {
            this.saveNetworkState();
        });

        this.network.on('zoom', () => {
            this.saveNetworkState();
        });

        // Add customization controls
        this.initializeCustomizationControls();
    }

    /**
     * Initialize network customization controls
     */
    initializeCustomizationControls() {
        const controls = document.createElement('div');
        controls.className = 'network-controls';
        controls.innerHTML = `
            <div class="control-group">
                <label>Node Size:</label>
                <input type="range" min="10" max="50" value="${this.networkState.options.nodes.size || 20}" id="nodeSize">
            </div>
            <div class="control-group">
                <label>Edge Width:</label>
                <input type="range" min="1" max="5" value="${this.networkState.options.edges.width || 2}" id="edgeWidth">
            </div>
            <div class="control-group">
                <label>Font Size:</label>
                <input type="range" min="8" max="24" value="${this.networkState.options.nodes.font.size || 12}" id="fontSize">
            </div>
            <div class="control-group">
                <label>Update Interval:</label>
                <input type="range" min="1000" max="10000" step="1000" value="${CONFIG.NETWORK.UPDATE_INTERVAL}" id="updateInterval">
            </div>
        `;

        this.container.parentElement.insertBefore(controls, this.container);

        // Add event listeners for controls
        controls.querySelector('#nodeSize').addEventListener('input', (e) => {
            this.updateNodeSize(parseInt(e.target.value));
        });

        controls.querySelector('#edgeWidth').addEventListener('input', (e) => {
            this.updateEdgeWidth(parseInt(e.target.value));
        });

        controls.querySelector('#fontSize').addEventListener('input', (e) => {
            this.updateFontSize(parseInt(e.target.value));
        });

        controls.querySelector('#updateInterval').addEventListener('input', (e) => {
            this.updateInterval = parseInt(e.target.value);
            configManager.updateConfig({
                NETWORK: {
                    UPDATE_INTERVAL: this.updateInterval
                }
            });
        });
    }

    /**
     * Update node size
     * @param {number} size - New node size
     */
    updateNodeSize(size) {
        this.networkState.options.nodes.size = size;
        this.network.setOptions({ nodes: { size } });
        this.saveNetworkState();
    }

    /**
     * Update edge width
     * @param {number} width - New edge width
     */
    updateEdgeWidth(width) {
        this.networkState.options.edges.width = width;
        this.network.setOptions({ edges: { width } });
        this.saveNetworkState();
    }

    /**
     * Update font size
     * @param {number} size - New font size
     */
    updateFontSize(size) {
        this.networkState.options.nodes.font.size = size;
        this.networkState.options.edges.font.size = Math.max(8, size - 2);
        this.network.setOptions({
            nodes: { font: { size } },
            edges: { font: { size: Math.max(8, size - 2) } }
        });
        this.saveNetworkState();
    }

    /**
     * Start periodic updates of the network visualization
     */
    startUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateWidgets();
        }, CONFIG.NETWORK.UPDATE_INTERVAL);
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
        if (!CONFIG.NETWORK.MOCK_DATA) {
            return;
        }

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
            this.saveNetworkState();
        }
    }

    /**
     * Zoom in the network visualization
     */
    zoomIn() {
        if (this.network) {
            const currentScale = this.network.getScale();
            this.network.moveTo({
                scale: currentScale * 1.2
            });
            this.saveNetworkState();
        }
    }

    /**
     * Zoom out the network visualization
     */
    zoomOut() {
        if (this.network) {
            const currentScale = this.network.getScale();
            this.network.moveTo({
                scale: currentScale / 1.2
            });
            this.saveNetworkState();
        }
    }

    /**
     * Reset zoom level to default
     */
    resetZoom() {
        if (this.network) {
            this.network.moveTo({
                scale: 1
            });
            this.saveNetworkState();
        }
    }

    /**
     * Reset network to default state
     */
    resetToDefault() {
        this.networkState = {
            nodes: CONFIG.NETWORK.DEFAULT_NODES,
            edges: CONFIG.NETWORK.DEFAULT_EDGES,
            options: CONFIG.NETWORK.DEFAULT_OPTIONS,
            layout: {
                zoom: 1,
                position: { x: 0, y: 0 }
            }
        };
        localStorage.removeItem('networkState');
        this.initializeNetwork();
    }
}
