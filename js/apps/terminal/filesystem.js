// js/apps/terminal/commands/filesystem.js

import { loadResume } from './content.js';
import { AppError, ErrorTypes, eventEmitter } from '../../utils/utils.js';

export function handleCat(terminal, args) {
    const [file] = args;
    if (!file) {
        return 'cat: missing argument';
    }
    if (file === 'resume.txt') {
        return loadResume();
    }
    return `cat: ${file}: No such file or directory`;
}

export async function handleHead(args) {
    const [file] = args;
    if (!file) {
        return 'head: missing argument';
    }
    if (file === 'resume.txt') {
        const content = await loadResume();
        const lines = content.split('\n');
        return lines.slice(0, 10).join('\n');
    }
    return `head: ${file}: No such file or directory`;
}

export async function handleTail(args) {
    const [file] = args;
    if (!file) {
        return 'tail: missing argument';
    }
    if (file === 'resume.txt') {
        const content = await loadResume();
        const lines = content.split('\n');
        return lines.slice(-10).join('\n');
    }
    return `tail: ${file}: No such file or directory`;
}

export function handleMore(terminal, args) {
    const [file] = args;
    if (!file) {
        return 'more: missing argument';
    }
    return terminal.handleCat(args);
}

export function handleLess(terminal, args) {
    const [file] = args;
    if (!file) {
        return 'less: missing argument';
    }
    return terminal.handleCat(args);
}

export function handleGrep(args) {
    const [pattern, file] = args;
    if (!pattern) {
        return 'grep: missing argument';
    }
    if (!file) {
        return 'grep: missing file operand';
    }
    if (file === 'resume.txt') {
        return `grep: searching for "${pattern}" in ${file}...\nNo matches found.`;
    }
    return `grep: ${file}: No such file or directory`;
}

export function handleFind(args) {
    const [path, ...options] = args;
    if (!path) {
        return 'find: missing argument';
    }
    return `find: searching in ${path}...\nNo files found matching criteria.`;
}

export function handleLocate(args) {
    const [pattern] = args;
    if (!pattern) {
        return 'locate: missing argument';
    }
    return `locate: searching for "${pattern}"...\nNo files found.`;
}

export function handleTouch(args) {
    const [file] = args;
    if (!file) {
        return 'touch: missing argument';
    }
    return `touch: created file '${file}'`;
}

export function handleMkdir(args) {
    const [dir] = args;
    if (!dir) {
        return 'mkdir: missing argument';
    }
    return `mkdir: created directory '${dir}'`;
}

export function handleRmdir(args) {
    const [dir] = args;
    if (!dir) {
        return 'rmdir: missing argument';
    }
    return `rmdir: removed directory '${dir}'`;
}

export function handleRm(args) {
    const [file] = args;
    if (!file) {
        return 'rm: missing argument';
    }
    return `rm: removed '${file}'`;
}

export function handleCp(args) {
    const [source, dest] = args;
    if (!source || !dest) {
        return 'cp: missing argument';
    }
    return `cp: copied '${source}' to '${dest}'`;
}

export function handleMv(args) {
    const [source, dest] = args;
    if (!source || !dest) {
        return 'mv: missing argument';
    }
    return `mv: moved '${source}' to '${dest}'`;
}

export function handleLn(args) {
    const [target, link] = args;
    if (!target || !link) {
        return 'ln: missing argument';
    }
    return `ln: created link '${link}' to '${target}'`;
}

export function handleChmod(args) {
    const [mode, file] = args;
    if (!mode || !file) {
        return 'chmod: missing argument';
    }
    return `chmod: changed permissions of '${file}' to ${mode}`;
}

export function handleChown(args) {
    const [owner, file] = args;
    if (!owner || !file) {
        return 'chown: missing argument';
    }
    return `chown: changed owner of '${file}' to ${owner}`;
}

export function handleDu(terminal, args) {
    const [path] = args;
    const targetPath = path || terminal.workingDirectory;
    return `4.0K\t${targetPath}`;
}

export function handleDf() {
    return `Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sda1      104857600  52428800  52428800  50% /\n/dev/sdb1      209715200 104857600 104857600  50% /home`;
}

export function handleStat(args) {
    const [file] = args;
    if (!file) {
        return 'stat: missing argument';
    }
    return `  File: ${file}\n  Size: 1024\t\tBlocks: 8          IO Block: 4096   regular file\nAccess: (0644/-rw-r--r--)  Uid: ( 1000/   jared)   Gid: ( 1000/   jared)\nAccess: 2024-01-15 10:30:00.000000000 +0000\nModify: 2024-01-15 10:30:00.000000000 +0000\nChange: 2024-01-15 10:30:00.000000000 +0000`;
}

export function handleFile(args) {
    const [file] = args;
    if (!file) {
        return 'file: missing argument';
    }
    if (file.endsWith('.txt')) {
        return `${file}: ASCII text`;
    } else if (file.endsWith('.sh')) {
        return `${file}: Bourne-Again shell script, ASCII text executable`;
    } else if (file.endsWith('.py')) {
        return `${file}: Python script, ASCII text executable`;
    }
    return `${file}: data`;
}

export function handleWc(args) {
    const [file] = args;
    if (!file) {
        return 'wc: missing argument';
    }
    return `     50     200    1500 ${file}`;
}

export function handleSort(args) {
    const [file] = args;
    if (!file) {
        return 'sort: missing argument';
    }
    return `sort: sorted '${file}'`;
}

export function handleUniq(args) {
    const [file] = args;
    if (!file) {
        return 'uniq: missing argument';
    }
    return `uniq: removed duplicates from '${file}'`;
}

export function handleCut(args) {
    const [file] = args;
    if (!file) {
        return 'cut: missing argument';
    }
    return `cut: processed '${file}'`;
}

export function handlePaste(args) {
    const [file] = args;
    if (!file) {
        return 'paste: missing argument';
    }
    return `paste: processed '${file}'`;
}

export function handleJoin(args) {
    const [file1, file2] = args;
    if (!file1 || !file2) {
        return 'join: missing argument';
    }
    return `join: joined '${file1}' and '${file2}'`;
}

export function handleSplit(args) {
    const [file] = args;
    if (!file) {
        return 'split: missing argument';
    }
    return `split: split '${file}' into multiple files`;
}

export function handleTr(args) {
    const [file] = args;
    if (!file) {
        return 'tr: missing argument';
    }
    return `tr: translated '${file}'`;
}

export function handleSed(args) {
    const [file] = args;
    if (!file) {
        return 'sed: missing argument';
    }
    return `sed: processed '${file}'`;
}

export function handleAwk(args) {
    const [file] = args;
    if (!file) {
        return 'awk: missing argument';
    }
    return `awk: processed '${file}'`;
}