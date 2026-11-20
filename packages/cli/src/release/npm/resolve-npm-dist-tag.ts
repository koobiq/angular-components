import semver from 'semver';
import type { Version } from '../version-name/parse-version';
import { npmViewDistTag, NpmViewError } from './npm-client';

/**
 * Resolves which npm dist-tag a version should publish under. `npm publish` always moves
 * `latest` to whatever was just published unless told otherwise, so a patch on an older major's
 * maintenance branch would silently regress `latest` after a newer major has already shipped.
 * Older majors get their own `v<major>-lts` tag instead, keyed off the major currently published
 * as `latest` on the registry (not off branch names or publish order). A prerelease never
 * competes for either tag — it always publishes under `next`.
 *
 * If the `v<major>-lts` tag already points at a newer version than the one being published
 * (e.g. `v20-lts` is at `20.4.5` and a `20.3.5` backport is being published), the package is
 * published under a minor-specific `v<major>.<minor>-lts` tag instead. This keeps the backport
 * available on npm without moving the major LTS tag backward.
 *
 * @throws {NpmViewError} if the registry can't be queried for a reason other than the package
 * having never been published (E404), if what it reports back isn't a valid semver version, or if
 * publishing under the resolved tag would move that tag backward. None of these are
 * "nothing published yet" and none should be silently guessed at. Callers should let this fail the
 * publish rather than falling back to a tag.
 */
export function resolveNpmDistTag(packageName: string, version: Version): string {
    const versionName = version.format();

    if (semver.prerelease(versionName)) {
        return 'next';
    }

    const currentLatest = readPublishedVersion(packageName, 'latest');

    // `gte`, not `gt`: republishing the exact version already tagged `latest` (a retry of a
    // failed CI run, for instance) must stay `latest`, not fall through to `v<major>-lts`.
    if (!currentLatest || semver.gte(versionName, currentLatest)) {
        return 'latest';
    }

    const majorLtsTag = `v${version.major}-lts`;
    const currentMajorLtsVersion = readPublishedVersion(packageName, majorLtsTag);

    if (!currentMajorLtsVersion || semver.gte(versionName, currentMajorLtsVersion)) {
        return majorLtsTag;
    }

    // The major LTS tag already points at a newer version (e.g. `v20-lts` is at `20.4.5` while
    // a `20.3.5` backport is being published). Fall back to a minor-specific LTS tag so the
    // backport is still available without moving the major LTS tag backward.
    const minorLtsTag = `v${version.major}.${version.minor}-lts`;
    const currentMinorLtsVersion = readPublishedVersion(packageName, minorLtsTag);

    if (currentMinorLtsVersion && semver.lt(versionName, currentMinorLtsVersion)) {
        throw new NpmViewError(
            `Publishing ${packageName}@${versionName} under "${minorLtsTag}" would move that tag backward ` +
                `from the currently published ${currentMinorLtsVersion}. Refusing to publish — check that ` +
                `the right branch/version is being released.`
        );
    }

    return minorLtsTag;
}

/**
 * Reads the version currently published under `tag`, throwing if the registry answered with
 * something that isn't a parseable semver version — an ambiguous signal that must not be silently
 * treated the same as "nothing published yet" (see `npmViewDistTag`), since that could resolve to
 * `latest` and regress it.
 */
function readPublishedVersion(packageName: string, tag: string): string | null {
    const current = npmViewDistTag(packageName, tag);

    if (current !== null && !semver.valid(current)) {
        throw new NpmViewError(
            `npm view ${packageName} dist-tags.${tag} returned "${current}", which is not a valid semver version.`
        );
    }

    return current;
}
