/**
 * Mechvibes Integration for neuOS Terminal
 * Credits: @https://github.com/hainguyents13/mechvibes/
 * 
 * This module integrates Mechvibes sound packs into the neuOS terminal
 * for realistic mechanical keyboard typing sounds.
 */

export class MechvibesPlayer {
    constructor() {
        this.currentPack = null;
        this.isEnabled = true;
        this.volume = 50; // Default volume at 50%
        this.loadAttempted = false;
    }

    /**
     * Initialize the Mechvibes player
     * @param {AudioContext} audioContext - The Web Audio context (not used with Howler.js)
     */
    async init(audioContext) {
        // Howler.js handles its own audio context, so we don't need the passed one
        await this.loadPack('./');
    }

    /**
     * Load the Mechvibes sound pack using the original approach
     */
    async loadPack(folder) {
        if (this.loadAttempted) return;
        this.loadAttempted = true;
        
        try {
            // Load the sound configuration
            const configResponse = await fetch(folder + 'config.json');
            if (!configResponse.ok) {
                throw new Error(`Failed to load config.json: ${configResponse.status}`);
            }
            
            const packData = await configResponse.json();
            
            if (typeof packData === 'object') {
                const sound = packData.sound || 'sound.ogg';  // Fallback to sound.ogg
                const keyDefineType = packData.key_define_type || 'single';
                const defines = packData.defines;

                if (keyDefineType === 'single') {
                    const soundPath = folder + sound;
                    
                    // Create Howler sound with sprite definitions
                    const soundData = new Howl({ 
                        src: [soundPath], 
                        sprite: defines,
                        html5: false, // Use Web Audio API for better performance
                        preload: true
                    });
                    
                    // Wait for the sound to load
                    await new Promise((resolve, reject) => {
                        soundData.once('load', () => {
                            Object.assign(packData, { sound: soundData });
                            this.currentPack = packData;
                            resolve();
                        });
                        
                        soundData.once('loaderror', (id, error) => {
                            console.error('🎹 Failed to load sound file:', error);
                            reject(error);
                        });
                    });
                    
        
                } else {
                    throw new Error('This implementation assumes a single-file pack');
                }
            } else {
                throw new Error('Failed to load config.json');
            }
        } catch (error) {
            console.error('Failed to load Mechvibes sound pack:', error);
            this.currentPack = null;
            
            // Try alternative paths
            await this.tryAlternativePaths();
        }
    }

    /**
     * Try alternative file paths if the primary paths fail
     */
    async tryAlternativePaths() {
        const alternativePaths = ['', './', '../', '../../'];

        for (const path of alternativePaths) {
            try {

                await this.loadPack(path);
                if (this.currentPack) {
                    
                    return;
                }
            } catch (error) {
                console.warn(`Alternative path failed:`, error);
            }
        }
        
        console.error('🎹 All Mechvibes file paths failed');
    }

    /**
     * Play a key sound using the original Mechvibes approach
     * @param {string} key - The key that was pressed
     */
    async playKeySound(key) {
        if (!this.currentPack || !this.isEnabled) {
            return;
        }

        try {
            // Convert key to keyCode for the original Mechvibes approach
            const keyCode = this.getKeyCode(key);
            const soundId = `${keyCode}`;
            
            if (this.currentPack && this.currentPack.sound) {
                this.playSound(soundId, this.volume);
            }
        } catch (error) {
            console.warn('Mechvibes sound playback failed:', error);
        }
    }

