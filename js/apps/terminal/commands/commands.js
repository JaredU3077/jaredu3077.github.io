// js/apps/terminal/commands.js

import { CONFIG } from '../../../config.js';
import {
    handlePwd,
    handleCd,
    handleLs,
    handleWhoami,
    handleWho,
    handleW,
    handleDate,
    handleTime,
    handleUptime,
    handleUname,
    handleHostname,
    handleVersion,
    handleHistory,
    handleDebug
} from './core.js';
import {
    handleCat,
    handleHead,
    handleTail,
    handleMore,
    handleLess,
    handleGrep,
    handleFind,
    handleLocate,
    handleTouch,
    handleMkdir,
    handleRmdir,
    handleRm,
    handleCp,
    handleMv,
    handleLn,
    handleChmod,
    handleChown,
    handleDu,
    handleDf,
    handleStat,
    handleFile,
    handleWc,
    handleSort,
    handleUniq,
    handleCut,
    handlePaste,
    handleJoin,
    handleSplit,
    handleTr,
    handleSed,
    handleAwk
} from '../filesystem.js';
import {
    handlePing,
    handleTracert,
    handleNslookup,
    handleArp,
    handleRoute,
    handleSSH,
    handleIfconfig,
    handleIp,
    handleNetstat,
    handlePs,
    handleTop,
    handleTelnet,
    handleFtp,
    handleSftp,
    handleScp,
    handleRsync,
    handleWget,
    handleCurl,
    handleNc,
    handleIpconfig,
    handleSpeedtest,
    handleNetsh,
    handleIptables,
    handleUfw,
    handleFirewallCmd,
    handleSs,
    handleLsof,
    handleTcpdump,
    handleWireshark,
    handleNmap,
    handleHost,
    handleWhois
} from './network.js';
import {
    handleColor,
    handleBrightness,
    handleContrast,
    handleBlur,
    handleSaturation,
    handleSolarSystem,
    handleBackground,
    handleParticles,
    handleEffects
} from './effects.js';
import {
    handleShutdown,
    handleReboot,
    handleLogout,
    handleExit,
    handleSuspend,
    handleHibernate,
    handleLock,
    handleSystemControl,
    handlePerformanceControl,
    handleScreensaverControl
} from './system.js';
import {
    handleLaunch,
    listApps,
    listWindows,
    handleClose,
    handleFocus,
    handleMinimize,
    handleMaximize,
    handleRestore,
    handleDesktop,
    handleNetworkControl,
    handleDeviceControl,
    handleStatusControl,
    handleSkillsControl,
    handleProjectsControl
} from './appControl.js';
import {
    handleConfigure,
    handleInterface,
    handleVlan,
    handleOspf,
    handleBgp,
    handleEigrp,
    handleAccessList,
    handleMonitor,
    handleCiscoDebug,
    handleReload,
    handleCopy,
    handleWrite,
    handleErase,
    handleTerminal,
    handleLine,
    handleUsername,
    handleEnable,
    handleDisable,
    handleEnd,
    handleCiscoShow,
    handleNo,
    handleDo
} from './cisco.js';
import {
    handleEnv,
    handleSet,
    handleUnset,
    handleExport,
    handleEcho,
    handlePrintf,
    handleRead,
    handleSource,
    handleExec,
    handleEval,
    handleShift,
    handleGetopts,
    handleTrap,
    handleUlimit,
    handleUmask
} from './environment.js';
import { handleShow, loadResume } from '../content.js';
import { clear } from '../outputUtils.js';
import { handleThemes, handleThemeSwitch } from '../theme.js';
import { 
    testAudio, 
    playMusic, 
    pauseMusic, 
    handleStopMusic, 
    handleNextTrack, 
    handlePrevTrack, 
    handleVolume, 
    handleMute, 
    handleUnmute, 
    handleMechvibes, 
    handleMechvibesStatus, 
    handleAudioControl 
} from '../audio.js';

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
        { name: 'ping', handler: args => handlePing(args) },
        { name: 'show', handler: args => handleShow(terminal, args) },
        { name: 'clear', handler: () => clear(terminal) },
        { name: 'cls', handler: () => clear(terminal) },
        { name: 'restore-scroll', handler: () => { 
            terminal.forceScrolling(); 
            terminal.restoreScrolling(); 
            return 'Terminal scrolling restored with comprehensive settings'; 
        } },
        { name: 'tracert', handler: args => handleTracert(args) },
        { name: 'traceroute', handler: args => handleTracert(args) },
        { name: 'nslookup', handler: args => handleNslookup(args) },
        { name: 'dig', handler: args => handleNslookup(args) },
        { name: 'arp', handler: () => handleArp() },
        { name: 'route', handler: () => handleRoute() },
        { name: 'ifconfig', handler: () => handleIfconfig() },
        { name: 'ip', handler: args => handleIp(terminal, args) },
        { name: 'netstat', handler: () => handleNetstat() },
        { name: 'ps', handler: () => handlePs() },
        { name: 'top', handler: () => handleTop() },
        { name: 'ls', handler: args => handleLs(terminal, args) },
        { name: 'dir', handler: args => handleLs(terminal, args) },
        { name: 'pwd', handler: () => handlePwd(terminal) },
        { name: 'cd', handler: args => handleCd(terminal, args) },
        { name: 'whoami', handler: () => handleWhoami() },
        { name: 'who', handler: () => handleWho() },
        { name: 'w', handler: () => handleW() },
        { name: 'date', handler: () => handleDate() },
        { name: 'time', handler: () => handleTime() },
        { name: 'uptime', handler: () => handleUptime() },
        { name: 'uname', handler: args => handleUname(args) },
        { name: 'hostname', handler: () => handleHostname() },
        { name: 'themes', handler: () => handleThemes(terminal) },
        { name: 'version', handler: () => handleVersion() },
        { name: 'history', handler: () => handleHistory(terminal) },
        { name: 'alias', handler: args => terminal.handleAlias(args) },
        { name: 'unalias', handler: args => terminal.handleUnalias(args) },
        { name: 'type', handler: args => terminal.handleType(args) },
        { name: 'which', handler: args => terminal.handleWhich(args) },
        { name: 'whereis', handler: args => terminal.handleWhereis(args) },
        { name: 'man', handler: args => terminal.handleMan(args) },
        { name: 'info', handler: args => terminal.handleInfo(args) },
        { name: 'whatis', handler: args => terminal.handleWhatis(args) },
        { name: 'apropos', handler: args => terminal.handleApropos(args) },
        { name: 'debug', handler: args => handleDebug(terminal, args) }
    ];
}

