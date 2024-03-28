/* tslint:disable:no-string-literal */
import { spawnSync } from 'child_process';


/**
 * Process environment that does not refer to Yarn's package registry. Since the scripts are
 * usually run through Yarn, we need to update the "npm_config_registry" so that NPM is able to
 * properly run "npm login" and "npm publish".
 */
const npmClientEnvironment = {
    ...process.env,
    // See https://docs.npmjs.com/misc/registry for the official documentation of the NPM registry.
    npm_config_registry: 'https://registry.npmjs.org'
};

/** Checks whether NPM is currently authenticated. */
export function isNpmAuthenticated(): boolean {
    return spawnSync('npm', ['whoami'], {
        shell: true,
        env: npmClientEnvironment
    }).stdout.toString() !== '';
}

/** Runs "npm login" interactively by piping stdin/stderr/stdout to the current tty. */
export function npmLoginInteractive(): boolean {
    return spawnSync('npm', ['login'], {
        stdio: 'inherit',
        shell: true,
        env: npmClientEnvironment
    }).status === 0;
}

/** Runs NPM publish within a specified directory */
export function npmPublish(packagePath: string, distTag: string): string | undefined {

    const command = ['publish', '--access', 'public', '--tag', distTag];

    if (process.env['DEBUG']) {
        command.push('--dry-run');
    }

    const result = spawnSync('npm', command, {
        cwd: packagePath,
        shell: true
    });

    if (result.status !== 0) {
        return result.stderr.toString();
    }

    return;
}

/** Log out of npm. */
export function npmLogout(): boolean {
    return spawnSync('npm', ['logout'], {
        shell: true,
        env: npmClientEnvironment
    }).status === 0;
}
