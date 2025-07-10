/**
 * @file Provides common utility functions, classes, and singletons for the application.
 * @author Jared U.
 */

/**
 * Utility functions for performance optimization and error handling
 */

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @returns {Function} Returns the new debounced function.
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
 * Creates a throttled function that only invokes `func` at most once per every `limit` milliseconds.
 * @param {Function} func The function to throttle.
 * @param {number} limit The number of milliseconds to throttle invocations to.
 * @returns {Function} Returns the new throttled function.
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
 * Custom error class for application-specific errors.
 * @class AppError
 * @extends {Error}
 */
export class AppError extends Error {
    /**
     * Creates an instance of AppError.
     * @param {string} message The error message.
     * @param {string} type The type of error (from ErrorTypes).
     * @param {object} [details={}] Additional details about the error.
     * @memberof AppError
     */
    constructor(message, type, details = {}) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.details = details;
        this.timestamp = new Date();
    }
}

/**
 * An enum for application-specific error types.
 * @enum {string}
 */
export const ErrorTypes = {
    NETWORK: 'NETWORK_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    STATE: 'STATE_ERROR',
    UI: 'UI_ERROR',
    SYSTEM: 'SYSTEM_ERROR',
    FILE_LOAD: 'FILE_LOAD_ERROR'
};



/**
 * Validates a command input. (Currently a placeholder).
 * @param {string} command - The command to validate.
 * @param {Array} args - The command arguments.
 * @returns {boolean} True if the command is valid.
 * @throws {AppError} If the command is invalid.
 */
export function validateCommand(command, args) {
    if (!command) {
        throw new AppError('Command is required', ErrorTypes.VALIDATION);
    }
    return true;
}

/**
 * A utility for monitoring client-side performance metrics.
 * @class PerformanceMonitor
 */
export class PerformanceMonitor {
    constructor() {
        /** @private @type {Map<string, number[]>} */
        this.metrics = new Map();
        /** @private @type {Map<string, number>} */
        this.marks = new Map();
    }

    /**
     * Starts a performance measurement.
     * @param {string} name - The name of the measurement.
     * @memberof PerformanceMonitor
     */
    startMeasure(name) {
        if (!this.marks.has(name)) {
            this.marks.set(name, performance.now());
        }
    }

    /**
     * Ends a performance measurement and records the duration.
     * @param {string} name - The name of the measurement to end.
     * @returns {?number} The duration in milliseconds, or null if the start mark was not found.
     * @memberof PerformanceMonitor
     */
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

    /**
     * Gets performance metrics for a given measurement.
     * @param {string} name - The name of the measurement.
     * @returns {?{average: number, min: number, max: number, count: number}} The metrics object, or null if not found.
     * @memberof PerformanceMonitor
     */
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

    /**
     * Clears all recorded performance metrics and marks.
     * @memberof PerformanceMonitor
     */
    clearMetrics() {
        this.metrics.clear();
        this.marks.clear();
    }
}



/**
 * A simple event emitter for pub/sub-style event handling.
 * @class EventEmitter
 */
export class EventEmitter {
    constructor() {
        /** @private @type {Map<string, Set<Function>>} */
        this.events = new Map();
    }

    /**
     * Registers an event handler for the given event.
     * @param {string} event - The name of the event to listen for.
     * @param {Function} callback - The function to call when the event is emitted.
     * @returns {Function} A function to unregister the event handler.
     * @memberof EventEmitter
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);
        return () => this.off(event, callback);
    }

    /**
     * Unregisters an event handler for the given event.
     * @param {string} event - The name of the event.
     * @param {Function} callback - The handler to remove.
     * @memberof EventEmitter
     */
    off(event, callback) {
        if (this.events.has(event)) {
            this.events.get(event).delete(callback);
        }
    }

    /**
     * Emits an event, calling all registered handlers.
     * @param {string} event - The name of the event to emit.
     * @param {...*} args - Arguments to pass to the event handlers.
     * @memberof EventEmitter
     */
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

    /**
     * Clears all registered event handlers.
     * @memberof EventEmitter
     */
    clear() {
        this.events.clear();
    }
}

// --- SINGLETON EXPORTS ---
/** @type {PerformanceMonitor} */
export const performanceMonitor = new PerformanceMonitor();
/** @type {EventEmitter} */
export const eventEmitter = new EventEmitter(); 