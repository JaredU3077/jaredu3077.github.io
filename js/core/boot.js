import { AudioSystem } from './audioSystem.js';
import { BackgroundMusic } from './backgroundMusic.js';
import { ParticleSystem } from './particleSystem.js';
import { BootSequence } from './bootSequence.js';
import { ThemeManager } from './themeManager.js';

export class BootSystem {
    constructor() {
        this.audioSystem = new AudioSystem();
        this.backgroundMusic = new BackgroundMusic();
        this.particleSystem = new ParticleSystem();
        this.bootSequence = new BootSequence();
        this.themeManager = ThemeManager.getInstance();

        window.audioSystemInstance = this.audioSystem;
        window.backgroundMusicInstance = this.backgroundMusic;
        window.particleSystemInstance = this.particleSystem;
        window.bootSequenceInstance = this.bootSequence;
        window.themeManagerInstance = this.themeManager;

        this.mechvibesPlayer = null;
        this.audioPlayer = null;

        this.init();
    }

    async init() {
        try {
            this.audioSystem.init();
            this.backgroundMusic.init();
            this.particleSystem.init();

            await this.audioSystem.initMechvibes();

            this.mechvibesPlayer = this.audioSystem.mechvibesPlayer;
            this.audioPlayer = this.backgroundMusic;

            this.setupEventListeners();

            await this.bootSequence.startBootSequence();
        } catch {
            this.bootSequence.showLoginScreen();
        }
    }

    setupEventListeners() {
        const audioToggle = document.getElementById('audioToggle');
        audioToggle?.addEventListener('click', () => this.backgroundMusic.toggleBackgroundMusic());

        const guestLoginBtn = document.getElementById('guestLoginBtn');
        guestLoginBtn?.addEventListener('click', () => this.bootSequence.handleLogin());


    }

    playUIClickSound() {
        this.audioSystem?.playUIClickSound();
    }

    playWindowOpenSound() {
        this.audioSystem?.playWindowOpenSound();
    }

    playWindowCloseSound() {
        this.audioSystem?.playWindowCloseSound();
    }

    playBootSound() {
        this.audioSystem?.playBootSound();
    }

    playLoginSound() {
        this.audioSystem?.playLoginSound();
    }

    playClickSound() {
        this.audioSystem?.playClickSound();
    }

    playDesktopReadySound() {
        this.audioSystem?.playDesktopReadySound();
    }

    showLoginScreen() {
        this.bootSequence?.showLoginScreen();
    }

    skipBoot() {
        this.bootSequence?.skipBoot();
    }

    async handleLogin() {
        return this.bootSequence?.handleLogin() || Promise.resolve();
    }

    static getInstance() {
        if (!window.bootSystemInstance) {
            window.bootSystemInstance = new BootSystem();
        }
        return window.bootSystemInstance;
    }
}

const additionalStyles = `
@keyframes fadeOut {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.95); }
}

.desktop-entry {
    animation: desktopEntry 1s ease-out forwards;
}

@keyframes desktopEntry {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);