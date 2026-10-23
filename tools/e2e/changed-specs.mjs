/**
 * Lists the component e2e specs a change reaches, for the burn-in step of .github/workflows/e2e.yml: a spec
 * that a pull request adds or edits, or whose component it changes, runs several times over there, so that a
 * test that passes only most of the time fails on the pull request that brings it rather than later on main.
 *
 *   node tools/e2e/changed-specs.mjs [<git diff revisions>]   # default: origin/main...HEAD
 *
 * Prints `specs=<paths separated by spaces>` and `repeat=<times>` in the format of $GITHUB_OUTPUT; the list is
 * empty when nothing qualifies. Only committed changes count.
 *
 * Plain JavaScript with no dependencies: the job runs it on the runner, where nothing is installed.
 */
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

/**
 * How many times over the burn-in runs `specCount` specs. Fewer for a wider change, rather than none: a broad
 * change is the likeliest to bring a flake, and twice over still catches the frequent ones at the cost of about
 * two more runs of the suite.
 */
export const burnInRepeat = (specCount) => (specCount <= 5 ? 10 : specCount <= 20 ? 3 : 2);

const COMPONENTS = 'packages/components/';
const SPEC = /\.playwright-spec\.ts$/;
// The paths reach a shell through the workflow, and a pull request chooses them.
const SAFE_PATH = /^[\w./-]+$/;

/**
 * The directory whose specs a changed file reaches: its component's, or for `core` only that of its core module.
 * Every component builds on core, so following core into their specs would select the whole suite.
 */
const scopeOf = (file) => {
    const segments = file.slice(COMPONENTS.length).split('/');
    const depth = segments[0] === 'core' ? 2 : 1;

    // A file at the root of `packages/components` or of `core` belongs to no component.
    return segments.length > depth ? COMPONENTS + segments.slice(0, depth).join('/') + '/' : null;
};

/**
 * @param {readonly string[]} changedFiles Paths the change adds or modifies, relative to the repository root.
 * @param {readonly string[]} specs Every component spec in the repository.
 * @returns {string[]} The specs the change reaches, sorted.
 */
export const reachedSpecs = (changedFiles, specs) => {
    const selected = new Set();

    for (const file of changedFiles) {
        if (!file.startsWith(COMPONENTS)) continue;

        const scope = scopeOf(file);

        if (!scope) continue;

        for (const spec of specs) {
            if (spec.startsWith(scope)) selected.add(spec);
        }
    }

    return [...selected].filter((spec) => SAFE_PATH.test(spec)).sort();
};

const git = (...args) =>
    execFileSync('git', args, { encoding: 'utf8' })
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const revisions = process.argv.slice(2);
    const changedFiles = git(
        'diff',
        '--name-only',
        '--diff-filter=d',
        ...(revisions.length ? revisions : ['origin/main...HEAD'])
    );
    const specs = git('ls-files', COMPONENTS).filter((file) => SPEC.test(file));
    const reached = reachedSpecs(changedFiles, specs);

    if (!reached.length) console.error('No burn-in: the change reaches no component spec.');

    console.log(`specs=${reached.join(' ')}`);
    console.log(`repeat=${burnInRepeat(reached.length)}`);
}
