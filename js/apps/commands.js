import { CONFIG } from '../config.js';

export function registerCommands(commands, terminal) {
    const commandGroups = [
        getCoreCommands(terminal),
        getNetworkCommands(terminal),
        getResumeCommands(terminal),
        getAudioCommands(terminal),
        getEffectsCommands(terminal),
        getAppControlCommands(terminal),
        getSystemControlCommands(terminal),
        getCiscoCommands(terminal)
    ];

    commandGroups.flat().forEach(({ name, handler }) => commands.set(name, handler));
}

function getCoreCommands(terminal) {
    return [
        { name: 'help', handler: () => terminal.showHelp() },
        { name: 'ping', handler: args => terminal.handlePing(args) },
        { name: 'show', handler: args => terminal.handleShow(args) },
        { name: 'clear', handler: () => terminal.clear() },
        { name: 'tracert', handler: args => terminal.handleTracert(args) },
        { name: 'traceroute', handler: args => terminal.handleTracert(args) },
        { name: 'nslookup', handler: args => terminal.handleNslookup(args) },
        { name: 'dig', handler: args => terminal.handleNslookup(args) },
        { name: 'arp', handler: () => terminal.handleArp() },
        { name: 'route', handler: () => terminal.handleRoute() },
        { name: 'ifconfig', handler: () => CONFIG.COMMANDS.IFCONFIG },
        { name: 'netstat', handler: () => CONFIG.COMMANDS.NETSTAT },
        { name: 'ls', handler: () => 'resume.txt  codex.txt  network-configs/  scripts/' },
        { name: 'pwd', handler: () => '/home/jared' },
        { name: 'whoami', handler: () => 'jared - Senior Network Engineer' },
        { name: 'date', handler: () => new Date().toString() },
        { name: 'uptime', handler: () => 'System uptime: 15+ years in networking' }
    ];
}

function getNetworkCommands(terminal) {
    return [
        { name: 'ssh', handler: args => terminal.handleSSH(args) },
        { name: 'telnet', handler: () => 'Telnet is disabled for security. Use SSH instead.' },
        { name: 'ipconfig', handler: () => 'IP Configuration:\nEthernet adapter Ethernet:\nIPv4 Address: 192.168.1.100\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1' },
        { name: 'speedtest', handler: () => 'Speedtest results:\nDownload: 100 Mbps\nUpload: 50 Mbps\nPing: 10 ms' },
        { name: 'netsh', handler: args => `Netsh command executed: ${args.join(' ')}` }
    ];
}

function getResumeCommands(terminal) {
    return [
        { name: 'resume', handler: async () => await terminal.loadResume() },
        { name: 'jared', handler: async () => await terminal.loadResume() },
        { name: 'demoscene', handler: () => terminal.handleDemoscene() }
    ];
}

function getAudioCommands(terminal) {
    return [
        { name: 'test-audio', handler: () => terminal.testAudio() },
        { name: 'play-music', handler: () => terminal.playMusic() },
        { name: 'pause-music', handler: () => terminal.pauseMusic() },
        { name: 'mechvibes', handler: () => terminal.handleMechvibes() },
        { name: 'keyboard', handler: () => terminal.handleMechvibes() },
        { name: 'kb', handler: () => terminal.handleMechvibes() },
        { name: 'mechvibes-status', handler: () => terminal.handleMechvibesStatus() },
        { name: 'audio', handler: () => terminal.handleAudioControl() }
    ];
}

function getEffectsCommands(terminal) {
    return [
        { name: 'bg', handler: args => terminal.handleBackground(args) },
        { name: 'particles', handler: args => terminal.handleParticles(args) },
        { name: 'fx', handler: args => terminal.handleEffects(args) }
    ];
}

function getAppControlCommands(terminal) {
    return [
        { name: 'launch', handler: args => terminal.handleLaunch(args) },
        { name: 'open', handler: args => terminal.handleLaunch(args) },
        { name: 'start', handler: args => terminal.handleLaunch(args) },
        { name: 'apps', handler: () => terminal.listApps() },
        { name: 'windows', handler: () => terminal.listWindows() },
        { name: 'close', handler: args => terminal.handleClose(args) },
        { name: 'focus', handler: args => terminal.handleFocus(args) },
        { name: 'desktop', handler: () => terminal.handleDesktop() },
        { name: 'network', handler: () => terminal.handleNetworkControl() },
        { name: 'devices', handler: () => terminal.handleDeviceControl() },
        { name: 'status', handler: () => terminal.handleStatusControl() },
        { name: 'skills', handler: () => terminal.handleSkillsControl() },
        { name: 'projects', handler: () => terminal.handleProjectsControl() }
    ];
}

function getSystemControlCommands(terminal) {
    return [
        { name: 'system', handler: () => terminal.handleSystemControl() },
        { name: 'theme', handler: args => terminal.handleThemeControl(args) },
        { name: 'performance', handler: () => terminal.handlePerformanceControl() },
        { name: 'screensaver', handler: () => terminal.handleScreensaverControl() },
        { name: 'ss', handler: () => terminal.handleScreensaverControl() }
    ];
}

function getCiscoCommands(terminal) {
    return [
        { name: 'configure', handler: () => 'Entering configuration mode...\nType "exit" to return to privileged EXEC mode.' },
        { name: 'interface', handler: () => 'Interface configuration not available in demo mode.' },
        { name: 'vlan', handler: () => 'VLAN configuration not available in demo mode.' },
        { name: 'ospf', handler: () => 'OSPF configuration not available in demo mode.' },
        { name: 'bgp', handler: () => 'BGP configuration not available in demo mode.' },
        { name: 'eigrp', handler: () => 'EIGRP configuration not available in demo mode.' },
        { name: 'access-list', handler: () => 'Access list configuration not available in demo mode.' },
        { name: 'logging', handler: () => terminal.handleLogging() },
        { name: 'monitor', handler: () => 'Monitoring not available in demo mode.' },
        { name: 'debug', handler: () => 'Debug mode not available in demo mode.' },
        { name: 'reload', handler: () => 'Reload not available in demo mode.' },
        { name: 'copy', handler: () => 'Copy command not available in demo mode.' },
        { name: 'write', handler: () => 'Write command not available in demo mode.' },
        { name: 'erase', handler: () => 'Erase command not available in demo mode.' },
        { name: 'terminal', handler: () => 'Terminal configuration not available in demo mode.' },
        { name: 'line', handler: () => 'Line configuration not available in demo mode.' },
        { name: 'username', handler: () => 'Username configuration not available in demo mode.' },
        { name: 'enable', handler: () => 'Already in privileged EXEC mode.' },
        { name: 'disable', handler: () => 'Disabling privileged mode...\nType "enable" to return to privileged EXEC mode.' },
        { name: 'exit', handler: () => 'Exiting...' },
        { name: 'end', handler: () => 'Exiting configuration mode...' }
    ];
}