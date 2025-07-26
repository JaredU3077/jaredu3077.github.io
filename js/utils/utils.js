/**
 * @file Provides common utility functions, classes, and singletons for the application.
 * Performance optimized utilities for better application performance.
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
 * Creates a memoized function that caches results for better performance.
 * @param {Function} func The function to memoize.
 * @param {Function} resolver The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 */
export function memoize(func, resolver) {
    const cache = new Map();
    return function memoized(...args) {
        const key = resolver ? resolver.apply(this, args) : args[0];
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = func.apply(this, args);
        cache.set(key, result);
        return result;
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
    /**
     * Creates an instance of PerformanceMonitor.
     * @memberof PerformanceMonitor
     */
    constructor() {
        this.metrics = new Map();
        this.marks = new Map();
        this.measures = new Map();
        this.observers = new Map();
        this.isEnabled = true;
    }

    /**
     * Start measuring a performance metric.
     * @param {string} name - The name of the metric.
     * @memberof PerformanceMonitor
     */
    startMeasure(name) {
        if (!this.isEnabled) return;
        
        const startTime = performance.now();
        this.marks.set(name, startTime);
        
        // Also use native performance API
        if (performance.mark) {
            performance.mark(`${name}-start`);
        }
    }

    /**
     * End measuring a performance metric.
     * @param {string} name - The name of the metric.
     * @param {object} [metadata={}] - Additional metadata about the measurement.
     * @memberof PerformanceMonitor
     */
    endMeasure(name, metadata = {}) {
        if (!this.isEnabled) return;
        
        const startTime = this.marks.get(name);
        if (!startTime) {
            console.warn(`PerformanceMonitor: No start time found for measure "${name}"`);
            return;
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Store metric
        this.metrics.set(name, {
            duration,
            startTime,
            endTime,
            metadata,
            timestamp: Date.now()
        });
        
        // Use native performance API
        if (performance.mark && performance.measure) {
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);
        }
        
        // Log if duration is significant
        if (duration > 16) { // Longer than one frame at 60fps
            console.warn(`PerformanceMonitor: Slow operation detected - "${name}" took ${duration.toFixed(2)}ms`);
        }
        
        // Clean up marks
        this.marks.delete(name);
    }

    /**
     * Get performance metrics for a specific measurement.
     * @param {string} name - The name of the metric.
     * @returns {object|null} The performance metric data.
     * @memberof PerformanceMonitor
     */
    getMetrics(name) {
        return this.metrics.get(name) || null;
    }

    /**
     * Get all performance metrics.
     * @returns {Map} All stored metrics.
     * @memberof PerformanceMonitor
     */
    getAllMetrics() {
        return new Map(this.metrics);
    }

    /**
     * Clear all performance metrics.
     * @memberof PerformanceMonitor
     */
    clearMetrics() {
        this.metrics.clear();
        this.marks.clear();
        this.measures.clear();
    }

    /**
     * Enable or disable performance monitoring.
     * @param {boolean} enabled - Whether to enable monitoring.
     * @memberof PerformanceMonitor
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    /**
     * Monitor frame rate using requestAnimationFrame.
     * @param {Function} callback - Callback function with FPS data.
     * @memberof PerformanceMonitor
     */
    monitorFrameRate(callback) {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFPS = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) { // Every second
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                callback(fps, currentTime - lastTime);
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    /**
     * Monitor memory usage (if available).
     * @returns {object|null} Memory usage information.
     * @memberof PerformanceMonitor
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    /**
     * Monitor long tasks using PerformanceObserver.
     * @param {Function} callback - Callback function for long tasks.
     * @memberof PerformanceMonitor
     */
    monitorLongTasks(callback) {
        if (!PerformanceObserver) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        callback(entry);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['longtask'] });
            this.observers.set('longtask', observer);
        } catch (error) {
            console.warn('PerformanceMonitor: Long task monitoring not supported');
        }
    }

    /**
     * Monitor layout shifts using PerformanceObserver.
     * @param {Function} callback - Callback function for layout shifts.
     * @memberof PerformanceMonitor
     */
    monitorLayoutShifts(callback) {
        if (!PerformanceObserver) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.value > 0.1) { // Layout shifts greater than 0.1
                        callback(entry);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('layout-shift', observer);
        } catch (error) {
            console.warn('PerformanceMonitor: Layout shift monitoring not supported');
        }
    }

    /**
     * Cleanup all observers.
     * @memberof PerformanceMonitor
     */
    cleanup() {
        this.observers.forEach(observer => {
            if (observer.disconnect) {
                observer.disconnect();
            }
        });
        this.observers.clear();
    }
}

/**
 * Event emitter for application-wide event handling.
 * @class EventEmitter
 */
export class EventEmitter {
    /**
     * Creates an instance of EventEmitter.
     * @memberof EventEmitter
     */
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
    }

    /**
     * Register an event listener.
     * @param {string} event - The event name.
     * @param {Function} callback - The callback function.
     * @memberof EventEmitter
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    /**
     * Register a one-time event listener.
     * @param {string} event - The event name.
     * @param {Function} callback - The callback function.
     * @memberof EventEmitter
     */
    once(event, callback) {
        if (!this.onceEvents.has(event)) {
            this.onceEvents.set(event, []);
        }
        this.onceEvents.get(event).push(callback);
    }

    /**
     * Remove an event listener.
     * @param {string} event - The event name.
     * @param {Function} callback - The callback function to remove.
     * @memberof EventEmitter
     */
    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit an event.
     * @param {string} event - The event name.
     * @param {...any} args - Arguments to pass to the callback functions.
     * @memberof EventEmitter
     */
    emit(event, ...args) {
        // Emit regular events
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`EventEmitter: Error in event handler for "${event}":`, error);
                }
            });
        }
        
        // Emit once events and remove them
        if (this.onceEvents.has(event)) {
            const callbacks = this.onceEvents.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`EventEmitter: Error in once event handler for "${event}":`, error);
                }
            });
            this.onceEvents.delete(event);
        }
    }

    /**
     * Clear all event listeners.
     * @memberof EventEmitter
     */
    clear() {
        this.events.clear();
        this.onceEvents.clear();
    }
}

