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
 * The release this working tree is being staged as, or null when it is not one.
 *
 * `build:mcp:data` runs in the release pipeline after the version bump but before the release tag
 * exists, with no way to read "the release about to happen" from git — there is nothing there yet
 * to read. Told explicitly by `KOOBIQ_RELEASE`, set only around the `post-version-bump` hook
 * (`runReleaseCommands` in `@koobiq/cli`), never guessed by comparing the working tree's version
 * against the newest tag. That comparison used to be the signal, and was wrong on any ordinary
 * branch with a version bumped past the last release but no tag of its own yet — this repository's
 * own `feat/DS-5062`, on `21.0.0` with no `21.0.0` tag, read as "staging 21.0.0" and stamped every
 * guide with a release that does not exist.
 */
export const stagedVersion = (version: string): string | null =>
    process.env.KOOBIQ_RELEASE === version ? version : null;

/**
 * Refuses to build from a checkout that has no release tags.
 *
 * Both the guides and the API history are read at tags, and `git` answers an unreachable tag by
 * saying nothing — so a shallow clone does not fail, it produces an artefact that is merely empty.
 * That is the worst of the three outcomes: `actions/checkout` fetches depth 1 and no tags by
 * default, and the first CI run on this package built a `history.json` covering 0 releases with
 * every guide flagged unreleased, while every step reported success.
 */
export const requireTags = (repo: string, what: string): void => {
    if (git(repo, ['tag', '--list', '*.*.*']).trim().length > 0) return;

    process.stderr.write(
        `\nNO RELEASE TAGS in ${repo}\n` +
            `${what} is read at tags, so this checkout would produce an empty or working-tree-only index.\n` +
            `In CI, give the checkout step \`with: fetch-depth: 0\`. Locally, run \`git fetch --tags\`.\n`
    );
    process.exit(1);
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
