// js/apps/terminal/commands/network.js

export function handlePing(args) {
    const [host] = args;
    if (!host) return 'Usage: ping <host>';
    return `Pinging ${host}...\nReply from ${host}: time=10ms\nReply from ${host}: time=12ms\nReply from ${host}: time=8ms`;
}

export function handleTracert(args) {
    const [host] = args;
    if (!host) return 'Usage: tracert <host>';
    return `Tracing route to ${host}...\n1  10ms  10ms  10ms  router.local\n2  15ms  12ms  14ms  ${host}`;
}

export function handleNslookup(args) {
    const [domain] = args;
    if (!domain) return 'Usage: nslookup <domain>';
    return `Name: ${domain}\nAddress: 192.168.1.100\nAliases: www.${domain}`;
}

export function handleArp() {
    return 'Internet Address      Physical Address      Type\n192.168.1.1           aa-bb-cc-dd-ee-ff     dynamic\n192.168.1.100         ff-ee-dd-cc-bb-aa     dynamic';
}

export function handleRoute() {
    return 'Network Destination        Netmask          Gateway       Interface  Metric\n0.0.0.0                0.0.0.0          192.168.1.1    192.168.1.100      1';
}

export function handleSSH(args) {
    const [host] = args;
    if (!host) return 'Usage: ssh <host>';
    return `Connecting to ${host}...\nSSH connection established\nWelcome to ${host}`;
}

export function handleIfconfig() {
    return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::1234:5678:9abc:def0  prefixlen 64  scopeid 0x20<link>\n        ether 00:11:22:33:44:55  txqueuelen 1000  (Ethernet)\n        RX packets 12345  bytes 9876543 (9.4 MiB)\n        RX errors 0  dropped 0  overruns 0  frame 0\n        TX packets 6789  bytes 5432109 (5.1 MiB)\n        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`;
}

export function handleIp(terminal, args) {
    const [subcommand] = args;
    if (subcommand === 'addr') {
        return handleIfconfig();
    } else if (subcommand === 'route') {
        return handleRoute();
    }
    return `ip: unknown command '${subcommand}'`;
}

export function handleNetstat() {
    return `Active Internet connections (w/o servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 192.168.1.100:22        192.168.1.50:12345      ESTABLISHED\ntcp        0      0 192.168.1.100:80        192.168.1.50:54321      ESTABLISHED`;
}

export function handlePs() {
    return `  PID TTY          TIME CMD\n 1234 pts/0    00:00:00 bash\n 1235 pts/0    00:00:00 ps`;
}

export function handleTop() {
    return `top - 09:30:30 up 15 days, 23:45,  1 user,  load average: 0.52, 0.48, 0.44\nTasks: 123 total,   1 running, 122 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  2.5 us,  1.2 sy,  0.0 ni, 96.3 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st\nMiB Mem :   8192.0 total,   2048.0 free,   3072.0 used,   3072.0 buff/cache\nMiB Swap:   4096.0 total,   4096.0 free,      0.0 used.   4096.0 avail Mem\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 1234 jared     20   0   12345   6789   1234 S   2.5   0.1   0:00.01 bash`;
}

export function handleTelnet() {
    return 'telnet: connection refused (telnet is disabled for security)';
}

export function handleFtp() {
    return 'ftp: connection refused (ftp is disabled for security)';
}

export function handleSftp() {
    return 'sftp: connection refused (sftp is disabled for security)';
}

export function handleScp(args) {
    const [source, dest] = args;
    if (!source || !dest) {
        return 'scp: missing argument';
    }
    return `scp: connection refused (scp is disabled for security)`;
}

export function handleRsync(args) {
    const [source, dest] = args;
    if (!source || !dest) {
        return 'rsync: missing argument';
    }
    return `rsync: connection refused (rsync is disabled for security)`;
}

export function handleWget(args) {
    const [url] = args;
    if (!url) {
        return 'wget: missing argument';
    }
    return `wget: connection refused (wget is disabled for security)`;
}

export function handleCurl(args) {
    const [url] = args;
    if (!url) {
        return 'curl: missing argument';
    }
    return `curl: connection refused (curl is disabled for security)`;
}

export function handleNc(args) {
    const [host, port] = args;
    if (!host || !port) {
        return 'nc: missing argument';
    }
    return `nc: connection refused (nc is disabled for security)`;
}

export function handleIpconfig() {
    return 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : local\n   IPv4 Address. . . . . . . . . . . : 192.168.1.100\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1';
}

export function handleSpeedtest() {
    return 'Speedtest results:\nDownload: 100 Mbps\nUpload: 50 Mbps\nPing: 10 ms\nJitter: 2 ms';
}

export function handleNetsh(args) {
    const command = args.join(' ');
    return `netsh: executed '${command}'`;
}

export function handleIptables(args) {
    const [action] = args;
    if (!action) {
        return 'iptables: missing argument';
    }
    return `iptables: ${action} rule applied`;
}

export function handleUfw(args) {
    const [action] = args;
    if (!action) {
        return 'ufw: missing argument';
    }
    return `ufw: ${action} rule applied`;
}

export function handleFirewallCmd(args) {
    const [action] = args;
    if (!action) {
        return 'firewall-cmd: missing argument';
    }
    return `firewall-cmd: ${action} rule applied`;
}

export function handleSs(args) {
    return `Netid  State   Recv-Q  Send-Q  Local Address:Port    Peer Address:Port\ntcp    ESTAB   0       0       192.168.1.100:22      192.168.1.50:12345`;
}

export function handleLsof(args) {
    const [file] = args;
    if (!file) {
        return 'lsof: missing argument';
    }
    return `lsof: no process found using '${file}'`;
}

export function handleTcpdump(args) {
    const [iface] = args;
    if (!iface) {
        return 'tcpdump: missing argument';
    }
    return `tcpdump: listening on ${iface}, link-type EN10MB (Ethernet), capture size 262144 bytes`;
}

export function handleWireshark() {
    return 'wireshark: GUI application not available in terminal mode';
}

export function handleNmap(args) {
    const [target] = args;
    if (!target) {
        return 'nmap: missing argument';
    }
    return `nmap: scan initiated for ${target}`;
}

export function handleHost(args) {
    const [domain] = args;
    if (!domain) {
        return 'host: missing argument';
    }
    return `host: ${domain} has address 192.168.1.100`;
}

export function handleWhois(args) {
    const [domain] = args;
    if (!domain) {
        return 'whois: missing argument';
    }
    return `whois: ${domain} - No match for domain "${domain}"`;
}