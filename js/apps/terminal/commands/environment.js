// js/apps/terminal/commands/environment.js

export function handleEnv(terminal) {
    return Object.entries(terminal.environment)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
}

export function handleSet(terminal, args) {
    if (args.length === 0) {
        return handleEnv(terminal);
    }
    const [varName, value] = args;
    if (!varName) {
        return 'set: missing argument';
    }
    terminal.environment[varName] = value || '';
    return '';
}

export function handleUnset(terminal, args) {
    const [varName] = args;
    if (!varName) {
        return 'unset: missing argument';
    }
    delete terminal.environment[varName];
    return '';
}

export function handleExport(terminal, args) {
    const [varName, value] = args;
    if (!varName) {
        return 'export: missing argument';
    }
    terminal.environment[varName] = value || '';
    return '';
}

export function handleEcho(args) {
    return args.join(' ');
}

export function handlePrintf(args) {
    const [format, ...values] = args;
    if (!format) {
        return 'printf: missing argument';
    }
    return `printf: ${format} ${values.join(' ')}`;
}

export function handleRead(args) {
    const [varName] = args;
    if (!varName) {
        return 'read: missing argument';
    }
    return `read: waiting for input for variable '${varName}'`;
}

export function handleSource(args) {
    const [file] = args;
    if (!file) {
        return 'source: missing argument';
    }
    return `source: sourced '${file}'`;
}

export function handleExec(args) {
    const [command] = args;
    if (!command) {
        return 'exec: missing argument';
    }
    return `exec: executed '${command}'`;
}

export function handleEval(args) {
    const [expression] = args;
    if (!expression) {
        return 'eval: missing argument';
    }
    return `eval: evaluated '${expression}'`;
}

export function handleShift(args) {
    const [count] = args;
    return `shift: shifted ${count || 1} arguments`;
}

export function handleGetopts(args) {
    const [optstring, varName] = args;
    if (!optstring || !varName) {
        return 'getopts: missing argument';
    }
    return `getopts: processing options '${optstring}' for variable '${varName}'`;
}

export function handleTrap(args) {
    const [action, signal] = args;
    if (!action || !signal) {
        return 'trap: missing argument';
    }
    return `trap: set trap for signal '${signal}' to '${action}'`;
}

export function handleUlimit(args) {
    const [resource, limit] = args;
    if (!resource) {
        return 'ulimit: missing argument';
    }
    return `ulimit: set limit for '${resource}' to '${limit || 'unlimited'}'`;
}

export function handleUmask(args) {
    const [mask] = args;
    if (!mask) {
        return 'umask: current umask is 022';
    }
    return `umask: set umask to ${mask}`;
}