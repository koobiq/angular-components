import semver from 'semver';
import { Version } from '../version-name/parse-version';
import { NpmViewError, npmViewDistTag } from './npm-client';

/**
 * Resolves which npm dist-tag a version should publish under. `npm publish` always moves
 * `latest` to whatever was just published unless told otherwise, so a patch on an older major's
 * maintenance branch would silently regress `latest` after a newer major has already shipped.
 * Older majors get their own `v<major>-lts` tag instead, keyed off the major currently published
 * as `latest` on the registry (not off branch names or publish order). A prerelease never
 * competes for either tag — it always publishes under `next`.
 *
 * @throws {NpmViewError} if the registry can't be queried for a reason other than the package
 * having never been published (E404), if what it reports back isn't a valid semver version, or if
 * publishing under the resolved `v<major>-lts` tag would move that tag backward. None of these are
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

    const ltsTag = `v${version.major}-lts`;
    const currentLtsVersion = readPublishedVersion(packageName, ltsTag);

    if (currentLtsVersion && semver.lt(versionName, currentLtsVersion)) {
        throw new NpmViewError(
            `Publishing ${packageName}@${versionName} under "${ltsTag}" would move that tag backward ` +
                `from the currently published ${currentLtsVersion}. Refusing to publish — check that ` +
                `the right branch/version is being released.`
        );
    }

    return ltsTag;
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
