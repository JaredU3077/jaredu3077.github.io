import { CONFIG } from '../config.js';

export function registerCommands(commands, terminal) {
    const commandGroups = [
        getCoreCommands(terminal),
        getFileSystemCommands(terminal),
        getNetworkCommands(terminal),
        getResumeCommands(terminal),
        getAudioCommands(terminal),
        getEffectsCommands(terminal),
        getAppControlCommands(terminal),
        getSystemControlCommands(terminal),
        getCiscoCommands(terminal),
        getEnvironmentCommands(terminal)
    ];

    commandGroups.flat().forEach(({ name, handler }) => commands.set(name, handler));
}

function getCoreCommands(terminal) {
    return [
        { name: 'help', handler: () => terminal.showHelp() },
        { name: 'ping', handler: args => terminal.handlePing(args) },
        { name: 'show', handler: args => terminal.handleShow(args) },
        { name: 'clear', handler: () => terminal.clear() },
        { name: 'cls', handler: () => terminal.clear() },
        { name: 'tracert', handler: args => terminal.handleTracert(args) },
        { name: 'traceroute', handler: args => terminal.handleTracert(args) },
        { name: 'nslookup', handler: args => terminal.handleNslookup(args) },
        { name: 'dig', handler: args => terminal.handleNslookup(args) },
        { name: 'arp', handler: () => terminal.handleArp() },
        { name: 'route', handler: () => terminal.handleRoute() },
        { name: 'ifconfig', handler: () => terminal.handleIfconfig() },
        { name: 'ip', handler: args => terminal.handleIp(args) },
        { name: 'netstat', handler: () => terminal.handleNetstat() },
        { name: 'ps', handler: () => terminal.handlePs() },
        { name: 'top', handler: () => terminal.handleTop() },
        { name: 'ls', handler: args => terminal.handleLs(args) },
        { name: 'dir', handler: args => terminal.handleLs(args) },
        { name: 'pwd', handler: () => terminal.handlePwd() },
        { name: 'cd', handler: args => terminal.handleCd(args) },
        { name: 'whoami', handler: () => terminal.handleWhoami() },
        { name: 'who', handler: () => terminal.handleWho() },
        { name: 'w', handler: () => terminal.handleW() },
        { name: 'date', handler: () => terminal.handleDate() },
        { name: 'time', handler: () => terminal.handleTime() },
        { name: 'uptime', handler: () => terminal.handleUptime() },
        { name: 'uname', handler: args => terminal.handleUname(args) },
        { name: 'hostname', handler: () => terminal.handleHostname() },
        { name: 'themes', handler: () => terminal.handleThemes() },
        { name: 'version', handler: () => terminal.handleVersion() },
        { name: 'history', handler: () => terminal.handleHistory() },
        { name: 'alias', handler: args => terminal.handleAlias(args) },
        { name: 'unalias', handler: args => terminal.handleUnalias(args) },
        { name: 'type', handler: args => terminal.handleType(args) },
        { name: 'which', handler: args => terminal.handleWhich(args) },
        { name: 'whereis', handler: args => terminal.handleWhereis(args) },
        { name: 'man', handler: args => terminal.handleMan(args) },
        { name: 'info', handler: args => terminal.handleInfo(args) },
        { name: 'whatis', handler: args => terminal.handleWhatis(args) },
        { name: 'apropos', handler: args => terminal.handleApropos(args) }
    ];
}

function getFileSystemCommands(terminal) {
    return [
        { name: 'cat', handler: args => terminal.handleCat(args) },
        { name: 'head', handler: args => terminal.handleHead(args) },
        { name: 'tail', handler: args => terminal.handleTail(args) },
        { name: 'more', handler: args => terminal.handleMore(args) },
        { name: 'less', handler: args => terminal.handleLess(args) },
        { name: 'grep', handler: args => terminal.handleGrep(args) },
        { name: 'find', handler: args => terminal.handleFind(args) },
        { name: 'locate', handler: args => terminal.handleLocate(args) },
        { name: 'touch', handler: args => terminal.handleTouch(args) },
        { name: 'mkdir', handler: args => terminal.handleMkdir(args) },
        { name: 'rmdir', handler: args => terminal.handleRmdir(args) },
        { name: 'rm', handler: args => terminal.handleRm(args) },
        { name: 'cp', handler: args => terminal.handleCp(args) },
        { name: 'mv', handler: args => terminal.handleMv(args) },
        { name: 'ln', handler: args => terminal.handleLn(args) },
        { name: 'chmod', handler: args => terminal.handleChmod(args) },
        { name: 'chown', handler: args => terminal.handleChown(args) },
        { name: 'du', handler: args => terminal.handleDu(args) },
        { name: 'df', handler: args => terminal.handleDf(args) },
        { name: 'stat', handler: args => terminal.handleStat(args) },
        { name: 'file', handler: args => terminal.handleFile(args) },
        { name: 'wc', handler: args => terminal.handleWc(args) },
        { name: 'sort', handler: args => terminal.handleSort(args) },
        { name: 'uniq', handler: args => terminal.handleUniq(args) },
        { name: 'cut', handler: args => terminal.handleCut(args) },
        { name: 'paste', handler: args => terminal.handlePaste(args) },
        { name: 'join', handler: args => terminal.handleJoin(args) },
        { name: 'split', handler: args => terminal.handleSplit(args) },
        { name: 'tr', handler: args => terminal.handleTr(args) },
        { name: 'sed', handler: args => terminal.handleSed(args) },
        { name: 'awk', handler: args => terminal.handleAwk(args) }
    ];
}

