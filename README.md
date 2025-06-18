# Network Engineer OS (Web Edition)

A modern, interactive website that simulates a desktop operating system for network engineers. Built with HTML5, CSS, and JavaScript, this project showcases advanced UI/UX concepts, window management, and network visualization tools in a browser environment.

## Project Overview

- **Purpose:** Demonstrate a web-based "OS" for network engineers, featuring draggable/resizable windows, a terminal, network topology visualization, a searchable codex, and more.
- **Tech Stack:** 
  - HTML5, CSS3, JavaScript (ES6+)
  - [vis.js](https://visjs.org/) for network visualization
  - [Font Awesome](https://fontawesome.com/) for icons
  - [interact.js](https://interactjs.io/) for window management
- **Design:** Inspired by macOS and modern desktop environments, with a focus on usability and aesthetics.

## Main Features

### Desktop Environment
- **Desktop UI:** 
  - Clickable desktop icons with SVG graphics
  - Taskbar with Start menu and running applications
  - Application icons with custom SVG graphics
  - Window management system
- **Window Management:** 
  - Draggable, resizable, minimizable, maximizable, and closable windows
  - Smooth animations and transitions
  - Window snapping and keyboard shortcuts
  - WCAG 2.1 compliant with ARIA labels and keyboard navigation
  - Window context menu for additional controls
  - Z-index management for proper window stacking

### Applications
1. **Network Monitor:**
   - Interactive network topology map using vis.js
   - Real-time network status widgets
   - Bandwidth usage monitoring
   - Network alerts and notifications
   - Detailed node tooltips with performance metrics
   - Error handling and user notifications
   - Network state persistence
   - Customizable network visualization options
   - Zoom and pan controls

2. **Terminal Emulator:**
   - Command history and autocomplete
   - Simulated network/OS commands
   - Tab support (Ctrl+Tab)
   - Command output formatting
   - Error handling and feedback

3. **Codex:**
   - Searchable reference of financial and network instruments
   - Categorized content
   - Real-time search with highlighting
   - Responsive layout

4. **Device Manager:**
   - Network device inventory
   - Status monitoring
   - Configuration management
   - Performance metrics

### System Features
- **Help System:** In-app help for commands, shortcuts, and window controls
- **Keyboard Shortcuts:** Power-user shortcuts for window and terminal management
- **Search:** Global search functionality across applications
- **Responsive Design:** Works on desktop and tablets
- **Accessibility:** Full keyboard navigation and screen reader support
- **Error Handling:** Comprehensive error handling with user notifications

## Technical Architecture

### Core Components
- **Window Manager (`window.js`):** 
  - Handles window creation, management, and state
  - Implements window dragging and resizing
  - Manages window focus and z-index
  - Provides window context menu
  - Handles keyboard shortcuts for window management

- **Network Visualization (`network.js`):** 
  - Manages network topology and metrics
  - Implements state persistence
  - Provides error handling
  - Manages tooltips and interactions
  - Handles configuration updates

- **Terminal (`terminal.js`):** 
  - Implements terminal emulation
  - Processes commands
  - Manages command history
  - Handles input/output

- **Search System (`search.js`):** 
  - Provides search functionality across applications
  - Implements real-time search
  - Manages search results

- **Configuration (`config.js`):** 
  - Manages application settings
  - Handles configuration updates
  - Provides default values

- **Command Parser (`parser.js`):** 
  - Processes terminal commands
  - Handles system actions
  - Manages command validation

- **Keyboard Manager (`keyboard.js`):** 
  - Handles keyboard shortcuts
  - Manages input events
  - Provides keyboard navigation

- **Help System (`help.js`):** 
  - Provides in-app documentation
  - Manages help content
  - Handles help requests

- **Utilities (`utils.js`):** 
  - Common helper functions
  - Utility methods
  - Shared functionality

### File Structure
```
├── index.html          # Main HTML file
├── theme.css          # Global styles
├── js/                # JavaScript modules
│   ├── window.js      # Window management
│   ├── network.js     # Network visualization
│   ├── terminal.js    # Terminal emulator
│   ├── help.js        # Help system
│   ├── search.js      # Search functionality
│   ├── config.js      # Configuration
│   ├── parser.js      # Command parsing
│   ├── keyboard.js    # Keyboard shortcuts
│   └── utils.js       # Utility functions
├── codex.txt          # Codex content
└── resume.txt         # Resume/terminal content
```

## Getting Started

1. **Clone or Download:**
   ```bash
   git clone <repo-url>
   cd <project-folder>
   ```

2. **Open `index.html` in your browser:**
   - No build step or server required (all static files)
   - For full functionality, use a modern browser (Chrome, Firefox, Edge, Safari)
   - Recommended screen resolution: 1920x1080 or higher

## Keyboard Shortcuts

### Window Management
- **Alt+Tab** — Switch between windows
- **Alt+F4** — Close active window
- **Alt+Space** — Maximize/restore window
- **Escape** — Close active window

### Terminal
- **Ctrl+Tab** — Switch between tabs
- **Up/Down Arrow** — Navigate command history

## Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Credits
- UI/UX: Inspired by macOS, Windows, and Linux desktop environments
- Network visualization: [vis.js](https://visjs.org/)
- Icons: [Font Awesome](https://fontawesome.com/)
- Window management: [interact.js](https://interactjs.io/)

## License
MIT License - See LICENSE file for details

---

**For demo and learning purposes only. Not a real OS.** 