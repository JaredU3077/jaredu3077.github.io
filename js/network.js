/**
 * Network Visualization Module
 * Handles network topology visualization and updates
 * Enhanced with performance optimizations, error handling, and memory management
 */

import { CONFIG, configManager } from './config.js';
import { AppError, ErrorTypes, performanceMonitor, memoryManager, eventEmitter } from './utils.js';

export class NetworkVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new AppError(`Container element with id "${containerId}" not found`, ErrorTypes.UI);
        }
        
        this.network = null;
        this.updateInterval = null;
        this.networkState = this.loadNetworkState();
        this.tooltipTimeout = null;
        this.tooltip = this.createTooltip();
        this.errorHandler = this.createErrorHandler();
        this.performanceMetrics = new Map();
        this.isUpdating = false;
        
        // Track this instance for memory management
        memoryManager.trackObject(this, () => this.cleanup());
        
        try {
            performanceMonitor.startMeasure('networkInit');
            this.initializeNetwork();
            this.initializeConfigListener();
            performanceMonitor.endMeasure('networkInit');
        } catch (error) {
            this.errorHandler.handleError('Failed to initialize network visualization', error);
            throw error;
        }
    }

    cleanup() {
        this.stopUpdates();
        if (this.network) {
            this.network.destroy();
            this.network = null;
        }
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }
        this.saveNetworkState();
    }

    /**
     * Initialize configuration change listener
     */
    initializeConfigListener() {
        const unsubscribe = eventEmitter.on('configChanged', (newConfig) => {
            this.handleConfigUpdate(newConfig);
        });
        
        // Store unsubscribe function for cleanup
        this.configUnsubscribe = unsubscribe;
    }

    /**
     * Handle configuration updates
     * @param {Object} newConfig - New configuration
     */
    handleConfigUpdate(newConfig) {
        if (this.isUpdating) return;
        
        try {
            this.isUpdating = true;
            performanceMonitor.startMeasure('configUpdate');
            
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
            
            performanceMonitor.endMeasure('configUpdate');
        } catch (error) {
            this.errorHandler.handleError('Failed to update network configuration', error);
        } finally {
            this.isUpdating = false;
        }
    }

    /**
     * Load saved network state from localStorage
     * @returns {Object} Network state object
     */
    loadNetworkState() {
        try {
            const savedState = localStorage.getItem('networkState');
            if (savedState) {
                return JSON.parse(savedState);
            }
        } catch (error) {
            this.errorHandler.handleError('Failed to load network state', error);
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
        if (!this.network) return;
        
        try {
            const view = this.network.getViewPosition();
            const zoom = this.network.getScale();
            
            this.networkState.layout = {
                zoom,
                position: view
            };
            
            localStorage.setItem('networkState', JSON.stringify(this.networkState));
        } catch (error) {
            this.errorHandler.handleError('Failed to save network state', error);
        }
    }

    createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'network-tooltip';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);
        return tooltip;
    }

    createErrorHandler() {
        return {
            handleError: (message, error) => {
                console.error(message, error);
                
                // Create error notification
                const notification = document.createElement('div');
                notification.className = 'error-notification';
                notification.innerHTML = `
                    <div class="error-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Error</span>
                    </div>
                    <div class="error-message">${message}</div>
                `;
                document.body.appendChild(notification);
                
                // Auto-remove after 5 seconds
                setTimeout(() => notification.remove(), 5000);
                
                // Emit error event
                eventEmitter.emit('networkError', { message, error });
            }
        };
    }

    /**
     * Initialize the network visualization
     */
    initializeNetwork() {
        try {
            performanceMonitor.startMeasure('networkSetup');
            
            const nodes = new vis.DataSet(this.networkState.nodes);
            const edges = new vis.DataSet(this.networkState.edges);
            
            const options = {
                ...CONFIG.NETWORK.DEFAULT_OPTIONS,
                ...this.networkState.options,
                nodes: {
                    ...CONFIG.NETWORK.DEFAULT_OPTIONS.nodes,
                    ...this.networkState.options.nodes,
                    font: {
                        ...CONFIG.NETWORK.DEFAULT_OPTIONS.nodes.font,
                        ...this.networkState.options.nodes.font,
                        multi: true
                    }
                },
                edges: {
                    ...CONFIG.NETWORK.DEFAULT_OPTIONS.edges,
                    ...this.networkState.options.edges,
                    font: {
                        ...CONFIG.NETWORK.DEFAULT_OPTIONS.edges.font,
                        ...this.networkState.options.edges.font,
                        multi: true
                    }
                },
                interaction: {
                    hover: true,
                    tooltipDelay: 200,
                    zoomView: true,
                    dragView: true
                },
                physics: {
                    ...CONFIG.NETWORK.DEFAULT_OPTIONS.physics,
                    stabilization: {
                        iterations: 100,
                        updateInterval: 50,
                        fit: true
                    }
                }
            };

            this.network = new vis.Network(this.container, { nodes, edges }, options);

            // Enhanced event listeners with performance monitoring
            this.network.on('hoverNode', (params) => {
                performanceMonitor.startMeasure('nodeHover');
                this.showNodeTooltip(params);
                performanceMonitor.endMeasure('nodeHover');
            });

            this.network.on('blurNode', () => {
                this.hideTooltip();
            });

            this.network.on('click', (params) => {
                if (params.nodes.length > 0) {
                    performanceMonitor.startMeasure('nodeClick');
                    this.handleNodeClick(params);
                    performanceMonitor.endMeasure('nodeClick');
                }
            });

            // Restore saved layout
            if (this.networkState.layout) {
                this.network.moveTo({
                    position: this.networkState.layout.position,
                    scale: this.networkState.layout.zoom
                });
            }

            // Add event listeners for state persistence with debouncing
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

            // Add error handling for network events
            this.network.on('stabilizationFailed', () => {
                this.errorHandler.handleError('Network stabilization failed. The visualization may be unstable.');
            });

            performanceMonitor.endMeasure('networkSetup');
            
        } catch (error) {
            this.errorHandler.handleError('Failed to initialize network visualization', error);
            throw error;
        }
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

    showNodeTooltip(params) {
        const nodeId = params.node;
        const node = this.network.body.data.nodes.get(nodeId);
        
        if (!node) return;

        const tooltipContent = `
            <div class="tooltip-content">
                <h3>${node.label}</h3>
                <div class="tooltip-details">
                    <p><strong>Type:</strong> ${node.type || 'Unknown'}</p>
                    <p><strong>Status:</strong> ${node.status || 'Unknown'}</p>
                    <p><strong>IP:</strong> ${node.ip || 'N/A'}</p>
                    <p><strong>Last Update:</strong> ${node.lastUpdate || 'N/A'}</p>
                </div>
            </div>
        `;

        this.tooltip.innerHTML = tooltipContent;
        this.tooltip.style.display = 'block';
        
        // Position tooltip near the node
        const position = this.network.getPositions([nodeId])[nodeId];
        const canvasPosition = this.network.canvasToDOM(position);
        
        this.tooltip.style.left = `${canvasPosition.x + 10}px`;
        this.tooltip.style.top = `${canvasPosition.y + 10}px`;
    }

    hideTooltip() {
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
        }
        this.tooltipTimeout = setTimeout(() => {
            this.tooltip.style.display = 'none';
        }, 200);
    }

    handleNodeClick(params) {
        const nodeId = params.nodes[0];
        const node = this.network.body.data.nodes.get(nodeId);
        
        // Create a detailed view window
        const windowManager = window.windowManager;
        if (windowManager) {
            windowManager.createWindow({
                id: `node-details-${nodeId}`,
                title: `Node Details: ${node.label}`,
                content: `
                    <div class="node-details">
                        <div class="detail-section">
                            <h3>Basic Information</h3>
                            <table>
                                <tr><td>Type:</td><td>${node.type || 'Unknown'}</td></tr>
                                <tr><td>Status:</td><td>${node.status || 'Unknown'}</td></tr>
                                <tr><td>IP Address:</td><td>${node.ip || 'N/A'}</td></tr>
                                <tr><td>Last Update:</td><td>${node.lastUpdate || 'N/A'}</td></tr>
                            </table>
                        </div>
                        <div class="detail-section">
                            <h3>Performance Metrics</h3>
                            <div class="metrics-grid">
                                <div class="metric">
                                    <span class="metric-label">CPU Usage</span>
                                    <span class="metric-value">${node.cpu || 'N/A'}</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Memory Usage</span>
                                    <span class="metric-value">${node.memory || 'N/A'}</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Network Traffic</span>
                                    <span class="metric-value">${node.traffic || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                width: 500,
                height: 400
            });
        }
    }
}
