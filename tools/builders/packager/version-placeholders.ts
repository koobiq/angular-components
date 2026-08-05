/**
 * Substitution of the `{{VERSION}}` / `{{NG_VERSION}}` placeholders a source manifest carries into
 * the manifest that gets published.
 *
 * Kept apart from `build.ts` so it can be unit tested: the builder imports chalk, which is ESM and
 * cannot be loaded by this repository's jest configuration.
 */

export interface IPackageJson {
    version?: string;
    requiredAngularVersion: string;
    peerDependencies?: {
        [key: string]: string;
    };
    dependencies?: {
        [key: string]: string;
    };
}

/** Just the part of `BuilderContext` these helpers use, so they can be called from a test. */
export interface ILoggingContext {
    logger: { info: (message: string) => void };
}

/**
 * Copies a manifest along with its peer map, so substituting into the copy cannot write through to
 * the manifest that was passed in — a plain spread shares the nested object.
 *
 * An absent `peerDependencies` stays absent rather than becoming `{}`: the result is written out
 * verbatim, and an empty object would appear in the published package.
 */
function copyManifest(releaseJson: IPackageJson): IPackageJson {
    return releaseJson.peerDependencies
        ? { ...releaseJson, peerDependencies: { ...releaseJson.peerDependencies } }
        : { ...releaseJson };
}

export function syncComponentsVersion(
    releaseJson: IPackageJson,
    rootPackageJson: IPackageJson,
    placeholder: string,
    context: ILoggingContext
): IPackageJson {
    const newPackageJson = copyManifest(releaseJson);

    if (rootPackageJson.version && (!newPackageJson.version || newPackageJson.version.trim() === placeholder)) {
        newPackageJson.version = rootPackageJson.version;

        // A package without `peerDependencies` is nothing to sync, not a crash: reading the field
        // unguarded would throw a raw TypeError before `assertNoPlaceholders` could report anything.
        for (const [key, value] of Object.entries(releaseJson.peerDependencies || {})) {
            if (value.includes(placeholder)) {
                // Substitute rather than overwrite, so the source manifest controls the shape of the
                // range: `^{{VERSION}}` must publish as `^1.2.3`, not as the exact pin `1.2.3`.
                // Exact-pinning our own packages to each other makes them mutually unsatisfiable as
                // soon as their versions drift apart.
                const range = value.replace(placeholder, newPackageJson.version!);

                context.logger.info(`${key}: ${range}`);
                // Reaching this line means the field exists — the loop body never runs otherwise.
                newPackageJson.peerDependencies![key] = range;
            }
        }
    }

    return newPackageJson;
}

export function syncNgVersion(
    releaseJson: IPackageJson,
    rootPackageJson: IPackageJson,
    placeholder: string,
    context: ILoggingContext
): IPackageJson {
    const updatedJson = copyManifest(releaseJson);

    for (const [key, value] of Object.entries(releaseJson.peerDependencies || {})) {
        if (value.includes(placeholder)) {
            const range = value.replace(placeholder, rootPackageJson.requiredAngularVersion);

            context.logger.info(`${key}: ${range}`);
            updatedJson.peerDependencies![key] = range;
        }
    }

    return updatedJson;
}

/**
 * Fails the build if any `{{...}}` placeholder survived substitution.
 *
 * `syncComponentsVersion` only rewrites peers when the package version itself is still a
 * placeholder, so a change in ng-packagr's output could silently leave `{{VERSION}}` in a
 * published `peerDependencies` — an unsatisfiable range that breaks `npm install` for every
 * consumer. Yarn's node-modules linker tolerates it in-repo, so nothing else would notice.
 */
export function assertNoPlaceholders(releaseJson: IPackageJson, packageJsonPath: string) {
    const leaked = Object.entries(releaseJson.peerDependencies || {})
        .concat(Object.entries(releaseJson.dependencies || {}))
        .filter(([, value]) => value.includes('{{'))
        .map(([key, value]) => `${key}: ${value}`);

    if (releaseJson.version?.includes('{{')) {
        leaked.unshift(`version: ${releaseJson.version}`);
    }

    if (leaked.length > 0) {
        throw new Error(
            `❌ Unresolved version placeholders in ${packageJsonPath}:\n  ${leaked.join('\n  ')}\n` +
                'Publishing this would produce an unsatisfiable dependency range.'
        );
    }
}
