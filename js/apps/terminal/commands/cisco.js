// js/apps/terminal/commands/cisco.js

export function handleConfigure() {
    return 'Entering configuration mode...\nType "exit" to return to privileged EXEC mode.';
}

export function handleInterface() {
    return 'Interface configuration not available in demo mode.';
}

export function handleVlan() {
    return 'VLAN configuration not available in demo mode.';
}

export function handleOspf() {
    return 'OSPF configuration not available in demo mode.';
}

export function handleBgp() {
    return 'BGP configuration not available in demo mode.';
}

export function handleEigrp() {
    return 'EIGRP configuration not available in demo mode.';
}

export function handleAccessList() {
    return 'Access list configuration not available in demo mode.';
}

export function handleMonitor() {
    return 'Monitoring not available in demo mode.';
}

export function handleCiscoDebug() {
    return 'Debug mode not available in demo mode.';
}

export function handleReload() {
    return 'Reload not available in demo mode.';
}

export function handleCopy() {
    return 'Copy command not available in demo mode.';
}

export function handleWrite() {
    return 'Write command not available in demo mode.';
}

export function handleErase() {
    return 'Erase command not available in demo mode.';
}

export function handleTerminal() {
    return 'Terminal configuration not available in demo mode.';
}

export function handleLine() {
    return 'Line configuration not available in demo mode.';
}

export function handleUsername() {
    return 'Username configuration not available in demo mode.';
}

export function handleEnable() {
    return 'Already in privileged EXEC mode.';
}

export function handleDisable() {
    return 'Disabling privileged mode...\nType "enable" to return to privileged EXEC mode.';
}

export function handleEnd() {
    return 'Exiting configuration mode...';
}

export function handleCiscoShow(args) {
    const [what] = args;
    if (!what) {
        return 'show: missing argument';
    }
    return `show ${what}: command not available in demo mode.`;
}

export function handleNo(args) {
    const [command] = args;
    if (!command) {
        return 'no: missing argument';
    }
    return `no ${command}: command not available in demo mode.`;
}

export function handleDo(args) {
    const [command] = args;
    if (!command) {
        return 'do: missing argument';
    }
    return `do ${command}: command not available in demo mode.`;
}