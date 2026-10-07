import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Reading a checkout's history. Shared so the byte/character trap below is solved once. */

/**
 * The monorepo this package lives in.
 *
 * Resolved from the module rather than from `cwd`, so a build script works whichever directory it
 * is started from. `src/indexer` and `dist/indexer` are the same depth below the package, so the
 * compiled output lands on the same root.
 */
export const repoRoot = (): string => resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');

/** Where the generated indexes go. Inside the package, because they ship with it. */
export const dataDir = (): string => resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data');

export const git = (repo: string, args: string[], input?: string): string => {
    try {
        return execFileSync('git', args, {
            cwd: repo,
            input,
            encoding: 'utf-8',
            maxBuffer: 1024 * 1024 * 256,
            stdio: ['pipe', 'pipe', 'ignore']
        });
    } catch {
        return '';
    }
};

/**
 * Reads many blobs from one tag in a single `git cat-file --batch`.
 *
 * One spawn rather than one per file: 78 tags times ~16 files is 1200 processes otherwise.
 *
 * The output is parsed as a Buffer on purpose. Each record is `<sha> blob <size>\n<bytes>\n`, and
 * `size` counts *bytes*. Decoding the whole stream to a string first and slicing by `size` reads
 * the right number of *characters*, which is the same thing only while the content stays ASCII —
 * the first Russian guide shifts every subsequent offset by one position per non-ASCII character,
 * the next header lands mid-text, its size parses as NaN, and the rest of the batch is silently
 * dropped. That cost six of theming's seven revisions before it was caught.
 */
export const readBlobs = (repo: string, tag: string, paths: string[]): Map<string, string> => {
    const bodies = new Map<string, string>();

    if (paths.length === 0) return bodies;

    let batch: Buffer;

    try {
        batch = execFileSync('git', ['cat-file', '--batch'], {
            cwd: repo,
            input: paths.map((path) => `${tag}:${path}`).join('\n') + '\n',
            maxBuffer: 1024 * 1024 * 256,
            stdio: ['pipe', 'pipe', 'ignore']
        });
    } catch {
        return bodies;
    }

    let cursor = 0;

    for (const path of paths) {
        const newline = batch.indexOf(0x0a, cursor);

        if (newline === -1) break;

        const header = batch.toString('utf-8', cursor, newline).split(' ');

        // `<name> missing` for a path absent at this tag: skip the record, keep reading the rest.
        if (header[1] === 'missing' || header.length < 3) {
            cursor = newline + 1;
            continue;
        }

        const size = Number(header[2]);

        if (!Number.isFinite(size)) break;

        bodies.set(path, batch.toString('utf-8', newline + 1, newline + 1 + size));
        cursor = newline + 1 + size + 1;
    }

    return bodies;
};
