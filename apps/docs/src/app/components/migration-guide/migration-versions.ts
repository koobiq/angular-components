import { docsDevVersionPlaceholder, docsKoobiqVersion } from '../../version';

/**
 * The version model behind the migration guide's range picker.
 *
 * The guide's steps land at a handful of releases — the *gates*, the only versions where the answer
 * to "what do I have to do" changes. They are read from the guide itself. A major that gates
 * nothing (17, 19) still has to be offerable as a starting point, so those are listed here.
 */

/** A version, split for comparison. `Infinity` in a part means "the top of what came before it". */
export type DocsVersion = readonly number[];

export type DocsMigrationVersionOption = {
    /** Serialized into `?from=` / `?to=`, e.g. `20.2.0` or `19`. */
    value: string;
    version: DocsVersion;
    /** The release as it is written in a `package.json`, e.g. `20.2.0`. */
    label: string;
    /** Not shipped yet, so it cannot be a starting point and is marked as a destination. */
    unreleased: boolean;
};

/** A version option as one of the two pickers offers it, given what the other one already holds. */
export type DocsMigrationVersionChoice = DocsMigrationVersionOption & { disabled: boolean };

/**
 * Majors with no step of their own. A reader on 19.8 needs every step above 19, which plain
 * comparison already gets right — they are listed only so the picker can offer them. The value
 * sits at the *bottom* of the major: someone who says "19.x" has not said which 19, so a step ever
 * filed inside that major has to be shown rather than assumed already applied.
 */
const MAJOR_ONLY_GATES = ['17', '19'] as const;

/** Parses `20.2.0` or `19.x` into comparable parts. */
export const docsParseVersion = (value: string): DocsVersion =>
    value.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : Infinity));

export const docsCompareVersions = (a: DocsVersion, b: DocsVersion): number => {
    const length = Math.max(a.length, b.length);

    for (let index = 0; index < length; index++) {
        const difference = (a[index] ?? 0) - (b[index] ?? 0);

        if (difference !== 0) {
            // `Infinity - Infinity` is NaN, which would read as "equal" rather than as a difference.
            return Number.isNaN(difference) ? 0 : difference;
        }
    }

    return 0;
};

/**
 * The release the site is built from, or `null` in a local dev build where the `{{VERSION}}` token
 * was never replaced — there, nothing can be judged unreleased or every gate would be.
 */
const currentVersion = (): DocsVersion | null =>
    docsKoobiqVersion === docsDevVersionPlaceholder ? null : docsParseVersion(docsKoobiqVersion);

/**
 * Builds the picker's options from the releases the guide's steps are filed at.
 *
 * Each option is the release itself, spelled the way a `package.json` spells it. A reader whose
 * version sits between two gates takes the closest one below it — the convention every version
 * picker uses, and the one the hint under the pickers states outright. Erring low is the safe
 * direction anyway: it shows a step or two more than strictly needed, never fewer.
 */
export const docsBuildMigrationVersionOptions = (stepVersions: readonly string[]): DocsMigrationVersionOption[] => {
    const current = currentVersion();

    return [...new Set([...MAJOR_ONLY_GATES, ...stepVersions])]
        .map((value) => ({ value, version: docsParseVersion(value) }))
        .sort((a, b) => docsCompareVersions(a.version, b.version))
        .map(({ value, version }) => ({
            value,
            version,
            label: gateLabel(value),
            unreleased: !!current && docsCompareVersions(version, current) > 0
        }));
};

/**
 * An upgrade only ever moves forward, so the two pickers constrain each other: a starting release
 * has to sit strictly below the destination, and the destination strictly above the start. Offering
 * the impossible halves as disabled — rather than hiding them, or letting the pair be picked and
 * then explaining the empty result — keeps the whole scale visible and the reason obvious.
 */
export const docsMigrationFromChoices = (
    options: readonly DocsMigrationVersionOption[],
    to: string | null
): DocsMigrationVersionChoice[] => {
    const ceiling = to ? docsParseVersion(to) : null;

    return options.map((option) => ({
        ...option,
        // Nobody is upgrading *from* a release that has not shipped.
        disabled: option.unreleased || (!!ceiling && docsCompareVersions(option.version, ceiling) >= 0)
    }));
};

export const docsMigrationToChoices = (
    options: readonly DocsMigrationVersionOption[],
    from: string | null
): DocsMigrationVersionChoice[] => {
    const floor = from ? docsParseVersion(from) : null;

    return options.map((option, index) => ({
        ...option,
        // Nothing sits below the lowest release, so picking it as a destination can only produce an
        // empty range — and then leave every starting point disabled, with no way back out.
        disabled: index === 0 || (!!floor && docsCompareVersions(option.version, floor) <= 0)
    }));
};

/**
 * A picked value, or `null` when it names nothing the picker offers.
 *
 * The gates are read from the guide, so a release that rewrites a step changes them, and a link
 * shared before that keeps its old value. An unrecognised value must not reach the filter:
 * `docsParseVersion` reads any non-numeric part as `Infinity`, so `?from=v20.2.0` — or a value that
 * simply no longer exists — would hide every step and claim there is nothing to upgrade, while both
 * pickers still showed their placeholder and named no cause.
 */
export const docsMigrationKnownValue = (
    options: readonly DocsMigrationVersionOption[],
    value: string | null
): string | null => (value !== null && options.some((option) => option.value === value) ? value : null);

/**
 * The destination, dropped when it does not sit above the start. A shared link can spell a
 * downgrade (`?from=21.0.0&to=18.5.3`); reading it as "from 21.0.0 onwards" beats showing a pair
 * the pickers themselves refuse to offer.
 */
export const docsMigrationNormalizeTo = (from: string | null, to: string | null): string | null =>
    from && to && docsCompareVersions(docsParseVersion(to), docsParseVersion(from)) <= 0 ? null : to;

/** Whether a step at `version` falls in the half-open range the reader picked. */
export const docsMigrationStepApplies = (
    version: DocsVersion,
    from: DocsVersion | null,
    to: DocsVersion | null
): boolean => (!from || docsCompareVersions(version, from) > 0) && (!to || docsCompareVersions(version, to) <= 0);

/**
 * A gate reads as the release it is. The two majors that carry no step of their own keep an `.x`,
 * because there is no single release to name there and any version of that major gives the same
 * answer.
 */
const gateLabel = (value: string): string => (value.includes('.') ? value : `${value}.x`);
