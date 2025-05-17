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

// Function to parse and format text content (for both codex.txt and resume.txt)
function parseTextContent(text) {
    const lines = text.trim().split('\n');
    let htmlContent = '';
    let inSection = false;
    let inJobDetails = false;

    lines.forEach((line, index) => {
        if (!line.trim()) return;

        line = line.replace(/\r/g, '');

        // Check for main heading (e.g., "Jared - Senior Network Engineer Resume")
        if (line.match(/^[A-Za-z\s-]+Resume$/)) {
            htmlContent += `<div class="terminal-heading">${line}</div>`;
            inJobDetails = false;
            return;
        }

        // Check for section headings (e.g., "Professional Experience")
        if (line.match(/^[A-Za-z\s]+$/)) {
            if (inSection) {
                htmlContent += '</div>';
            }
            htmlContent += `<div class="terminal-section"><div class="terminal-subheading">${line}</div>`;
            inSection = true;
            inJobDetails = false;
            return;
        }

        // Check for job titles (e.g., "Senior Network Engineer")
        if (line.match(/^\s{4}[A-Za-z\s]+$/)) {
            htmlContent += `<div class="terminal-subheading2">${line.trim()}</div>`;
            inJobDetails = false;
            return;
        }

        // Check for company and date lines (e.g., "ArenaNet, Bellevue, WA", "July 2019 - April 2022")
        if (line.match(/^\s{4}[A-Za-z\s,-]+, [A-Z]{2}$/) || line.match(/^\s{4}[A-Za-z]+ \d{4} - (?:[A-Za-z]+ \d{4}|Present)$/)) {
            htmlContent += `<div class="terminal-subheading2">${line.trim()}</div>`;
            inJobDetails = true; // Next lines will be job details
            return;
        }

        // Check for skill categories (e.g., "Networking Technologies: Cisco, Brocade...")
        if (line.match(/^\s{4}- [A-Za-z\s&]+:/)) {
            const [category, details] = line.split(':', 2);
            htmlContent += `<div><span class="terminal-subheading2">${category.trim()}:</span> <span class="terminal-detail">${details.trim()}</span></div>`;
            inJobDetails = false;
            return;
        }

        // Treat as job details or other lines
        if (inJobDetails) {
            htmlContent += `<div class="terminal-detail">${line.trim()}</div>`;
        } else {
            htmlContent += `<div>${line.trim()}</div>`;
        }
    });

    if (inSection) {
        htmlContent += '</div>';
    }

    return htmlContent;
}

// Function to load and display codex.txt
function loadCodexContent() {
    fetch('codex.txt')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load codex.txt');
            return response.text();
        })
        .then(text => {
            const formattedContent = parseTextContent(text);
            const codexContent = document.getElementById('codexContent');
            codexContent.innerHTML = formattedContent;
            codexContent.scrollTop = 0;
        })
        .catch(error => {
            console.error(error);
            document.getElementById('codexContent').innerHTML = '<p>Error loading Codex content.</p>';
        });
}

// Function to load and display resume.txt in the Terminal
function loadResumeContent(callback) {
    fetch('resume.txt')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load resume.txt');
            return response.text();
        })
        .then(text => {
            const formattedContent = parseTextContent(text);
            callback(formattedContent);
        })
        .catch(error => {
            console.error(error);
            callback('Error loading resume content.');
        });
}

// Terminal functionality
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');
const commands = {
    'help': 'Available commands: ping, clear, help, show resume, show jared',
    'ping': 'Pinging 8.8.8.8... Reply from 8.8.8.8: 32ms',
    'clear': () => { terminalOutput.innerHTML = ''; return ''; },
    'show resume': (callback) => {
        loadResumeContent(content => callback(content));
        return '';
    },
    'show jared': (callback) => {
        loadResumeContent(content => callback(content));
        return '';
    }
};
terminalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const command = terminalInput.value.trim().toLowerCase();
        let output = commands[command] || 'Command not found';
        
        if (typeof output === 'function') {
            output((result) => {
                terminalOutput.innerHTML += `<div>> ${command}</div><div>${result}</div>`;
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            });
        } else {
            terminalOutput.innerHTML += `<div>> ${command}</div><div>${output}</div>`;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
        terminalInput.value = '';
    }
});

// Draggable and resizable windows
interact('.window-header').draggable({
    listeners: {
        move(event) {
            const target = event.target.parentElement;
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
