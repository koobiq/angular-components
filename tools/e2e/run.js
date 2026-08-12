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
const { basename, join } = require('node:path');
const { devDependencies } = require('../../package.json');

const TIME_LABEL = 'Runtime';
const COMPOSE_FILE = join(__dirname, 'docker-compose.yml');
const COMPOSE_UPDATE_FILE = join(__dirname, 'docker-compose.update.yml');

const fail = (message) => {
    console.error(message);
    process.exit(1);
};

// Read straight from the manifest rather than from node_modules: CI runs this without an install
// step, so the packages are not on disk.
const version = devDependencies['@playwright/test'];

// The tag has to be exact. A range would either not resolve to a tag at all or, worse, resolve to
// an image whose browsers differ from the ones the lockfile installs.
if (!/^\d+\.\d+\.\d+$/.test(version)) {
    fail(
        `Expected devDependencies["@playwright/test"] in package.json to be an exact version, got ${JSON.stringify(version)}.`
    );
}

// How `docker` is reached. Normally the CLI is on PATH and this is all there is to it; the win32
// branch below can replace it with a hop through WSL.
let docker = { command: 'docker', prefix: [] };
let isForwardedToWsl = false;

// `wsl.exe -e` alone always targets whichever distribution is current default, and there is no way
// to detect the right one automatically when Docker lives in a different one.
const wslDistro = process.env.WSL_DISTRIBUTION;
const wslArgs = (exe) => [...(wslDistro ? ['-d', wslDistro] : []), '-e', exe];

// encoding rather than stdio: 'ignore' so a failure can be explained with the command's own stderr
// instead of a guess. Neither probe prints anything unless something goes wrong: spawnSync only
// pipes, it does not inherit.
const probeCompose = (runner) =>
    spawnSync(runner.command, [...runner.prefix, 'compose', 'version'], { encoding: 'utf8' });

const describeFailure = (result) =>
    result.error ? result.error.message : (result.stderr || '').trim() || `exited with status ${result.status}`;

// Both prerequisites are checked up front, because neither fails in a way that explains itself.
// A missing `docker` surfaces as a bare ENOENT from spawn; a Docker CLI without the v2 compose
// plugin — a machine carrying only the legacy `docker-compose` binary — spawns fine and exits
// non-zero, which is indistinguishable from a genuine test failure further down.
let compose = probeCompose(docker);

// On Windows, retry through WSL whenever the direct probe did not cleanly succeed — not only on
// ENOENT. `docker.exe` can also be present but broken (a stale Docker Desktop install, a CLI
// without the compose v2 plugin), and that deserves the same chance to fall through to a working
// WSL-hosted Engine as a missing binary does.
//
// There is no docker.exe for Win32 to find in the WSL-only case — /usr/bin/docker is a Linux ELF
// binary, and while WSL projects Windows executables into the distribution, nothing does the
// reverse — so wsl.exe is the only bridge. A `docker.cmd` shim on PATH would not help either: Node
// does not resolve .bat/.cmd from a non-shell spawn, so the probe above would still ENOENT. Neither
// would a native Windows CLI talking to the WSL daemon over TCP — it resolves the compose file's
// relative volumes into Windows paths and hands them to a Linux daemon, which cannot bind-mount
// `C:\...`. Translating at the wsl.exe boundary (see toDockerPath below) keeps every path
// Linux-side, where compose expects them.
if ((compose.error || compose.status !== 0) && process.platform === 'win32') {
    const viaWsl = { command: 'wsl.exe', prefix: wslArgs('docker') };
    const probe = probeCompose(viaWsl);

    if (!probe.error && probe.status === 0) {
        docker = viaWsl;
        compose = probe;
        isForwardedToWsl = true;
    } else {
        fail(
            'Could not run `docker compose version`:\n' +
                `  docker: ${describeFailure(compose)}\n` +
                `  wsl.exe ${wslArgs('docker').join(' ')}: ${describeFailure(probe)}` +
                (wslDistro
                    ? ''
                    : '\nIf Docker lives in a non-default WSL distribution, set WSL_DISTRIBUTION to its name.')
        );
    }
}

// Not folded into the block above: on Windows a missing `docker` already got a chance via WSL, so
// by this point it either forwarded successfully or exited with the combined diagnosis. Off
// Windows there is nothing to fall back to, so a plain ENOENT is reported directly.
if (process.platform !== 'win32' && compose.error?.code === 'ENOENT') {
    fail('Could not find `docker` on PATH.');
}

if (compose.error || compose.status !== 0) {
    fail(
        '`docker compose` is unavailable. These scripts need Compose v2, which ships as a Docker\n' +
            'CLI plugin; the standalone `docker-compose` v1 binary cannot read this configuration.'
    );
}

if (isForwardedToWsl) {
    console.info(
        `Forwarding through wsl.exe to a Docker Engine inside WSL${wslDistro ? ` (distribution: ${wslDistro})` : ''}.`
    );
}

// In forwarded mode every path on the command line is read by a Linux process, so the Win32 paths
// join() produced have to be translated. wslpath rather than a string replacement, because the mount
// root is configurable — automount.root in wsl.conf — and need not be /mnt. COMPOSE_FILE and
// COMPOSE_UPDATE_FILE are both direct children of __dirname (see above), so translating that
// directory once and joining the statically-known filename covers both without a second wsl.exe
// round trip.
let translatedDir;

const toDockerPath = (path) => {
    if (!isForwardedToWsl) return path;

    if (translatedDir === undefined) {
        const translated = spawnSync('wsl.exe', [...wslArgs('wslpath'), '-u', __dirname], { encoding: 'utf8' });

        if (translated.error || translated.status !== 0) {
            fail(`Could not translate ${__dirname} into a WSL path: ${describeFailure(translated)}`);
        }

        translatedDir = translated.stdout.trim();
    }

    return `${translatedDir}/${basename(path)}`;
};

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
    fail(`Failed to run \`${docker.command}\`: ${result.error.message}`);
}

// Only when there is something to open: the run can also fail before any test executes — a build
// error, or an image that cannot be pulled — and pointing at a report that was never written sends
// whoever is debugging in the wrong direction.
if (result.status !== 0 && existsSync(join(__dirname, '../../playwright-report/index.html'))) {
    console.info('To view the test report, run: `npx playwright show-report`');
}

process.exit(result.status ?? 1);
