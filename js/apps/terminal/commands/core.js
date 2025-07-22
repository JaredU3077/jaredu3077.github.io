// js/apps/terminal/commands/core.js

export function handlePwd(terminal) {
    return terminal.workingDirectory;
}

export function handleCd(terminal, args) {
    const [path] = args;
    if (!path || path === '~' || path === '~/' || path === '/home/jared') {
        terminal.workingDirectory = '/home/jared';
        terminal.updateEnvironment();
        return '';
    }
    if (path === '..') {
        const parts = terminal.workingDirectory.split('/').filter(Boolean);
        if (parts.length > 1) {
            parts.pop();
            terminal.workingDirectory = '/' + parts.join('/');
        } else {
            terminal.workingDirectory = '/';
        }
    } else if (path.startsWith('/')) {
        terminal.workingDirectory = path;
    } else {
        terminal.workingDirectory = terminal.workingDirectory + '/' + path;
    }
    terminal.updateEnvironment();
    return '';
}

export function handleLs(terminal, args) {
    const [path] = args;
    const targetPath = path || terminal.workingDirectory;
    
    if (targetPath === '/home/jared' || targetPath === '~') {
        return 'resume.txt  network-configs/  scripts/  .bashrc  .profile  Documents/  Downloads/';
    } else if (targetPath === '/home/jared/network-configs') {
        return 'router1.conf  switch1.conf  firewall.conf  vlan-config.txt  ospf-config.txt';
    } else if (targetPath === '/home/jared/scripts') {
        return 'backup.sh  monitor.sh  deploy.sh  test.sh  utils.py';
    } else if (targetPath === '/home/jared/Documents') {
        return 'resume.pdf  certifications/  projects/  notes.txt';
    } else if (targetPath === '/home/jared/Downloads') {
        return 'firmware.bin  config-backup.tar.gz  logs.zip  tools/';
    }
    return `ls: cannot access '${path}': No such file or directory`;
}

export function handleWhoami() {
    return 'jared';
}

export function handleWho() {
    return `jared    pts/0        ${new Date().toLocaleDateString()} 09:30 (192.168.1.100)`;
}

export function handleW() {
    return ` 09:30:30 up 15 days, 23:45,  1 user,  load average: 0.52, 0.48, 0.44\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\njared    pts/0    192.168.1.100    09:30    0.00s  0.05s  0.00s w`;
}

export function handleDate() {
    return new Date().toString();
}

export function handleTime() {
    return new Date().toLocaleTimeString();
}

export function handleUptime() {
    return 'up 15 days, 23 hours, 45 minutes';
}

export function handleUname(args) {
    const [flag] = args;
    if (flag === '-a') {
        return 'Linux neuos 5.15.0-generic #1 SMP x86_64 x86_64 x86_64 GNU/Linux';
    } else if (flag === '-s') {
        return 'Linux';
    } else if (flag === '-n') {
        return 'neuos';
    } else if (flag === '-r') {
        return '5.15.0-generic';
    } else if (flag === '-m') {
        return 'x86_64';
    }
    return 'Linux';
}

export function handleHostname() {
    return 'neuos';
}

export function handleVersion() {
    return 'neuOS Terminal v2.1 - Enhanced with realistic Unix/Linux commands';
}

export function handleHistory(terminal) {
    if (terminal.history.length === 0) {
        return 'No command history available.';
    }
    return terminal.history.map((cmd, index) => `${index + 1}  ${cmd}`).join('\n');
}