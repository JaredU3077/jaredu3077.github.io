/**
 * Utility Module
 * Contains common utility functions and error handling
 */

/**
 * Utility functions for performance optimization and error handling
 */

/**
 * Debounce function to limit the rate at which a function can fire
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit the rate at which a function can fire
 * @param {Function} func - The function to throttle
 * @param {number} limit - The number of milliseconds to throttle by
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Custom error types for better error handling
 */
export class AppError extends Error {
    constructor(message, type, details = {}) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.details = details;
        this.timestamp = new Date();
    }
}

export const ErrorTypes = {
    NETWORK: 'NETWORK_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    STATE: 'STATE_ERROR',
    UI: 'UI_ERROR',
    SYSTEM: 'SYSTEM_ERROR'
};

/**
 * Create a loading indicator element
 * @param {string} message - Loading message to display
 * @returns {HTMLElement} Loading indicator element
 */
export function createLoadingIndicator(message = 'Loading...') {
    const indicator = document.createElement('div');
    indicator.className = 'loading-indicator';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    indicator.innerHTML = `
        <div class="spinner"></div>
        <div class="message">${message}</div>
    `;
    return indicator;
}

/**
 * Show a loading indicator in the specified container
 * @param {HTMLElement} container - Container to show loading indicator in
 * @param {string} message - Loading message to display
 * @returns {HTMLElement} Loading indicator element
 */
export function showLoading(container, message) {
    const indicator = createLoadingIndicator(message);
    container.appendChild(indicator);
    return indicator;
}

/**
 * Hide a loading indicator
 * @param {HTMLElement} indicator - Loading indicator to hide
 */
export function hideLoading(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

/**
 * Sanitize HTML string to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

/**
 * Validate command input
 * @param {string} command - The command to validate
 * @param {Array} args - The command arguments
 * @returns {boolean} - Whether the command is valid
 */
export function validateCommand(command, args) {
    if (!command) {
        throw new AppError('Command is required', ErrorTypes.VALIDATION);
    }
    return true;
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.marks = new Map();
    }

    startMeasure(name) {
        if (!this.marks.has(name)) {
            this.marks.set(name, performance.now());
        }
    }

    endMeasure(name) {
        if (this.marks.has(name)) {
            const startTime = this.marks.get(name);
            const duration = performance.now() - startTime;
            this.marks.delete(name);
            
            if (!this.metrics.has(name)) {
                this.metrics.set(name, []);
            }
            this.metrics.get(name).push(duration);
            
            // Keep only last 100 measurements
            if (this.metrics.get(name).length > 100) {
                this.metrics.get(name).shift();
            }
            
            return duration;
        }
        return null;
    }

    getMetrics(name) {
        if (!this.metrics.has(name)) return null;
        
        const measurements = this.metrics.get(name);
        return {
            average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
            min: Math.min(...measurements),
            max: Math.max(...measurements),
            count: measurements.length
        };
    }

    clearMetrics() {
        this.metrics.clear();
        this.marks.clear();
    }
}

/**
 * Memory management utility
 */
export class MemoryManager {
    constructor() {
        this.weakRefs = new WeakMap();
        this.cleanupCallbacks = new Set();
    }

    trackObject(obj, cleanup) {
        if (cleanup) {
            this.cleanupCallbacks.add(cleanup);
        }
        this.weakRefs.set(obj, new WeakRef(obj));
        return obj;
    }

    cleanup() {
        this.cleanupCallbacks.forEach(callback => callback());
        this.cleanupCallbacks.clear();
    }
}

/**
 * Event emitter for better event management
 */
export class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (this.events.has(event)) {
            this.events.get(event).delete(callback);
        }
    }

    emit(event, ...args) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    clear() {
        this.events.clear();
    }
}

// Export singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const memoryManager = new MemoryManager();
export const eventEmitter = new EventEmitter(); 