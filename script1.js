// Background animation (subtle network pulses)
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.05)';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 50, 0, Math.PI * 2);
        ctx.fill();
    }
    requestAnimationFrame(drawBackground);
}
drawBackground();

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

// Draggable terminal window
interact('#terminalWindow').draggable({
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
});

// Widget updates (mock data)
function updateWidgets() {
    document.getElementById('bandwidth').textContent = `${Math.floor(Math.random() * 100)} Mbps`;
    document.getElementById('alerts').textContent = Math.random() > 0.8 ? 'Packet Loss Detected' : 'No alerts';
}
setInterval(updateWidgets, 3000);
updateWidgets();

// Icon and taskbar button clicks
document.querySelectorAll('.icon, .taskbar-tools button').forEach(el => {
    el.addEventListener('click', () => {
        const tool = el.dataset.tool;
        if (tool === 'terminal') {
            document.getElementById('terminalWindow').style.display = 'block';
        } else {
            alert(`Opening ${tool.replace('-', ' ')}... (Placeholder)`);
        }
    });
});

// Close terminal
document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('terminalWindow').style.display = 'none';
});
