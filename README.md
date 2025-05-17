# Network Engineer OS (Web Edition)

A modern, interactive website that simulates a desktop operating system for network engineers. Built with HTML5, CSS, and JavaScript, this project showcases advanced UI/UX concepts, window management, and network visualization tools in a browser environment.

## Project Overview

- **Purpose:** Demonstrate a web-based "OS" for network engineers, featuring draggable/resizable windows, a terminal, network topology visualization, a searchable codex, and more.
- **Tech Stack:** HTML5, CSS3, JavaScript (ES6+), [vis.js](https://visjs.org/) for network visualization, [Font Awesome](https://fontawesome.com/) for icons.
- **Design:** Inspired by macOS and modern desktop environments, with a focus on usability and aesthetics.

## Main Features

- **Desktop UI:** Clickable desktop icons, taskbar, and start menu for launching apps.
- **Window Management:** 
  - Draggable, resizable, minimizable, maximizable, and closable windows
  - Smooth animations and transitions
  - Window snapping and keyboard shortcuts (Alt+Tab, Alt+F4, Alt+Space)
  - WCAG 2.1 compliant with ARIA labels and keyboard navigation
- **Network Visualization:**
  - Interactive network topology map using vis.js
  - Detailed node tooltips with real-time information
  - Performance metrics and status indicators
  - Error handling and user notifications
  - Dark mode support
- **Terminal Emulator:** Command history, autocomplete, and simulated network/OS commands.
- **Codex:** Searchable, categorized reference of financial and network instruments.
- **Help System:** In-app help for commands, shortcuts, and window controls.
- **Keyboard Shortcuts:** Power-user shortcuts for window and terminal management.
- **Responsive Design:** Works on desktop and tablets.

## Recent Improvements

### Accessibility Enhancements
- Added ARIA labels and roles for better screen reader support
- Improved keyboard navigation with Alt+Tab window switching
- Enhanced focus indicators and keyboard shortcuts
- WCAG 2.1 compliance improvements

### Network Visualization Updates
- Added detailed tooltips for network nodes
- Implemented error handling and user notifications
- Enhanced node details view with performance metrics
- Added dark mode support
- Improved performance with optimized rendering

### UI/UX Improvements
- Added smooth window transitions and animations
- Enhanced error feedback with toast notifications
- Improved tooltip system for better information display
- Added responsive grid layouts for metrics display

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
- `js/` — Modular JavaScript:
  - `window.js` — Window management and accessibility features
  - `network.js` — Network visualization and tooltips
  - `terminal.js` — Terminal emulator
  - `help.js` — Help system
  - `search.js` — Search functionality
  - `config.js` — Configuration management
  - `parser.js` — Command parsing
  - `utils.js` — Utility functions
- `codex.txt` — Data for the Codex app
- `resume.txt` — Data for the resume/terminal app

## Keyboard Shortcuts

- **Alt+Tab** — Switch between windows
- **Alt+F4** — Close active window
- **Alt+Space** — Maximize/restore window
- **Escape** — Close active window
- **Ctrl+Tab** — Switch between tabs (in terminal)

## Credits
- UI/UX: Inspired by macOS, Windows, and Linux desktop environments
- Network visualization: [vis.js](https://visjs.org/)
- Icons: [Font Awesome](https://fontawesome.com/)

---

**For demo and learning purposes only. Not a real OS.** 