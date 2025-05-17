// network.js - Network Topology Visualization Module

// Network topology map with vis.js
const nodes = new vis.DataSet([
    { id: 1, label: 'Router 1' },
    { id: 2, label: 'Switch 1' },
    { id: 3, label: 'PC 1' },
    { id: 4, label: 'Server' },
    { id: 5, label: 'Router 2' }
]);
const edges = new vis.DataSet([
    { from: 1, to: 2, label: '1 Gbps' },
    { from: 2, to: 3, label: '100 Mbps' },
    { from: 2, to: 4, label: '1 Gbps' },
    { from: 1, to: 5, label: '10 Gbps' }
]);
const container = document.getElementById('networkTopology');
const data = { nodes, edges };
const options = {
    nodes: { shape: 'dot', size: 20 },
    edges: { arrows: 'to', color: '#4682B4', font: { align: 'middle' } },
    physics: {
        enabled: true,
        barnesHut: {
            gravitationalConstant: -3000,
            centralGravity: 0.3,
            springLength: 100,
            springConstant: 0.05
        },
        stabilization: {
            iterations: 500
        }
    },
    interaction: {
        dragView: true,
        zoomView: true,
        dragNodes: true
    }
};
const network = new vis.Network(container, data, options);
// Animate edges to show traffic
setInterval(() => {
    edges.forEach((edge, id) => {
        edges.update({ id, color: Math.random() > 0.5 ? '#4682B4' : '#1C2526' });
    });
}, 1000); 