    /**
     * Get keyCode for a given key (following original Mechvibes approach)
     * @param {string} key - The key name
     * @returns {number} The keyCode
     */
    getKeyCode(key) {
        // Map common keys to their keyCodes
        const keyCodeMap = {
            'a': 65, 'b': 66, 'c': 67, 'd': 68, 'e': 69,
            'f': 70, 'g': 71, 'h': 72, 'i': 73, 'j': 74,
            'k': 75, 'l': 76, 'm': 77, 'n': 78, 'o': 79,
            'p': 80, 'q': 81, 'r': 82, 's': 83, 't': 84,
            'u': 85, 'v': 86, 'w': 87, 'x': 88, 'y': 89,
            'z': 90, ' ': 32, 'enter': 13, 'backspace': 8,
            '1': 49, '2': 50, '3': 51, '4': 52, '5': 53,
            '6': 54, '7': 55, '8': 56, '9': 57, '0': 48,
            'shift': 16, 'ctrl': 17, 'alt': 18, 'tab': 9,
            'escape': 27, 'delete': 46, 'home': 36, 'end': 35, 'pageup': 33,
            'ArrowUp': 38, 'ArrowDown': 40, 'ArrowLeft': 37, 'ArrowRight': 39
        };
        
        return keyCodeMap[key.toLowerCase()] || key.charCodeAt(0);
    }

    /**
     * Play sound using the original Mechvibes approach
     * @param {string} soundId - The sound ID (keyCode as string)
     * @param {number} volume - Volume level (0-100)
     */
    playSound(soundId, volume) {
        if (!this.currentPack) return;
        
        const playType = this.currentPack.key_define_type || 'single';
        const sound = this.currentPack.sound;
        
        if (!sound) return;
        
        sound.volume(Number(volume / 100));
        
        if (playType === 'single') {
            sound.play(soundId);
        }
    }

    /**
     * Enable or disable Mechvibes sounds
     * @param {boolean} enabled - Whether to enable sounds
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;

    }

    /**
     * Toggle Mechvibes sounds on/off
     * @returns {boolean} Current enabled state
     */
    toggle() {
        this.isEnabled = !this.isEnabled;

        return this.isEnabled;
    }

    /**
     * Set the volume for Mechvibes sounds
     * @param {number} volume - Volume level (0 to 100)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(100, volume));

    }

    /**
     * Get the current sound pack info
     * @returns {Object|null} Sound pack information
     */
    getSoundPackInfo() {
        if (!this.currentPack) return null;
        
        return {
            name: this.currentPack.name,
            id: this.currentPack.id,
            isLoaded: !!this.currentPack,
            isEnabled: this.isEnabled,
            volume: this.volume,
            availableSounds: this.currentPack.defines ? Object.keys(this.currentPack.defines).length : 0
        };
    }

    /**
     * Get the status of mechvibes for debugging
     * @returns {string} Status message
     */
    getStatus() {
        const status = {
            isLoaded: !!this.currentPack,
            isEnabled: this.isEnabled,
            volume: this.volume,
            packName: this.currentPack?.name || 'None',
            availableSounds: this.currentPack?.defines ? Object.keys(this.currentPack.defines).length : 0
        };
        

        return `Mechvibes Status: Loaded=${status.isLoaded}, Enabled=${status.isEnabled}, Volume=${status.volume}, Pack=${status.packName}, Sounds=${status.availableSounds}`;
    }

    /**
     * Test if Mechvibes is working properly
     * @returns {string} Test result message
     */
    async test() {

        
        if (!this.currentPack) {
            return '❌ Sound pack not loaded';
        }
        if (!this.isEnabled) {
            return '❌ Mechvibes is disabled';
        }
        
        // Play a test sound
        await this.playKeySound('a');
        return '✅ Mechvibes is working properly';
    }

    /**
     * Force test with synthesized sound
     * @returns {string} Test result message
     */
    async forceTest() {
        
        
        // Create a simple test tone using Howler
        const testSound = new Howl({
            src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'],
            volume: 0.3
        });
        
        testSound.play();
        
        return '✅ Force test completed - you should hear a 200ms tone';
    }

    /**
     * Test audio context directly
     * @returns {string} Test result message
     */
    async testAudioContext() {
        
        
        if (!Howler.ctx) {
            return '❌ No audio context available';
        }
        
        
        
        // Create a simple beep using Howler
        const testSound = new Howl({
            src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'],
            volume: 0.5
        });
        
        testSound.play();
        
        
        return '✅ Audio context test completed';
    }
}

// Export a singleton instance
export const mechvibesPlayer = new MechvibesPlayer(); 