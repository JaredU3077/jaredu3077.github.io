// js/apps/terminal/content.js

export async function loadResume() {
    try {
        const response = await fetch('assets/content/resume.txt');
        if (!response.ok) throw new Error('Failed to load resume.txt');
        return await response.text();
    } catch (error) {
        return `Error loading resume: ${error.message}`;
    }
}

export async function handleShow(terminal, args) {
    const [section] = args;
    if (!section) {
        return 'Usage: show <section>\nAvailable sections: resume, jared, demoscene';
    }
    
    switch (section.toLowerCase()) {
        case 'resume':
        case 'jared':
            return await loadResume();
        case 'demoscene':
            return handleDemoscene();
        default:
            return `Unknown section: ${section}\nAvailable sections: resume, jared, demoscene`;
    }
}

export function handleDemoscene() {
    window.open('./demoscene/demoscene.html', '_blank');
    return 'Opening demoscene in new tab...';
}