function getNetworkCommands(terminal) {
    return [
        { name: 'ssh', handler: args => terminal.handleSSH(args) },
        { name: 'telnet', handler: () => terminal.handleTelnet() },
        { name: 'ftp', handler: () => terminal.handleFtp() },
        { name: 'sftp', handler: () => terminal.handleSftp() },
        { name: 'scp', handler: args => terminal.handleScp(args) },
        { name: 'rsync', handler: args => terminal.handleRsync(args) },
        { name: 'wget', handler: args => terminal.handleWget(args) },
        { name: 'curl', handler: args => terminal.handleCurl(args) },
        { name: 'nc', handler: args => terminal.handleNc(args) },
        { name: 'netcat', handler: args => terminal.handleNc(args) },
        { name: 'ipconfig', handler: () => terminal.handleIpconfig() },
        { name: 'speedtest', handler: () => terminal.handleSpeedtest() },
        { name: 'netsh', handler: args => terminal.handleNetsh(args) },
        { name: 'iptables', handler: args => terminal.handleIptables(args) },
        { name: 'ufw', handler: args => terminal.handleUfw(args) },
        { name: 'firewall-cmd', handler: args => terminal.handleFirewallCmd(args) },
        { name: 'ss', handler: args => terminal.handleSs(args) },
        { name: 'lsof', handler: args => terminal.handleLsof(args) },
        { name: 'tcpdump', handler: args => terminal.handleTcpdump(args) },
        { name: 'wireshark', handler: () => terminal.handleWireshark() },
        { name: 'nmap', handler: args => terminal.handleNmap(args) },
        { name: 'nslookup', handler: args => terminal.handleNslookup(args) },
        { name: 'host', handler: args => terminal.handleHost(args) },
        { name: 'whois', handler: args => terminal.handleWhois(args) }
    ];
}

function getResumeCommands(terminal) {
    return [
        { name: 'resume', handler: async () => await terminal.loadResume() },
        { name: 'jared', handler: async () => await terminal.loadResume() },
        { name: 'demoscene', handler: () => terminal.handleDemoscene() },
        { name: 'about', handler: async () => await terminal.loadResume() },
        { name: 'bio', handler: async () => await terminal.loadResume() }
    ];
}

function getAudioCommands(terminal) {
    return [
        { name: 'test-audio', handler: () => terminal.testAudio() },
        { name: 'play-music', handler: () => terminal.playMusic() },
        { name: 'pause-music', handler: () => terminal.pauseMusic() },
        { name: 'stop-music', handler: () => terminal.stopMusic() },
        { name: 'next-track', handler: () => terminal.nextTrack() },
        { name: 'prev-track', handler: () => terminal.prevTrack() },
        { name: 'volume', handler: args => terminal.handleVolume(args) },
        { name: 'mute', handler: () => terminal.handleMute() },
        { name: 'unmute', handler: () => terminal.handleUnmute() },
        { name: 'mechvibes', handler: () => terminal.handleMechvibes() },
        { name: 'keyboard', handler: () => terminal.handleMechvibes() },
        { name: 'kb', handler: () => terminal.handleMechvibes() },
        { name: 'mechvibes-status', handler: () => terminal.handleMechvibesStatus() },
        { name: 'audio', handler: () => terminal.handleAudioControl() },
        { name: 'sound', handler: () => terminal.handleAudioControl() }
    ];
}

function getEffectsCommands(terminal) {
    return [
        { name: 'bg', handler: args => terminal.handleBackground(args) },
        { name: 'background', handler: args => terminal.handleBackground(args) },
        { name: 'particles', handler: args => terminal.handleParticles(args) },
        { name: 'fx', handler: args => terminal.handleEffects(args) },
        { name: 'effects', handler: args => terminal.handleEffects(args) },
        { name: 'theme', handler: args => terminal.handleThemeSwitch(args) },
        { name: 'color', handler: args => terminal.handleColor(args) },
        { name: 'brightness', handler: args => terminal.handleBrightness(args) },
        { name: 'contrast', handler: args => terminal.handleContrast(args) },
        { name: 'blur', handler: args => terminal.handleBlur(args) },
        { name: 'saturation', handler: args => terminal.handleSaturation(args) },

    ];
}

