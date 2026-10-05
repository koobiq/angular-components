import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { compare, isRelease, sortReleases } from '../semver.js';
import { dataDir, git, readBlobs, repoRoot } from './git.js';
import { parseApiReport } from './parse-api-md.js';

/**
 * Builds the per-release API history from the committed API reports.
 *
 * Nothing is built and nothing is installed. `tools/public_api_guard/**` is approved in CI and
 * committed, so the report at a tag *is* the public surface of that release — `git show` reads it
 * in about 25 ms. Checking out and building 75 releases would need the Node, the lockfile and the
 * toolchain of each era, and would produce the same answer.
 *
 *   yarn build:mcp:data
 */

// Shapes live in `src/sources/history.ts`, next to the code that reads the file back.
export type { ApiHistory, MemberChange } from '../sources/history.js';

import type { ApiHistory, MemberChange } from '../sources/history.js';

const GUARD_DIR = 'tools/public_api_guard/components';

export const releasesFrom = (repo: string, lowest: string): string[] =>
    sortReleases(
        git(repo, ['tag', '--list'])
            .split('\n')
            .map((line) => line.trim())
            .filter((tag) => isRelease(tag) && compare(tag, lowest) >= 0)
    );

/** One entry point's members at one release, keyed `Symbol` and `Symbol.member`. */
type Surface = Map<string, Map<string, string>>;

/** Reads every report at a tag in one `git cat-file --batch` rather than one process per file. */
const readSurface = (repo: string, tag: string): Surface => {
    const listed = git(repo, ['ls-tree', '-r', '--name-only', tag, `${GUARD_DIR}/`])
        .split('\n')
        .filter((path) => path.endsWith('.api.md'));

    const surface: Surface = new Map();

    for (const [path, body] of readBlobs(repo, tag, listed)) {
        const members = new Map<string, string>();

        for (const symbol of parseApiReport(body)) {
            members.set(symbol.name, symbol.selector ? `selector ${symbol.selector}` : symbol.kind);

            for (const member of symbol.members) members.set(`${symbol.name}.${member.name}`, member.signature);
        }

        surface.set(basename(path, '.api.md'), members);
    }

    return surface;
};

const diff = (before: Surface, after: Surface): Record<string, MemberChange[]> => {
    const changed: Record<string, MemberChange[]> = {};

    for (const [entryPoint, now] of after) {
        const was = before.get(entryPoint) ?? new Map<string, string>();
        const changes: MemberChange[] = [];

        const split = (key: string) => {
            const dot = key.indexOf('.');

            return dot === -1 ? { symbol: key } : { symbol: key.slice(0, dot), member: key.slice(dot + 1) };
        };

        for (const [key, signature] of now) {
            const previous = was.get(key);

            if (previous === undefined) changes.push({ ...split(key), change: 'added' });
            else if (previous !== signature) {
                changes.push({ ...split(key), change: 'updated', from: previous, to: signature });
            }
        }

        // An entry point absent before is new as a whole; listing each of its members as removed
        // from nothing would bury the releases where something was actually taken away.
        if (before.has(entryPoint)) {
            for (const key of was.keys()) if (!now.has(key)) changes.push({ ...split(key), change: 'removed' });
        }

        if (changes.length > 0) changed[entryPoint] = changes;
    }

    for (const entryPoint of before.keys()) {
        if (!after.has(entryPoint)) changed[entryPoint] = [{ symbol: '*', change: 'removed' }];
    }

    return changed;
};

export const buildHistory = (repo: string, lowest = '18.0.0'): ApiHistory => {
    const releases = releasesFrom(repo, lowest);
    const history: ApiHistory = {};
    let previous: Surface = new Map();

    releases.forEach((tag, index) => {
        const surface = readSurface(repo, tag);

        // The first release is the baseline: everything in it would otherwise read as "added".
        if (index > 0) {
            const changed = diff(previous, surface);

            if (Object.keys(changed).length > 0) history[tag] = changed;
        }

        previous = surface;
    });

    return history;
};

const main = (): void => {
    const repo = resolve(process.argv[2] ?? process.env.KOOBIQ_REPO ?? repoRoot());
    const lowest = process.argv[3] ?? '18.0.0';
    const started = Date.now();
    const history = buildHistory(repo, lowest);

    const outputPath = join(dataDir(), 'history.json');

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, JSON.stringify(history) + '\n');

    const changes = Object.values(history).reduce(
        (total, entryPoints) => total + Object.values(entryPoints).reduce((inner, list) => inner + list.length, 0),
        0
    );

    const removed = Object.values(history).reduce(
        (total, entryPoints) =>
            total +
            Object.values(entryPoints).reduce(
                (inner, list) => inner + list.filter((change) => change.change === 'removed').length,
                0
            ),
        0
    );

    process.stdout.write(
        [
            `${outputPath}`,
            `  releases with changes  ${Object.keys(history).length} of ${releasesFrom(repo, lowest).length}`,
            `  changes                ${changes}`,
            `  of those removals      ${removed}`,
            `  built in               ${((Date.now() - started) / 1000).toFixed(1)}s`,
            ''
        ].join('\n')
    );
};

if (process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))) main();
