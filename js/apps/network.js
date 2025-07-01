import { CONFIG } from '../config.js';

export class NetworkVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container element with id "${containerId}" not found`);
            return;
        }

        // Check if vis.js library is available
        if (typeof vis === 'undefined') {
            console.error('vis.js library not loaded - network visualization unavailable');
            this.showFallbackMessage();
            return;
        }

        try {
            this.nodes = new vis.DataSet(CONFIG.NETWORK.nodes);
            this.edges = new vis.DataSet(CONFIG.NETWORK.edges);
            this.options = CONFIG.NETWORK.options;

            this.network = new vis.Network(
                this.container,
                { nodes: this.nodes, edges: this.edges },
                this.options
            );

            // Add error handling for network rendering
            this.network.on('error', (error) => {
                console.error('Network visualization error:', error);
                this.showFallbackMessage();
            });

        } catch (error) {
            console.error('Failed to initialize network visualization:', error);
            this.showFallbackMessage();
        }
    }

    showFallbackMessage() {
        if (this.container) {
            this.container.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 20px; color: #4a90e2;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🌐</div>
                    <h3 style="margin-bottom: 10px; color: #eaf1fb;">Network Topology</h3>
                    <p style="opacity: 0.8; max-width: 400px;">
                        Interactive network visualization is temporarily unavailable. 
                        The network includes core routers, switches, servers, and endpoint devices 
                        in a modern leaf-spine architecture.
                    </p>
                    <div style="margin-top: 20px; padding: 15px; background: rgba(74, 144, 226, 0.1); border-radius: 8px; border: 1px solid rgba(74, 144, 226, 0.3);">
                        <strong>Network Components:</strong><br>
                        • Core Router (BGP/OSPF)<br>
                        • Distribution Switches<br>
                        • Servers & Endpoints<br>
                        • Security Appliances
                    </div>
                </div>
            `;
        }
    }

    // Add method to refresh network if needed
    refresh() {
        if (this.network) {
            try {
                this.network.redraw();
            } catch (error) {
                console.warn('Network refresh failed:', error);
            }
        }
    }

    // Cleanup method
    destroy() {
        if (this.network) {
            try {
                this.network.destroy();
            } catch (error) {
                console.warn('Network cleanup failed:', error);
            }
            this.network = null;
        }
    }
}
