// js/apps/terminal/audio.js

export function handleMechvibes(terminal) {
    const mechvibesPlayer = window.bootSystemInstance?.mechvibesPlayer;
    if (!mechvibesPlayer) {
        return '❌ Mechvibes not available';
    }

    const isEnabled = mechvibesPlayer.toggle();
    const status = isEnabled ? 'enabled' : 'disabled';
    return `🎹 Mechvibes ${status}`;
}

export function handleMechvibesStatus(terminal) {
    const mechvibesPlayer = window.bootSystemInstance?.mechvibesPlayer;
    if (!mechvibesPlayer) {
        return '❌ Mechvibes not available';
    }

    return mechvibesPlayer.getStatus();
}

export function testAudio(terminal) {
    const audioSystem = window.bootSystemInstance?.audioSystem;
    if (!audioSystem) {
        return '❌ Audio system not available';
    }

    // Test typing sound
    audioSystem.playTypingSound('a');
    return '🔊 Audio test completed - you should hear a typing sound';
}

export function playMusic(terminal) {
    const backgroundMusic = window.bootSystemInstance?.backgroundMusic;
    if (!backgroundMusic) {
        return '❌ Background music not available';
    }

    backgroundMusic.playBackgroundMusic();
    return '🎵 Background music started';
}

export function pauseMusic(terminal) {
    const backgroundMusic = window.bootSystemInstance?.backgroundMusic;
    if (!backgroundMusic) {
        return '❌ Background music not available';
    }

    backgroundMusic.pauseBackgroundMusic();
    return '⏸️ Background music paused';
}

export function handleAudioControl(terminal) {
    const audioSystem = window.bootSystemInstance?.audioSystem;
    if (!audioSystem) {
        return '❌ Audio system not available';
    }

    const isEnabled = audioSystem.toggleAudio();
    const status = isEnabled ? 'enabled' : 'disabled';
    return `🔊 Audio system ${status}`;
}

export function handleStopMusic() {
    return 'Music stopped';
}

export function handleNextTrack() {
    return 'Next track';
}

export function handlePrevTrack() {
    return 'Previous track';
}

export function handleVolume(args) {
    const [level] = args;
    if (!level) {
        return 'Current volume: 50%';
    }
    return `Volume set to ${level}%`;
}

export function handleMute() {
    return 'Audio muted';
}

export function handleUnmute() {
    return 'Audio unmuted';
}