# Network Engineer OS (Web Edition)

A modern, interactive website that simulates a desktop operating system for network engineers. Built with HTML5, CSS, and vanilla JavaScript, this project showcases advanced UI/UX concepts, window management, and network visualization tools in a browser environment.

## Project Overview

- **Purpose:** Demonstrate a web-based "OS" for network engineers, featuring draggable/resizable windows, a terminal, network topology visualization, a searchable codex, and more.
- **Tech Stack:** 
  - HTML5, CSS3, JavaScript (ES6+)
  - [vis.js](https://visjs.org/) for network visualization
  - [Font Awesome](https://fontawesome.com/) for icons
  - [interact.js](https://interactjs.io/) for window management
- **Design:** Inspired by macOS and modern desktop environments, with a focus on usability and aesthetics.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## Main Features

### Desktop Environment
- **Desktop UI:** 
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

### System Features
- **Help System:** In-app help for commands, shortcuts, and window controls
- **Keyboard Shortcuts:** Power-user shortcuts for window and terminal management
- **Search:** Global search functionality across applications
- **Accessibility:** Full keyboard navigation and screen reader support
- **Error Handling:** Comprehensive error handling with user notifications

## Code Documentation

This project uses [JSDoc](https://jsdoc.app/) to generate documentation from the source code. The configuration can be found in `jsdoc.json`.

### Generating the Documentation

To generate the documentation, you need to have Node.js and JSDoc installed.

1.  **Install JSDoc and the theme:**
    ```bash
    npm install -g jsdoc
    npm install clean-jsdoc-theme
    ```

2.  **Generate the documentation:**
    ```bash
    jsdoc -c jsdoc.json
    ```
    The documentation will be generated in the `docs` directory.

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
.
├── codex.txt
├── index.html
├── js
│   ├── config.js
│   ├── help.js
│   ├── keyboard.js
│   ├── network.js
│   ├── parser.js
│   ├── search.js
│   ├── terminal.js
│   ├── utils.js
│   └── window.js
├── jsdoc.json
├── README.md
├── resume.txt
└── theme.css
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) (for generating documentation)

### Installation

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
- **Alt+N** — Show Network Topology
- **Alt+T** — Show Terminal
- **Alt+C** — Show Codex
- **Alt+W** — Show Widgets
- **Escape / Alt+F4** — Close active window

### Terminal
- **Ctrl+L** — Clear terminal
- **Ctrl+U** — Clear input line
- **Ctrl+R** — Reload terminal

### Network Visualization
- **Ctrl+F** — Fit network to view
- **Ctrl+Plus** — Zoom in
- **Ctrl+Minus** — Zoom out
- **Ctrl+0** — Reset zoom

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

This project is licensed under the MIT License.

## Disclaimer

This is a demo project and not a real operating system. It is intended for educational and demonstration purposes only.


