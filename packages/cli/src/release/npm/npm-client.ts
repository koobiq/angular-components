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
    return (
        spawnSync('npm', ['whoami'], {
            shell: true,
            env: npmClientEnvironment
        }).stdout.toString() !== ''
    );
}

/** Runs "npm login" interactively by piping stdin/stderr/stdout to the current tty. */
export function npmLoginInteractive(): boolean {
    return (
        spawnSync('npm', ['login'], {
            stdio: 'inherit',
            shell: true,
            env: npmClientEnvironment
        }).status === 0
    );
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

/** Thrown by `npmViewDistTag` when the registry query fails for a reason other than E404. */
export class NpmViewError extends Error {}

/**
 * Returns the version currently published under the given dist-tag, or null if the package (or
 * that specific tag on it) has genuinely never been published — an npm E404.
 *
 * Any other failure (network blip, registry 5xx, auth error, timeout, ...) is ambiguous: it does
 * not mean "nothing published", it means "we couldn't check". Treating it the same as E404 would
 * let a transient npm error look like a first-ever publish to a caller like `resolveNpmDistTag`,
 * so those cases throw instead of silently returning null.
 */
export function npmViewDistTag(packageName: string, tag: string): string | null {
    const result = spawnSync('npm', ['view', packageName, `dist-tags.${tag}`], {
        shell: true,
        env: npmClientEnvironment
    });

    if (result.status !== 0) {
        const stderr = result.stderr.toString();

        if (/\bnpm error code E404\b/.test(stderr)) {
            return null;
        }

        throw new NpmViewError(
            `npm view ${packageName} dist-tags.${tag} failed (exit ${result.status}):\n${stderr.trim()}`
        );
    }

    const output = result.stdout.toString().trim();

    return output || null;
}

/** Log out of npm. */
export function npmLogout(): boolean {
    return (
        spawnSync('npm', ['logout'], {
            shell: true,
            env: npmClientEnvironment
        }).status === 0
    );
}
