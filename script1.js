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
    physics: { enabled: true }
};
const network = new vis.Network(container, data, options);
// Animate edges to show traffic
setInterval(() => {
    edges.forEach((edge, id) => {
        edges.update({ id, color: Math.random() > 0.5 ? '#4682B4' : '#1C2526' });
    });
}, 1000);

// Terminal functionality
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');
const commands = {
    'help': 'Available commands: ping, clear, help',
    'ping': 'Pinging 8.8.8.8... Reply from 8.8.8.8: 32ms',
    'clear': () => { terminalOutput.innerHTML = ''; return ''; }
};
terminalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const command = terminalInput.value.trim().toLowerCase();
        let output = commands[command] || 'Command not found';
        if (typeof output === 'function') output = output();
        terminalOutput.innerHTML += `<div>> ${command}</div><div>${output}</div>`;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        terminalInput.value = '';
    }
});

// Draggable and resizable windows
interact('.window').draggable({
    listeners: {
        move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        }
    }
}).resizable({
    edges: { left: true, right: true, bottom: true, top: true },
    listeners: {
        move(event) {
            const target = event.target;
            let x = (parseFloat(target.getAttribute('data-x')) || 0);
            let y = (parseFloat(target.getAttribute('data-y')) || 0);

            target.style.width = event.rect.width + 'px';
            target.style.height = event.rect.height + 'px';

            x += event.deltaRect.left;
            y += event.deltaRect.top;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);

            // Resize topology map if needed
            if (target.id === 'topologyWindow') {
                const topology = document.getElementById('networkTopology');
                topology.style.width = event.rect.width + 'px';
                topology.style.height = (event.rect.height - 40) + 'px'; // Adjust for header
                network.fit();
            }
        }
    }
});

// Window controls
document.querySelectorAll('.window').forEach(window => {
    const minimizeBtn = window.querySelector('.minimize-btn');
    const maximizeBtn = window.querySelector('.maximize-btn');
    const closeBtn = window.querySelector('.close-btn');
    const body = window.querySelector('.window-body');

    minimizeBtn.addEventListener('click', () => {
        body.style.display = body.style.display === 'none' ? 'block' : 'none';
    });

    maximizeBtn.addEventListener('click', () => {
        if (window.style.width === '90%') {
            window.style.width = window.dataset.originalWidth || '500px';
            window.style.height = window.dataset.originalHeight || '400px';
        } else {
            window.dataset.originalWidth = window.style.width || '500px';
            window.dataset.originalHeight = window.style.height || '400px';
            window.style.width = '90%';
            window.style.height = '80%';
            window.style.left = '5%';
            window.style.top = '5%';
            window.style.transform = 'translate(0, 0)';
            window.setAttribute('data-x', 0);
            window.setAttribute('data-y', 0);
        }
        if (window.id === 'topologyWindow') {
            const topology = document.getElementById('networkTopology');
            topology.style.width = '100%';
            topology.style.height = (window.offsetHeight - 40) + 'px';
            network.fit();
        }
    });

    closeBtn.addEventListener('click', () => {
        window.style.display = 'none';
    });
});

// Widget updates (mock data)
function updateWidgets() {
    document.getElementById('bandwidth').textContent = `${Math.floor(Math.random() * 100)} Mbps`;
    document.getElementById('alerts').textContent = Math.random() > 0.8 ? 'Packet Loss Detected' : 'No alerts';
}
setInterval(updateWidgets, 3000);
updateWidgets();

// Icon and taskbar button clicks
document.querySelectorAll('.icon, .taskbar-icon, .start-menu button').forEach(el => {
    el.addEventListener('click', () => {
        const tool = el.dataset.tool;
        if (tool === 'terminal') {
            document.getElementById('terminalWindow').style.display = 'block';
        } else if (tool === 'network-monitor') {
            document.getElementById('topologyWindow').style.display = 'block';
        } else if (tool === 'device-manager') {
            document.getElementById('widgetsWindow').style.display = 'block';
        }
        document.getElementById('startMenu').style.display = 'none'; // Close Start menu
    });
});

// Start menu toggle
document.querySelector('.start-btn').addEventListener('click', () => {
    const startMenu = document.getElementById('startMenu');
    startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
});
