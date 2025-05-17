# Network Engineer OS (Web Edition)

A modern, interactive website that simulates a desktop operating system for network engineers. Built with HTML5, CSS, and JavaScript, this project showcases advanced UI/UX concepts, window management, and network visualization tools in a browser environment.

## Project Overview

- **Purpose:** Demonstrate a web-based "OS" for network engineers, featuring draggable/resizable windows, a terminal, network topology visualization, a searchable codex, and more.
- **Tech Stack:** HTML5, CSS3, JavaScript (ES6+), [vis.js](https://visjs.org/) for network visualization, [Font Awesome](https://fontawesome.com/) for icons.
- **Design:** Inspired by macOS and modern desktop environments, with a focus on usability and aesthetics.

## Main Features

- **Desktop UI:** Clickable desktop icons, taskbar, and start menu for launching apps.
- **Window Management:** Draggable, resizable, minimizable, maximizable, and closable windows with smooth animations and snapping.
- **Terminal Emulator:** Command history, autocomplete, and simulated network/OS commands.
- **Network Topology Map:** Interactive network visualization using vis.js.
- **Codex:** Searchable, categorized reference of financial and network instruments.
- **Help System:** In-app help for commands, shortcuts, and window controls.
- **Keyboard Shortcuts:** Power-user shortcuts for window and terminal management.
- **Responsive Design:** Works on desktop and tablets.

## Getting Started

1. **Clone or Download:**
   ```bash
   git clone <repo-url>
   cd <project-folder>
   ```
2. **Open `index.html` in your browser.**
   - No build step or server required (all static files).
   - For full functionality, use a modern browser (Chrome, Firefox, Edge, Safari).

## File Structure

- `index.html` — Main HTML file (desktop, icons, taskbar, and app bootstrapping)
- `theme.css` — All styles (desktop, windows, terminal, codex, etc.)
- `js/` — Modular JavaScript (window manager, terminal, network, help, search, config, parser, utils)
- `codex.txt` — Data for the Codex app
- `resume.txt` — Data for the resume/terminal app

## Credits
- UI/UX: Inspired by macOS, Windows, and Linux desktop environments
- Network visualization: [vis.js](https://visjs.org/)
- Icons: [Font Awesome](https://fontawesome.com/)

---

**For demo and learning purposes only. Not a real OS.** 