/**
 * neuOS Logging Utility
 * Provides controlled logging with different levels and the ability to disable debug logs
 * @author Jared U.
 * @tags neu-os
 */
export class NeuOSLogger {
    constructor() {
        this.isDebugEnabled = localStorage.getItem('neuos-debug-logs') === 'true';
        this.isVerboseEnabled = localStorage.getItem('neuos-verbose-logs') === 'true';
        this.logLevel = localStorage.getItem('neuos-log-level') || 'warn'; // error, warn, info, debug, verbose
        
        // Set default to warn level to reduce console clutter
        if (!localStorage.getItem('neuos-log-level')) {
            this.logLevel = 'warn';
            localStorage.setItem('neuos-log-level', 'warn');
        }
    }

    /**
     * Log a message with the specified level
     * @param {string} level - The log level (error, warn, info, debug, verbose)
     * @param {string} message - The message to log
     * @param {...any} args - Additional arguments to log
     */
    log(level, message, ...args) {
        const levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            verbose: 4
        };

        const currentLevel = levels[this.logLevel] || 1;
        const messageLevel = levels[level] || 1;

        // Only log if the message level is at or below the current log level
        if (messageLevel <= currentLevel) {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            const prefix = `[neuOS ${timestamp}]`;
            
            switch (level) {
                case 'error':
                    console.error(prefix, message, ...args);
                    break;
                case 'warn':
                    console.warn(prefix, message, ...args);
                    break;
                case 'info':
                    console.info(prefix, message, ...args);
                    break;
                case 'debug':
                    if (this.isDebugEnabled) {
                        console.log(prefix, message, ...args);
                    }
                    break;
                case 'verbose':
                    if (this.isVerboseEnabled) {
                        console.log(prefix, message, ...args);
                    }
                    break;
                default:
                    console.log(prefix, message, ...args);
            }
        }
    }

    error(message, ...args) {
        this.log('error', message, ...args);
    }

    warn(message, ...args) {
        this.log('warn', message, ...args);
    }

    info(message, ...args) {
        this.log('info', message, ...args);
    }

    debug(message, ...args) {
        this.log('debug', message, ...args);
    }

    verbose(message, ...args) {
        this.log('verbose', message, ...args);
    }

    /**
     * Enable or disable debug logging
     * @param {boolean} enabled - Whether to enable debug logging
     */
    setDebugEnabled(enabled) {
        this.isDebugEnabled = enabled;
        localStorage.setItem('neuos-debug-logs', enabled.toString());
    }

    /**
     * Enable or disable verbose logging
     * @param {boolean} enabled - Whether to enable verbose logging
     */
    setVerboseEnabled(enabled) {
        this.isVerboseEnabled = enabled;
        localStorage.setItem('neuos-verbose-logs', enabled.toString());
    }

    /**
     * Set the log level
     * @param {string} level - The log level (error, warn, info, debug, verbose)
     */
    setLogLevel(level) {
        this.logLevel = level;
        localStorage.setItem('neuos-log-level', level);
    }

    /**
     * Get the current logger instance
     * @returns {NeuOSLogger} The logger instance
     */
    static getInstance() {
        if (!window.neuOSLogger) {
            window.neuOSLogger = new NeuOSLogger();
        }
        return window.neuOSLogger;
    }
}

// Create global instances
export const performanceMonitor = new PerformanceMonitor();
export const eventEmitter = new EventEmitter();

// Performance optimization utilities
export const performanceUtils = {
    /**
     * Batch DOM updates for better performance.
     * @param {Function} updateFunction - Function containing DOM updates.
     */
    batchDOMUpdates(updateFunction) {
        requestAnimationFrame(() => {
            updateFunction();
        });
    },

    /**
     * Debounce DOM queries by caching results.
     * @param {Function} queryFunction - Function that performs DOM query.
     * @param {number} cacheTime - How long to cache the result (ms).
     * @returns {Function} Cached query function.
     */
    cacheDOMQuery(queryFunction, cacheTime = 1000) {
        let cache = null;
        let lastCacheTime = 0;
        
        return function(...args) {
            const now = Date.now();
            if (!cache || now - lastCacheTime > cacheTime) {
                cache = queryFunction.apply(this, args);
                lastCacheTime = now;
            }
            return cache;
        };
    },

    /**
     * Optimize CSS animations by using transform and opacity.
     * @param {HTMLElement} element - Element to optimize.
     */
    optimizeAnimations(element) {
        element.style.willChange = 'transform, opacity';
        element.style.transform = 'translateZ(0)';
    },

    /**
     * Check if element is in viewport for lazy loading.
     * @param {HTMLElement} element - Element to check.
     * @returns {boolean} Whether element is in viewport.
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}; 