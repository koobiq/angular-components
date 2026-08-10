/**
 * Runs the Playwright component suite inside Docker, so that screenshots are produced by the same
 * browser, operating system and font stack as CI.
 *
 * Screenshots are compared with `threshold: 0` and the baselines carry no `{platform}` suffix, so a
 * native run on Windows or macOS compares its own rasterization against Linux bytes and fails on
 * font rendering alone. This wrapper is the supported way to run — and the only supported way to
 * update — the committed baselines.
 *
 * The image tag comes from package.json rather than being hardcoded: the browsers baked into the
 * image have to match the installed @playwright/test exactly, and a tag that has drifted from the
 * manifest is indistinguishable from a genuine visual regression.
 *
 *   node tools/e2e/run.js                  # run the suite (the image's CMD)
 *   node tools/e2e/run.js <command...>     # replace the image's CMD
 *
 * Anything after the script name replaces the container's command rather than being appended to
 * it — that is how `docker compose run` behaves — which is why the update-snapshots script passes
 * the whole command and not just the flag.
 */

const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { join } = require('node:path');
const { devDependencies } = require('../../package.json');

const TIME_LABEL = 'Runtime';
const COMPOSE_FILE = join(__dirname, 'docker-compose.yml');
const COMPOSE_UPDATE_FILE = join(__dirname, 'docker-compose.update.yml');

// Read straight from the manifest rather than from node_modules: CI runs this without an install
// step, so the packages are not on disk.
const version = devDependencies['@playwright/test'];

// The tag has to be exact. A range would either not resolve to a tag at all or, worse, resolve to
// an image whose browsers differ from the ones the lockfile installs.
if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error(
        `Expected devDependencies["@playwright/test"] in package.json to be an exact version, got ${JSON.stringify(version)}.`
    );
    process.exit(1);
}

// Both prerequisites are checked up front, because neither fails in a way that explains itself.
// A missing `docker` surfaces as a bare ENOENT from spawn; a Docker CLI without the v2 compose
// plugin — a machine carrying only the legacy `docker-compose` binary — spawns fine and exits
// non-zero, which is indistinguishable from a genuine test failure further down.
const compose = spawnSync('docker', ['compose', 'version'], { stdio: 'ignore' });

if (compose.error?.code === 'ENOENT') {
    console.error(
        'Could not find `docker` on PATH.' +
            (process.platform === 'win32'
                ? '\nWith Docker Engine installed inside WSL there is no docker.exe on the Windows PATH, ' +
                  'so run this from inside the WSL distribution rather than from PowerShell.'
                : '')
    );
    process.exit(1);
}

if (compose.error || compose.status !== 0) {
    console.error(
        '`docker compose` is unavailable. These scripts need Compose v2, which ships as a Docker\n' +
            'CLI plugin; the standalone `docker-compose` v1 binary cannot read this configuration.'
    );
    process.exit(1);
}

const args = process.argv.slice(2);

// Writing baselines back to the working tree needs the source mounted; a plain run does not, and
// the mount is slow enough to matter. See tools/e2e/docker-compose.update.yml.
const isUpdatingSnapshots = args.some(
    (arg) => arg === '-u' || arg === '--update-snapshots' || arg.startsWith('--update-snapshots=')
);

console.info(`Playwright version: ${version}`);

if (isUpdatingSnapshots) {
    console.info('Mounting packages/components so updated baselines land in the working tree.');
}

console.time(TIME_LABEL);

const result = spawnSync(
    'docker',
    [
        'compose',
        '--file',
        COMPOSE_FILE,
        ...(isUpdatingSnapshots ? ['--file', COMPOSE_UPDATE_FILE] : []),
        'run',
        '--rm',
        '--build',
        'e2e',
        ...args
    ],
    {
        stdio: 'inherit',
        env: { ...process.env, PLAYWRIGHT_VERSION: version }
    }
);

console.timeEnd(TIME_LABEL);

if (result.error) {
    console.error(`Failed to run docker: ${result.error.message}`);
    process.exit(1);
}

// Only when there is something to open: the run can also fail before any test executes — a build
// error, or an image that cannot be pulled — and pointing at a report that was never written sends
// whoever is debugging in the wrong direction.
if (result.status !== 0 && existsSync(join(__dirname, '../../playwright-report/index.html'))) {
    console.info('To view the test report, run: `npx playwright show-report`');
}

process.exit(result.status ?? 1);
