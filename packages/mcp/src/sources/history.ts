import { compare } from '../semver.js';
import type { Guide } from '../types.js';

/**
 * Reading `data/history.json` for one upgrade.
 *
 * The file holds 4619 changes across 60 releases, so the work here is almost entirely about not
 * returning them. An upgrade from 18.4.0 to 19.0.0 touches 2930 of them across 61 entry points;
 * printed in full that is tens of thousands of tokens, and the three lines the reader needed are
 * somewhere inside. What matters first is what was *removed*, because that is what stops compiling.
 */

export type MemberChange = {
    symbol: string;
    member?: string;
    change: 'added' | 'removed' | 'updated';
    from?: string;
    to?: string;
};

export type ApiHistory = Record<string, Record<string, MemberChange[]>>;

export type EntryPointImpact = {
    entryPoint: string;
    removed: number;
    updated: number;
    added: number;
};

export type UpgradeRange = {
    from: string;
    to: string;
    releases: string[];
    /** Worst first: an entry point that lost API outranks one that only gained it. */
    impact: EntryPointImpact[];
    totals: { removed: number; updated: number; added: number };
};

/** Releases strictly after `from`, up to and including `to`. The `from` release is already installed. */
export const releasesBetween = (history: ApiHistory, from: string, to: string): string[] =>
    Object.keys(history)
        .filter((version) => compare(version, from) > 0 && compare(version, to) <= 0)
        .sort(compare);

/**
 * Drops what no consumer ever wrote.
 *
 * The history is diffed from the API Extractor reports, which include the compiler's own fields:
 * `ngAcceptInputType_multiline`, `ɵfac`, `ɵcmp`. They appear and vanish as Angular changes how it
 * emits, and listing them as removed API is worse than noise — it reports a break where nothing
 * broke. 72 of the 728 removals in the file are these, a tenth of the number a reader would
 * otherwise plan an upgrade around.
 */
export const meaningful = (change: MemberChange): boolean =>
    !/^(?:ngAcceptInputType_|ɵ|_)/.test(change.member ?? '') && !change.symbol.startsWith('ɵ');

export const summarise = (history: ApiHistory, from: string, to: string): UpgradeRange => {
    const releases = releasesBetween(history, from, to);
    const byEntryPoint = new Map<string, EntryPointImpact>();
    const totals = { removed: 0, updated: 0, added: 0 };

    for (const version of releases) {
        for (const [entryPoint, changes] of Object.entries(history[version] ?? {})) {
            const real = changes.filter(meaningful);

            if (real.length === 0) continue;

            const impact = byEntryPoint.get(entryPoint) ?? { entryPoint, removed: 0, updated: 0, added: 0 };

            for (const change of real) {
                impact[change.change]++;
                totals[change.change]++;
            }

            byEntryPoint.set(entryPoint, impact);
        }
    }

    const impact = [...byEntryPoint.values()].sort(
        (a, b) => b.removed - a.removed || b.updated - a.updated || a.entryPoint.localeCompare(b.entryPoint)
    );

    return { from, to, releases, impact, totals };
};

export type DatedChange = MemberChange & { version: string };

/** Every change to one entry point across the range, oldest release first. */
export const changesFor = (history: ApiHistory, range: UpgradeRange, entryPoint: string): DatedChange[] =>
    range.releases.flatMap((version) =>
        (history[version]?.[entryPoint] ?? []).filter(meaningful).map((change) => ({ ...change, version }))
    );

/**
 * Sections of the migration guide that cover this range.
 *
 * Headings carry the release in parentheses — `Обновление токенов (18.6.x)`, `Filter-bar upgrade
 * (20.2.0)` — or after "to"/"до". Two of them carry no version at all: `План обновления` and
 * `Обновление до Angular 20`. Those are returned separately rather than guessed at, because a
 * heading dated wrongly sends the reader to instructions for a release they are not on.
 */
export const migrationSections = (
    guide: Guide | null,
    range: UpgradeRange
): { dated: { heading: string; version: string }[]; undated: string[] } => {
    const dated: { heading: string; version: string }[] = [];
    const undated: string[] = [];

    // A heading inherits the release of the nearest shallower one. `#### Running the migration`
    // means nothing alone; under `### Filter-bar upgrade (20.2.0)` it means 20.2.0, and the guide
    // repeats that same subheading under three different releases.
    const inherited = new Map<number, string | null>();

    for (const section of guide?.sections ?? []) {
        const own =
            /\((\d+\.\d+(?:\.\d+)?)(?:\.x)?\)/.exec(section.heading)?.[1] ??
            /\((\d+\.\d+)\.x\)/.exec(section.heading)?.[1] ??
            /(?:to|до)\s+(\d+\.\d+\.\d+)/i.exec(section.heading)?.[1] ??
            null;

        let version = own;

        if (!version) {
            for (let above = section.depth - 1; above >= 2; above--) {
                const ancestor = inherited.get(above);

                if (ancestor) {
                    version = ancestor;
                    break;
                }
            }
        }

        inherited.set(section.depth, version);

        // Deeper levels belonged to the previous parent; they must not inherit through it.
        for (const level of [...inherited.keys()]) if (level > section.depth) inherited.delete(level);

        if (!version) {
            // Only top-level headings are worth surfacing as undated: a nameless subsection under
            // an undated parent adds noise without adding a place to look.
            if (section.depth <= 3) undated.push(section.heading);
            continue;
        }

        // `18.6.x` parses as 18.6.0, which is the first release it could apply to. Only headings
        // that carry the version themselves are listed; their subsections are reached by reading
        // the parent, and listing all of them would triple the answer.
        if (own && compare(version, range.from) > 0 && compare(version, range.to) <= 0) {
            dated.push({ heading: section.heading, version });
        }
    }

    return { dated, undated };
};