function getAppControlCommands(terminal) {
    return [
        { name: 'launch', handler: args => terminal.handleLaunch(args) },
        { name: 'open', handler: args => terminal.handleLaunch(args) },
        { name: 'start', handler: args => terminal.handleLaunch(args) },
        { name: 'run', handler: args => terminal.handleLaunch(args) },
        { name: 'exec', handler: args => terminal.handleLaunch(args) },
        { name: 'apps', handler: () => terminal.listApps() },
        { name: 'applications', handler: () => terminal.listApps() },
        { name: 'windows', handler: () => terminal.listWindows() },
        { name: 'close', handler: args => terminal.handleClose(args) },
        { name: 'kill', handler: args => terminal.handleClose(args) },
        { name: 'focus', handler: args => terminal.handleFocus(args) },
        { name: 'bring-to-front', handler: args => terminal.handleFocus(args) },
        { name: 'minimize', handler: args => terminal.handleMinimize(args) },
        { name: 'maximize', handler: args => terminal.handleMaximize(args) },
        { name: 'restore', handler: args => terminal.handleRestore(args) },
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
        { name: 'sys', handler: () => terminal.handleSystemControl() },
        { name: 'performance', handler: () => terminal.handlePerformanceControl() },
        { name: 'perf', handler: () => terminal.handlePerformanceControl() },
        { name: 'screensaver', handler: () => terminal.handleScreensaverControl() },
        { name: 'ss', handler: () => terminal.handleScreensaverControl() },
        { name: 'shutdown', handler: () => terminal.handleShutdown() },
        { name: 'reboot', handler: () => terminal.handleReboot() },
        { name: 'restart', handler: () => terminal.handleReboot() },
        { name: 'logout', handler: () => terminal.handleLogout() },
        { name: 'exit', handler: () => terminal.handleExit() },
        { name: 'quit', handler: () => terminal.handleExit() },
        { name: 'suspend', handler: () => terminal.handleSuspend() },
        { name: 'hibernate', handler: () => terminal.handleHibernate() },
        { name: 'lock', handler: () => terminal.handleLock() },
        { name: 'sleep', handler: () => terminal.handleSuspend() }
    ];
}

function getCiscoCommands(terminal) {
    return [
        { name: 'configure', handler: () => terminal.handleConfigure() },
        { name: 'conf', handler: () => terminal.handleConfigure() },
        { name: 'interface', handler: () => terminal.handleInterface() },
        { name: 'int', handler: () => terminal.handleInterface() },
        { name: 'vlan', handler: () => terminal.handleVlan() },
        { name: 'ospf', handler: () => terminal.handleOspf() },
        { name: 'bgp', handler: () => terminal.handleBgp() },
        { name: 'eigrp', handler: () => terminal.handleEigrp() },
        { name: 'access-list', handler: () => terminal.handleAccessList() },
        { name: 'acl', handler: () => terminal.handleAccessList() },
        { name: 'logging', handler: () => terminal.handleLogging() },
        { name: 'monitor', handler: () => terminal.handleMonitor() },
        { name: 'debug', handler: () => terminal.handleDebug() },
        { name: 'reload', handler: () => terminal.handleReload() },
        { name: 'copy', handler: () => terminal.handleCopy() },
        { name: 'write', handler: () => terminal.handleWrite() },
        { name: 'erase', handler: () => terminal.handleErase() },
        { name: 'terminal', handler: () => terminal.handleTerminal() },
        { name: 'line', handler: () => terminal.handleLine() },
        { name: 'username', handler: () => terminal.handleUsername() },
        { name: 'enable', handler: () => terminal.handleEnable() },
        { name: 'disable', handler: () => terminal.handleDisable() },
        { name: 'end', handler: () => terminal.handleEnd() },
        { name: 'show', handler: args => terminal.handleCiscoShow(args) },
        { name: 'sh', handler: args => terminal.handleCiscoShow(args) },
        { name: 'no', handler: args => terminal.handleNo(args) },
        { name: 'do', handler: args => terminal.handleDo(args) }
    ];
}

function getEnvironmentCommands(terminal) {
    return [
        { name: 'env', handler: () => terminal.handleEnv() },
        { name: 'environment', handler: () => terminal.handleEnv() },
        { name: 'set', handler: args => terminal.handleSet(args) },
        { name: 'unset', handler: args => terminal.handleUnset(args) },
        { name: 'export', handler: args => terminal.handleExport(args) },
        { name: 'echo', handler: args => terminal.handleEcho(args) },
        { name: 'print', handler: args => terminal.handleEcho(args) },
        { name: 'printf', handler: args => terminal.handlePrintf(args) },
        { name: 'read', handler: args => terminal.handleRead(args) },
        { name: 'source', handler: args => terminal.handleSource(args) },
        { name: '.', handler: args => terminal.handleSource(args) },
        { name: 'exec', handler: args => terminal.handleExec(args) },
        { name: 'eval', handler: args => terminal.handleEval(args) },
        { name: 'shift', handler: args => terminal.handleShift(args) },
        { name: 'getopts', handler: args => terminal.handleGetopts(args) },
        { name: 'trap', handler: args => terminal.handleTrap(args) },
        { name: 'ulimit', handler: args => terminal.handleUlimit(args) },
        { name: 'umask', handler: args => terminal.handleUmask(args) }
    ];
}