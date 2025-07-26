/**
 * neuOS Performance Monitor
 * Tracks and reports performance metrics for the application
 * @author Jared U.
 * @tags neu-os
 */

export class NeuOSPerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            firstPaint: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0,
            frameRate: 0,
            memoryUsage: null,
            longTasks: [],
            layoutShifts: []
        };
        
        this.observers = new Map();
        this.isMonitoring = false;
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.fpsHistory = [];
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startMonitoring());
        } else {
            this.startMonitoring();
        }
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.monitorLoadPerformance();
        this.monitorPaintMetrics();
        this.monitorLayoutShifts();
        this.monitorLongTasks();
        this.monitorFrameRate();
        this.monitorMemoryUsage();
        
        console.log('neuOS Performance Monitor: Started monitoring');
    }

    monitorLoadPerformance() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.metrics.loadTime = performance.now();
                this.reportMetric('loadTime', this.metrics.loadTime);
            }, 0);
        });

        // Monitor navigation timing
        if (performance.getEntriesByType) {
            const navigationEntries = performance.getEntriesByType('navigation');
            if (navigationEntries.length > 0) {
                const navigation = navigationEntries[0];
                this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                this.reportMetric('navigationLoadTime', this.metrics.loadTime);
            }
        }
    }

    monitorPaintMetrics() {
        if (!PerformanceObserver) return;

        try {
            // Monitor First Paint and First Contentful Paint
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-paint') {
                        this.metrics.firstPaint = entry.startTime;
                        this.reportMetric('firstPaint', this.metrics.firstPaint);
                    } else if (entry.name === 'first-contentful-paint') {
                        this.metrics.firstContentfulPaint = entry.startTime;
                        this.reportMetric('firstContentfulPaint', this.metrics.firstContentfulPaint);
                    }
                }
            });
            
            paintObserver.observe({ entryTypes: ['paint'] });
            this.observers.set('paint', paintObserver);

            // Monitor Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.largestContentfulPaint = lastEntry.startTime;
                this.reportMetric('largestContentfulPaint', this.metrics.largestContentfulPaint);
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', lcpObserver);

        } catch (error) {
            console.warn('Performance Monitor: Paint metrics not supported');
        }
    }

    monitorLayoutShifts() {
        if (!PerformanceObserver) return;

        try {
            const layoutShiftObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.value > 0.1) { // Only track significant layout shifts
                        this.metrics.layoutShifts.push({
                            value: entry.value,
                            startTime: entry.startTime,
                            sources: entry.sources
                        });
                        this.metrics.cumulativeLayoutShift += entry.value;
                        this.reportMetric('layoutShift', entry.value);
                    }
                }
            });
            
            layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('layoutShift', layoutShiftObserver);

        } catch (error) {
            console.warn('Performance Monitor: Layout shift monitoring not supported');
        }
    }

    monitorLongTasks() {
        if (!PerformanceObserver) return;

        try {
            const longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        this.metrics.longTasks.push({
                            duration: entry.duration,
                            startTime: entry.startTime,
                            name: entry.name
                        });
                        this.reportMetric('longTask', entry.duration);
                    }
                }
            });
            
            longTaskObserver.observe({ entryTypes: ['longtask'] });
            this.observers.set('longTask', longTaskObserver);

        } catch (error) {
            console.warn('Performance Monitor: Long task monitoring not supported');
        }
    }

               monitorFrameRate() {
               let frameCount = 0;
               let lastTime = performance.now();
               let isMonitoring = true;
               
               const measureFPS = (currentTime) => {
                   if (!isMonitoring) return;
                   
                   frameCount++;
                   
                   if (currentTime - lastTime >= 1000) { // Every second
                       const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                       this.metrics.frameRate = fps;
                       this.fpsHistory.push(fps);
                       
                       // Keep only last 60 FPS measurements
                       if (this.fpsHistory.length > 60) {
                           this.fpsHistory.shift();
                       }
                       
                       // Report low FPS (but not too frequently)
                       if (fps < 30 && this.fpsHistory.length % 5 === 0) {
                           this.reportMetric('lowFPS', fps);
                       }
                       
                       frameCount = 0;
                       lastTime = currentTime;
                   }
                   
                   if (isMonitoring) {
                       requestAnimationFrame(measureFPS);
                   }
               };
               
               requestAnimationFrame(measureFPS);
               
               // Store cleanup function
               this._stopFrameRateMonitoring = () => {
                   isMonitoring = false;
               };
           }

               monitorMemoryUsage() {
               if (performance.memory) {
                   setInterval(() => {
                       this.metrics.memoryUsage = {
                           usedJSHeapSize: performance.memory.usedJSHeapSize,
                           totalJSHeapSize: performance.memory.totalJSHeapSize,
                           jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                       };
                       
                       // Report high memory usage (but not too frequently)
                       const usagePercent = (this.metrics.memoryUsage.usedJSHeapSize / this.metrics.memoryUsage.jsHeapSizeLimit) * 100;
                       if (usagePercent > 80 && Math.random() < 0.2) { // Only report 20% of the time
                           this.reportMetric('highMemoryUsage', usagePercent);
                       }
                   }, 10000); // Check every 10 seconds instead of 5
               }
           }

    monitorFirstInputDelay() {
        if (!PerformanceObserver) return;

        try {
            const firstInputObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
                    this.reportMetric('firstInputDelay', this.metrics.firstInputDelay);
                }
            });
            
            firstInputObserver.observe({ entryTypes: ['first-input'] });
            this.observers.set('firstInput', firstInputObserver);

        } catch (error) {
            console.warn('Performance Monitor: First input delay monitoring not supported');
        }
    }

    reportMetric(name, value) {
        // Log significant performance issues
        if (name === 'longTask' && value > 100) {
            console.warn(`Performance Monitor: Long task detected - ${value.toFixed(2)}ms`);
        } else if (name === 'layoutShift' && value > 0.25) {
            console.warn(`Performance Monitor: Significant layout shift detected - ${value.toFixed(3)}`);
        } else if (name === 'lowFPS' && value < 20) {
            console.warn(`Performance Monitor: Very low FPS detected - ${value}fps`);
        } else if (name === 'highMemoryUsage' && value > 90) {
            console.warn(`Performance Monitor: Very high memory usage - ${value.toFixed(1)}%`);
        }
        
        // Emit custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('neuos-performance-metric', {
            detail: { name, value, timestamp: Date.now() }
        }));
    }

    getMetrics() {
        return {
            ...this.metrics,
            averageFPS: this.fpsHistory.length > 0 ? 
                this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length : 0,
            minFPS: this.fpsHistory.length > 0 ? Math.min(...this.fpsHistory) : 0,
            maxFPS: this.fpsHistory.length > 0 ? Math.max(...this.fpsHistory) : 0
        };
    }

    getPerformanceReport() {
        const metrics = this.getMetrics();
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                loadTime: `${metrics.loadTime.toFixed(2)}ms`,
                firstPaint: `${metrics.firstPaint.toFixed(2)}ms`,
                firstContentfulPaint: `${metrics.firstContentfulPaint.toFixed(2)}ms`,
                largestContentfulPaint: `${metrics.largestContentfulPaint.toFixed(2)}ms`,
                cumulativeLayoutShift: metrics.cumulativeLayoutShift.toFixed(3),
                averageFPS: `${metrics.averageFPS.toFixed(1)}fps`,
                longTasksCount: metrics.longTasks.length,
                layoutShiftsCount: metrics.layoutShifts.length
            },
            details: metrics
        };
        
        return report;
    }

    logPerformanceReport() {
        const report = this.getPerformanceReport();
        console.group('neuOS Performance Report');
        console.log('Summary:', report.summary);
        console.log('Full Report:', report);
        console.groupEnd();
    }

               stopMonitoring() {
               this.isMonitoring = false;
               
               // Stop frame rate monitoring
               if (this._stopFrameRateMonitoring) {
                   this._stopFrameRateMonitoring();
               }
               
               // Disconnect all observers
               this.observers.forEach(observer => {
                   if (observer.disconnect) {
                       observer.disconnect();
                   }
               });
               this.observers.clear();
               
               console.log('neuOS Performance Monitor: Stopped monitoring');
           }

    // Static method to get global instance
    static getInstance() {
        if (!window.neuOSPerformanceMonitor) {
            window.neuOSPerformanceMonitor = new NeuOSPerformanceMonitor();
        }
        return window.neuOSPerformanceMonitor;
    }
}

// Auto-initialize when module is loaded
NeuOSPerformanceMonitor.getInstance(); 