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
            gravitationalConstant: -3000, // Increase repulsion to reduce spread
            centralGravity: 0.3,
            springLength: 100, // Reduce spring length for tighter layout
            springConstant: 0.05
        },
        stabilization: {
            iterations: 500 // Stabilize layout faster
        }
    },
    interaction: {
        dragView: true, // Enable panning
        zoomView: true, // Enable zooming
        dragNodes: true // Allow dragging nodes
    }
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

// Function to parse and format codex.txt content
function parseCodexContent(text) {
    const lines = text.trim().split('\n');
    let htmlContent = '';
    let currentList = null;
    let listLevel = 0;
    let inLayer = false;

    lines.forEach((line, index) => {
        if (!line.trim() && !currentList) return;

        line = line.replace(/\r/g, '');

        if (line.match(/^Codex of Financial Instruments/)) {
            htmlContent += `<h2>${line}</h2>`;
            return;
        }

        if (line.match(/^Layer \d+:/)) {
            if (currentList) {
                htmlContent += '</ul>'.repeat(listLevel);
                currentList = null;
                listLevel = 0;
            }
            if (inLayer) {
                htmlContent += '</div>';
            }
            htmlContent += `<div class="layer-section"><h3>${line}</h3>`;
            inLayer = true;
            return;
        }

        if (line.match(/^\w.*:$/)) {
            if (currentList) {
                htmlContent += '</ul>'.repeat(listLevel);
                currentList = null;
                listLevel = 0;
            }
            htmlContent += `<h4>${line.replace(/:$/, '')}</h4>`;
            return;
        }

        if (line.match(/^\s{4,}/)) {
            const indentLevel = Math.floor(line.match(/^\s*/)[0].length / 4);
            line = line.trim();

            if (indentLevel > listLevel) {
                htmlContent += '<ul>';
                listLevel++;
            } else if (indentLevel < listLevel) {
                htmlContent += '</ul>'.repeat(listLevel - indentLevel);
                listLevel = indentLevel;
            }

            if (line.match(/^\w.*:/)) {
                const [term, description] = line.split(': ', 2);
                htmlContent += `<li><strong>${term}:</strong> ${description || ''}</li>`;
            } else {
                htmlContent += `<li>${line}</li>`;
            }
            currentList = true;
            return;
        }

        if (currentList) {
            htmlContent += '</ul>'.repeat(listLevel);
            currentList = null;
            listLevel = 0;
        }
        htmlContent += `<p>${line.trim()}</p>`;
    });

    if (listLevel > 0) {
        htmlContent += '</ul>'.repeat(listLevel);
    }
    if (inLayer) {
        htmlContent += '</div>';
    }

    return htmlContent;
}

// Function to load codex.txt and display it
function loadCodexContent() {
    fetch('codex.txt')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load codex.txt');
            return response.text();
        })
        .then(text => {
            const formattedContent = parseCodexContent(text);
            const codexContent = document.getElementById('codexContent');
            codexContent.innerHTML = formattedContent;
            codexContent.scrollTop = 0;
        })
        .catch(error => {
            console.error(error);
            document.getElementById('codexContent').innerHTML = '<p>Error loading Codex content.</p>';
        });
}

// Draggable and resizable windows
interact('.window-header').draggable({
    listeners: {
        move(event) {
            const target = event.target.parentElement; // Target the window, not the header
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        }
    }
});

interact('.window').resizable({
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
                topology.style.height = (event.rect.height - 40) + 'px';
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

    window.addEventListener('click', () => {
        if (window.style.display === 'block' && !window.classList.contains('maximized') && window.id !== 'codexWindow') {
            window.style.width = window.dataset.initialWidth || '500px';
            window.style.height = window.dataset.initialHeight || '400px';
            window.style.transform = 'translate(0, 0)';
            window.setAttribute('data-x', 0);
            window.setAttribute('data-y', 0);
            window.scrollTop = 0;
        }
    });

    minimizeBtn.addEventListener('click', () => {
        body.style.display = body.style.display === 'none' ? 'block' : 'none';
    });

    maximizeBtn.addEventListener('click', () => {
        if (window.classList.contains('maximized')) {
            window.style.width = window.dataset.initialWidth || '500px';
            window.style.height = window.dataset.initialHeight || '400px';
            window.classList.remove('maximized');
        } else {
            window.dataset.initialWidth = window.style.width || '500px';
            window.dataset.initialHeight = window.style.height || '400px';
            window.style.width = '90%';
            window.style.height = '80%';
            window.style.left = '5%';
            window.style.top = '5%';
            window.style.transform = 'translate(0, 0)';
            window.setAttribute('data-x', 0);
            window.setAttribute('data-y', 0);
            window.classList.add('maximized');
        }
        if (window.id === 'topologyWindow') {
            const topology = document.getElementById('networkTopology');
            topology.style.width = '100%';
            topology.style.height = (window.offsetHeight - 40) + 'px';
            network.fit();
        }
        window.scrollTop = 0;
    });

    closeBtn.addEventListener('click', () => {
        window.style.display = 'none';
        window.classList.remove('maximized');
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
            const window = document.getElementById('terminalWindow');
            window.style.display = 'block';
            window.scrollTop = 0;
        } else if (tool === 'network-monitor') {
            const window = document.getElementById('topologyWindow');
            window.style.display = 'block';
            window.scrollTop = 0;
            // Fit the network graph to the window on open
            const topology = document.getElementById('networkTopology');
            topology.style.width = '100%';
            topology.style.height = (window.offsetHeight - 40) + 'px';
            network.fit();
        } else if (tool === 'device-manager') {
            const window = document.getElementById('widgetsWindow');
            window.style.display = 'block';
            window.scrollTop = 0;
        } else if (tool === 'codex') {
            const window = document.getElementById('codexWindow');
            window.style.display = 'block';
            window.style.width = '90%';
            window.style.height = '80%';
            window.style.left = '5%';
            window.style.top = '5%';
            window.style.transform = 'translate(0, 0)';
            window.setAttribute('data-x', 0);
            window.setAttribute('data-y', 0);
            window.classList.add('maximized');
            window.scrollTop = 0;
            loadCodexContent();
        }
        document.getElementById('startMenu').style.display = 'none';
    });
});

// Start menu toggle
document.querySelector('.start-btn').addEventListener('click', () => {
    const startMenu = document.getElementById('startMenu');
    startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
});
