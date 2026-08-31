import { Version, parseVersionName } from '../version-name/parse-version';
import { npmViewDistTag } from './npm-client';

/** Positive when `a` outranks `b`, negative when `b` outranks `a`, zero when equal. */
function compareVersions(a: Version, b: Version): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    if (a.patch !== b.patch) return a.patch - b.patch;
    // A prerelease always ranks below its own stable release.
    if (!a.prereleaseLabel !== !b.prereleaseLabel) return a.prereleaseLabel ? -1 : 1;

    return (a.prereleaseNumber ?? 0) - (b.prereleaseNumber ?? 0);
}

/**
 * Resolves which npm dist-tag a version should publish under. `npm publish` always moves
 * `latest` to whatever was just published unless told otherwise, so a patch on an older major's
 * maintenance branch would silently regress `latest` after a newer major has already shipped.
 * Older majors get their own `v<major>-lts` tag instead, keyed off the major currently published
 * as `latest` on the registry (not off branch names or publish order).
 *
 * @throws {NpmViewError} if the registry can't be queried for a reason other than the package
 * having never been published (E404) — a network blip, registry 5xx, or auth error must not be
 * silently treated as "nothing published yet", or it could regress `latest`. Callers should let
 * this fail the publish rather than falling back to a tag.
 */
export function resolveNpmDistTag(packageName: string, version: Version): string {
    const currentLatestRaw = npmViewDistTag(packageName, 'latest');
    const currentLatest = currentLatestRaw ? parseVersionName(currentLatestRaw) : null;

    // `>= 0`, not `> 0`: republishing the exact version already tagged `latest` (a retry of a
    // failed CI run, for instance) must stay `latest`, not fall through to `v<major>-lts`.
    if (!currentLatest || compareVersions(version, currentLatest) >= 0) {
        return 'latest';
    }

    return `v${version.major}-lts`;
}
