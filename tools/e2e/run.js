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

// How `docker` is reached. Normally the CLI is on PATH and this is all there is to it; the win32
// branch below can replace it with a hop through WSL.
let docker = { command: 'docker', prefix: [] };

const probeCompose = (runner) =>
    spawnSync(runner.command, [...runner.prefix, 'compose', 'version'], { stdio: 'ignore' });

// Both prerequisites are checked up front, because neither fails in a way that explains itself.
// A missing `docker` surfaces as a bare ENOENT from spawn; a Docker CLI without the v2 compose
// plugin — a machine carrying only the legacy `docker-compose` binary — spawns fine and exits
// non-zero, which is indistinguishable from a genuine test failure further down.
let compose = probeCompose(docker);

// Windows with Docker Engine inside WSL rather than Docker Desktop. There is no docker.exe for
// Win32 to find — /usr/bin/docker is a Linux ELF binary, and while WSL projects Windows executables
// into the distribution, nothing does the reverse — so wsl.exe is the only bridge. Try the same
// probe through it before giving up.
//
// A `docker.cmd` shim on PATH would not work here: Node does not resolve .bat/.cmd from a non-shell
// spawn, so the call above would report the same ENOENT it reports for a missing Docker. Neither
// would a native Windows CLI talking to the WSL daemon over TCP — it resolves the compose file's
// relative volumes into Windows paths and hands them to a Linux daemon, which cannot bind-mount
// `C:\...`. Translating at the wsl.exe boundary keeps every path Linux-side, where compose expects
// them.
if (compose.error?.code === 'ENOENT' && process.platform === 'win32') {
    const viaWsl = { command: 'wsl.exe', prefix: ['-e', 'docker'] };
    const probe = probeCompose(viaWsl);

    // Left alone when the hop fails, so the diagnostics below still describe the original problem.
    if (!probe.error && probe.status === 0) {
        docker = viaWsl;
        compose = probe;
    }
}

const isForwardedToWsl = docker.command === 'wsl.exe';

if (compose.error?.code === 'ENOENT') {
    console.error(
        'Could not find `docker` on PATH.' +
            (process.platform === 'win32'
                ? '\nWith Docker Engine installed inside WSL there is no docker.exe on the Windows PATH. ' +
                  'Falling back to `wsl.exe -e docker` did not work either — check that the default ' +
                  'distribution starts and that its user can reach the daemon, with `wsl -e docker version`.'
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

// In forwarded mode every path on the command line is read by a Linux process, so the Win32 paths
// join() produced have to be translated. wslpath rather than a string replacement, because the mount
// root is configurable — automount.root in wsl.conf — and need not be /mnt.
const toDockerPath = (path) => {
    if (!isForwardedToWsl) return path;

    const translated = spawnSync('wsl.exe', ['-e', 'wslpath', '-u', path], { encoding: 'utf8' });

    if (translated.error || translated.status !== 0) {
        console.error(
            `Could not translate ${path} into a WSL path: ` + (translated.error?.message ?? translated.stderr.trim())
        );
        process.exit(1);
    }

    return translated.stdout.trim();
};

const args = process.argv.slice(2);

// Writing baselines back to the working tree needs the source mounted; a plain run does not, and
// the mount is slow enough to matter. See tools/e2e/docker-compose.update.yml.
const isUpdatingSnapshots = args.some(
    (arg) => arg === '-u' || arg === '--update-snapshots' || arg.startsWith('--update-snapshots=')
);

console.info(`Playwright version: ${version}`);

if (isForwardedToWsl) {
    console.info('No docker.exe on the Windows PATH; forwarding to the Docker Engine inside WSL.');
}

if (isUpdatingSnapshots) {
    console.info('Mounting packages/components so updated baselines land in the working tree.');
}

const env = { ...process.env, PLAYWRIGHT_VERSION: version };

// docker-compose.yml reads all three, and in forwarded mode it is parsed by a process on the other
// side of the WSL boundary, which does not inherit the Win32 environment. WSLENV is what carries a
// variable across; /u marks it as travelling in that direction only. Names of variables that are
// not set are ignored, and an entry repeated from an existing WSLENV is harmless.
if (isForwardedToWsl) {
    const forwarded = ['PLAYWRIGHT_VERSION', 'E2E_PLATFORM', 'PLAYWRIGHT_WORKERS'];

    env.WSLENV = [env.WSLENV, ...forwarded.map((name) => `${name}/u`)].filter(Boolean).join(':');
}

console.time(TIME_LABEL);

const result = spawnSync(
    docker.command,
    [
        ...docker.prefix,
        'compose',
        '--file',
        toDockerPath(COMPOSE_FILE),
        ...(isUpdatingSnapshots ? ['--file', toDockerPath(COMPOSE_UPDATE_FILE)] : []),
        'run',
        '--rm',
        '--build',
        'e2e',
        ...args
    ],
    {
        stdio: 'inherit',
        env
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