function getFileSystemCommands(terminal) {
    return [
        { name: 'cat', handler: args => handleCat(terminal, args) },
        { name: 'head', handler: async args => await handleHead(args) },
        { name: 'tail', handler: async args => await handleTail(args) },
        { name: 'more', handler: args => handleMore(terminal, args) },
        { name: 'less', handler: args => handleLess(terminal, args) },
        { name: 'grep', handler: args => handleGrep(args) },
        { name: 'find', handler: args => handleFind(args) },
        { name: 'locate', handler: args => handleLocate(args) },
        { name: 'touch', handler: args => handleTouch(args) },
        { name: 'mkdir', handler: args => handleMkdir(args) },
        { name: 'rmdir', handler: args => handleRmdir(args) },
        { name: 'rm', handler: args => handleRm(args) },
        { name: 'cp', handler: args => handleCp(args) },
        { name: 'mv', handler: args => handleMv(args) },
        { name: 'ln', handler: args => handleLn(args) },
        { name: 'chmod', handler: args => handleChmod(args) },
        { name: 'chown', handler: args => handleChown(args) },
        { name: 'du', handler: args => handleDu(terminal, args) },
        { name: 'df', handler: args => handleDf() },
        { name: 'stat', handler: args => handleStat(args) },
        { name: 'file', handler: args => handleFile(args) },
        { name: 'wc', handler: args => handleWc(args) },
        { name: 'sort', handler: args => handleSort(args) },
        { name: 'uniq', handler: args => handleUniq(args) },
        { name: 'cut', handler: args => handleCut(args) },
        { name: 'paste', handler: args => handlePaste(args) },
        { name: 'join', handler: args => handleJoin(args) },
        { name: 'split', handler: args => handleSplit(args) },
        { name: 'tr', handler: args => handleTr(args) },
        { name: 'sed', handler: args => handleSed(args) },
        { name: 'awk', handler: args => handleAwk(args) }
    ];
}

