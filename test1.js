// test1.js - neuOS breathing effect test with interactive tilt
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.glass-text-container');
    if (!container) return;
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        container.style.transform = `rotateX(${y * -25}deg) rotateY(${x * 25}deg)`;
    });
    container.addEventListener('mouseleave', () => {
        container.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
}); 