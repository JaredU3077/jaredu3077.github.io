/**
 * Handles snap-related functionality for windows.
 * @class SnapHandler
 */
export class SnapHandler {
    /**
     * Creates an instance of SnapHandler.
     * @param {WindowManager} manager - The window manager instance.
     */
    constructor(manager) {
        this.manager = manager;
        this.snapThreshold = 15;
        this.isSnappingEnabled = true;
        this._snapTimeout = null;
    }

    /**
     * Disables snapping temporarily.
     * @param {number} [duration=1000] - Duration to disable snapping (ms).
     */
    disableSnapping(duration = 1000) {
        this.isSnappingEnabled = false;
        clearTimeout(this._snapTimeout);
        this._snapTimeout = setTimeout(() => {
            this.isSnappingEnabled = true;
        }, duration);
    }

    /**
     * Checks if a window is in a snap zone and snaps it if appropriate.
     * @param {object} windowObj - The window to check.
     */
    checkSnapZones(windowObj) {
        if (windowObj.isMaximized || windowObj._isResizing || windowObj._hasBeenResized || 
            !this.isSnappingEnabled || windowObj._isSnapped) {
            return;
        }

        const rect = windowObj.element.getBoundingClientRect();
        const snapZones = this.getSnapZones();

        for (const [zone, bounds] of snapZones) {
            if (this.isInSnapZone(rect, bounds)) {
                this.snapWindowToZone(windowObj, zone);
                return;
            }
        }
    }

    /**
     * Gets the defined screen snap zones, adjusted for taskbar.
     * @returns {Map<string, object>} A map of snap zones.
     */
    getSnapZones() {
        const zones = new Map();
        const screenWidth = window.innerWidth;
        const effectiveHeight = window.innerHeight;

        zones.set('left', { left: 0, top: 0, width: screenWidth / 2, height: effectiveHeight });
        zones.set('right', { left: screenWidth / 2, top: 0, width: screenWidth / 2, height: effectiveHeight });
        zones.set('top', { left: 0, top: 0, width: screenWidth, height: effectiveHeight / 2 });
        zones.set('bottom', { left: 0, top: effectiveHeight / 2, width: screenWidth, height: effectiveHeight / 2 });

        return zones;
    }

    /**
     * Checks if a rectangle is within a snap zone.
     * @param {DOMRect} rect - The rectangle to check.
     * @param {object} zone - The snap zone.
     * @returns {boolean} True if in the snap zone.
     */
    isInSnapZone(rect, zone) {
        const threshold = this.snapThreshold;
        const effectiveHeight = window.innerHeight;

        if (zone.left === 0 && zone.width === window.innerWidth / 2) return rect.left <= threshold;
        if (zone.left === window.innerWidth / 2 && zone.width === window.innerWidth / 2) return rect.right >= window.innerWidth - threshold;
        if (zone.top === 0 && zone.height === effectiveHeight / 2) return rect.top <= threshold;
        if (zone.top === effectiveHeight / 2) return rect.bottom >= window.innerHeight - threshold;

        return false;
    }

    /**
     * Snaps a window to a specific zone, adjusted for taskbar.
     * @param {object} windowObj - The window to snap.
     * @param {string} zone - The zone name.
     */
    snapWindowToZone(windowObj, zone) {
        this.isSnappingEnabled = false;

        const screenWidth = window.innerWidth;
        const effectiveHeight = window.innerHeight;

        let newLeft, newTop, newWidth, newHeight;

        switch (zone) {
            case 'left':
                newLeft = 0;
                newTop = 0;
                newWidth = Math.floor(screenWidth / 2);
                newHeight = effectiveHeight;
                break;
            case 'right':
                newLeft = Math.floor(screenWidth / 2);
                newTop = 0;
                newWidth = Math.floor(screenWidth / 2);
                newHeight = effectiveHeight;
                break;
            case 'top':
                newLeft = 0;
                newTop = 0;
                newWidth = screenWidth;
                newHeight = Math.floor(effectiveHeight / 2);
                break;
            case 'bottom':
                newLeft = 0;
                newTop = Math.floor(effectiveHeight / 2);
                newWidth = screenWidth;
                newHeight = Math.floor(effectiveHeight / 2);
                break;
            default:
                this.isSnappingEnabled = true;
                return;
        }

        if (!windowObj.originalPosition || !windowObj._isSnapped) {
            windowObj.originalPosition = {
                left: windowObj.left,
                top: windowObj.top,
                width: windowObj.width,
                height: windowObj.height
            };
        }

        windowObj.element.style.left = `${newLeft}px`;
        windowObj.element.style.top = `${newTop}px`;
        windowObj.element.style.width = `${newWidth}px`;
        windowObj.element.style.height = `${newHeight}px`;

        windowObj.left = newLeft;
        windowObj.top = newTop;
        windowObj.width = newWidth;
        windowObj.height = newHeight;
        windowObj.isMaximized = false;
        windowObj._isSnapped = true;

        setTimeout(() => {
            this.isSnappingEnabled = true;
        }, 100);
    }
}