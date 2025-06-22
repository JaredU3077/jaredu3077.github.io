import { CONFIG } from '../config.js';

export class NetworkVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container element with id "${containerId}" not found`);
            return;
        }

        this.nodes = new vis.DataSet(CONFIG.NETWORK.nodes);
        this.edges = new vis.DataSet(CONFIG.NETWORK.edges);
        this.options = CONFIG.NETWORK.options;

        this.network = new vis.Network(
            this.container,
            { nodes: this.nodes, edges: this.edges },
            this.options
        );
    }
}