function getNetworkCommands(terminal) {
    return [
        { name: 'ssh', handler: args => handleSSH(args) },
        { name: 'telnet', handler: () => handleTelnet() },
        { name: 'ftp', handler: () => handleFtp() },
        { name: 'sftp', handler: () => handleSftp() },
        { name: 'scp', handler: args => handleScp(args) },
        { name: 'rsync', handler: args => handleRsync(args) },
        { name: 'wget', handler: args => handleWget(args) },
        { name: 'curl', handler: args => handleCurl(args) },
        { name: 'nc', handler: args => handleNc(args) },
        { name: 'netcat', handler: args => handleNc(args) },
        { name: 'ipconfig', handler: () => handleIpconfig() },
        { name: 'speedtest', handler: () => handleSpeedtest() },
        { name: 'netsh', handler: args => handleNetsh(args) },
        { name: 'iptables', handler: args => handleIptables(args) },
        { name: 'ufw', handler: args => handleUfw(args) },
        { name: 'firewall-cmd', handler: args => handleFirewallCmd(args) },
        { name: 'ss', handler: args => handleSs(args) },
        { name: 'lsof', handler: args => handleLsof(args) },
        { name: 'tcpdump', handler: args => handleTcpdump(args) },
        { name: 'wireshark', handler: () => handleWireshark() },
        { name: 'nmap', handler: args => handleNmap(args) },
        { name: 'nslookup', handler: args => handleNslookup(args) },
        { name: 'host', handler: args => handleHost(args) },
        { name: 'whois', handler: args => handleWhois(args) }
    ];
}

function getResumeCommands(terminal) {
    return [
        { name: 'resume', handler: async () => await loadResume() },
        { name: 'jared', handler: async () => await loadResume() },
        { name: 'demoscene', handler: () => handleDemoscene() },
        { name: 'about', handler: async () => await loadResume() },
        { name: 'bio', handler: async () => await loadResume() },
        { name: 'test-resume', handler: async () => {
            const content = await loadResume();
            console.log('Resume content length:', content.length);
            console.log('First 200 chars:', content.substring(0, 200));
            console.log('Contains HTML tags:', /<[^>]*>/.test(content));
            console.log('Contains span tags:', content.includes('</span>'));
            console.log('Contains numbers that might be highlighted:', content.match(/\b\d+(?:\.\d+)?\b/g));
            return `Resume test complete.\nLength: ${content.length}\nContains HTML: ${/<[^>]*>/.test(content)}\nContains span tags: ${content.includes('</span>')}\nSample content: ${content.substring(0, 100)}...`;
        } }
    ];
}

function getAudioCommands(terminal) {
    return [
        { name: 'test-audio', handler: () => testAudio(terminal) },
        { name: 'play-music', handler: () => playMusic(terminal) },
        { name: 'pause-music', handler: () => pauseMusic(terminal) },
        { name: 'stop-music', handler: () => handleStopMusic() },
        { name: 'next-track', handler: () => handleNextTrack() },
        { name: 'prev-track', handler: () => handlePrevTrack() },
        { name: 'volume', handler: args => handleVolume(args) },
        { name: 'mute', handler: () => handleMute() },
        { name: 'unmute', handler: () => handleUnmute() },
        { name: 'mechvibes', handler: () => handleMechvibes(terminal) },
        { name: 'keyboard', handler: () => handleMechvibes(terminal) },
        { name: 'kb', handler: () => handleMechvibes(terminal) },
        { name: 'mechvibes-status', handler: () => handleMechvibesStatus(terminal) },
        { name: 'audio', handler: () => handleAudioControl(terminal) },
        { name: 'sound', handler: () => handleAudioControl(terminal) }
    ];
}

function getEffectsCommands(terminal) {
    return [
        { name: 'bg', handler: args => handleBackground(args) },
        { name: 'background', handler: args => handleBackground(args) },
        { name: 'particles', handler: args => handleParticles(args) },
        { name: 'fx', handler: args => handleEffects(args) },
        { name: 'effects', handler: args => handleEffects(args) },
        { name: 'theme', handler: args => handleThemeSwitch(terminal, args) },
        { name: 'color', handler: args => handleColor(args) },
        { name: 'brightness', handler: args => handleBrightness(args) },
        { name: 'contrast', handler: args => handleContrast(args) },
        { name: 'blur', handler: args => handleBlur(args) },
        { name: 'saturation', handler: args => handleSaturation(args) },
        { name: 'solar', handler: args => handleSolarSystem(args) },
        { name: 'planets', handler: args => handleSolarSystem(args) },
        { name: 'sun', handler: args => handleSolarSystem(args) }
    ];
}

function getAppControlCommands(terminal) {
    return [
        { name: 'launch', handler: args => handleLaunch(args) },
        { name: 'open', handler: args => handleLaunch(args) },
        { name: 'start', handler: args => handleLaunch(args) },
        { name: 'run', handler: args => handleLaunch(args) },
        { name: 'exec', handler: args => handleLaunch(args) },
        { name: 'apps', handler: () => listApps() },
        { name: 'applications', handler: () => listApps() },
        { name: 'windows', handler: () => listWindows() },
        { name: 'close', handler: args => handleClose(args) },
        { name: 'kill', handler: args => handleClose(args) },
        { name: 'focus', handler: args => handleFocus(args) },
        { name: 'bring-to-front', handler: args => handleFocus(args) },
        { name: 'minimize', handler: args => handleMinimize(args) },
        { name: 'maximize', handler: args => handleMaximize(args) },
        { name: 'restore', handler: args => handleRestore(args) },
        { name: 'desktop', handler: () => handleDesktop() },
        { name: 'network', handler: () => handleNetworkControl() },
        { name: 'devices', handler: () => handleDeviceControl() },
        { name: 'status', handler: () => handleStatusControl() },
        { name: 'skills', handler: () => handleSkillsControl() },
        { name: 'projects', handler: () => handleProjectsControl() }
    ];
}

function getSystemControlCommands(terminal) {
    return [
        { name: 'system', handler: () => handleSystemControl() },
        { name: 'sys', handler: () => handleSystemControl() },
        { name: 'performance', handler: args => handlePerformanceControl(args) },
        { name: 'perf', handler: args => handlePerformanceControl(args) },
        { name: 'screensaver', handler: () => handleScreensaverControl() },
        { name: 'ss', handler: () => handleScreensaverControl() },
        { name: 'shutdown', handler: () => handleShutdown() },
        { name: 'reboot', handler: () => handleReboot() },
        { name: 'restart', handler: () => handleReboot() },
        { name: 'logout', handler: () => handleLogout() },
        { name: 'exit', handler: () => handleExit() },
        { name: 'quit', handler: () => handleExit() },
        { name: 'suspend', handler: () => handleSuspend() },
        { name: 'hibernate', handler: () => handleHibernate() },
        { name: 'lock', handler: () => handleLock() },
        { name: 'sleep', handler: () => handleSuspend() }
    ];
}

function getCiscoCommands(terminal) {
    return [
        { name: 'configure', handler: () => handleConfigure() },
        { name: 'conf', handler: () => handleConfigure() },
        { name: 'interface', handler: () => handleInterface() },
        { name: 'int', handler: () => handleInterface() },
        { name: 'vlan', handler: () => handleVlan() },
        { name: 'ospf', handler: () => handleOspf() },
        { name: 'bgp', handler: () => handleBgp() },
        { name: 'eigrp', handler: () => handleEigrp() },
        { name: 'access-list', handler: () => handleAccessList() },
        { name: 'acl', handler: () => handleAccessList() },
        { name: 'logging', handler: () => terminal.handleLogging() },
        { name: 'monitor', handler: () => handleMonitor() },
        { name: 'debug', handler: () => handleCiscoDebug() },
        { name: 'reload', handler: () => handleReload() },
        { name: 'copy', handler: () => handleCopy() },
        { name: 'write', handler: () => handleWrite() },
        { name: 'erase', handler: () => handleErase() },
        { name: 'terminal', handler: () => handleTerminal() },
        { name: 'line', handler: () => handleLine() },
        { name: 'username', handler: () => handleUsername() },
        { name: 'enable', handler: () => handleEnable() },
        { name: 'disable', handler: () => handleDisable() },
        { name: 'end', handler: () => handleEnd() },
        { name: 'sh', handler: args => handleCiscoShow(args) },
        { name: 'no', handler: args => handleNo(args) },
        { name: 'do', handler: args => handleDo(args) }
    ];
}

function getEnvironmentCommands(terminal) {
    return [
        { name: 'env', handler: () => handleEnv(terminal) },
        { name: 'environment', handler: () => handleEnv(terminal) },
        { name: 'set', handler: args => handleSet(terminal, args) },
        { name: 'unset', handler: args => handleUnset(terminal, args) },
        { name: 'export', handler: args => handleExport(terminal, args) },
        { name: 'echo', handler: args => handleEcho(args) },
        { name: 'print', handler: args => handleEcho(args) },
        { name: 'printf', handler: args => handlePrintf(args) },
        { name: 'read', handler: args => handleRead(args) },
        { name: 'source', handler: args => handleSource(args) },
        { name: '.', handler: args => handleSource(args) },
        { name: 'exec', handler: args => handleExec(args) },
        { name: 'eval', handler: args => handleEval(args) },
        { name: 'shift', handler: args => handleShift(args) },
        { name: 'getopts', handler: args => handleGetopts(args) },
        { name: 'trap', handler: args => handleTrap(args) },
        { name: 'ulimit', handler: args => handleUlimit(args) },
        { name: 'umask', handler: args => handleUmask(args) }
    ];
}