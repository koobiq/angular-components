import { DateTime } from 'luxon';

/** A single `isNew: expiresAt('…')` entry that was dropped from the source. */
export interface PrunedIsNewBadge {
    /** The ISO date the removed entry carried. */
    date: string;
    /** 1-based line the entry occupied, so a log message can point at it. */
    line: number;
}

export interface PruneIsNewBadgesResult {
    /** The rewritten source. Identical to the input when nothing expired. */
    source: string;
    /** Entries removed, in the order they appeared. */
    pruned: PrunedIsNewBadge[];
}

/**
 * `structure.ts` writes badges as a whole line of its own, always at the same nesting depth, e.g.
 * `                    isNew: expiresAt('2026-10-07')`. Matching the line rather than parsing the
 * module keeps the rewrite lossless: everything else in the file is copied through untouched.
 */
const isNewLine = /^\s*isNew: expiresAt\('([^']*)'\),?\s*$/;

/**
 * Removes every `isNew: expiresAt(...)` entry whose date has already passed.
 *
 * Mirrors the predicate `expiresAt` itself uses, so an entry is dropped exactly when the badge it
 * gates has stopped rendering. Unparseable dates are left in place — `structure.spec` is what
 * reports those, and deleting a line because of a typo would hide the mistake.
 *
 * @param source contents of `apps/docs/src/app/structure.ts`
 * @param now instant to measure expiry against; injected so the result is testable
 */
export const pruneIsNewBadges = (source: string, now: DateTime): PruneIsNewBadgesResult => {
    const lines = source.split('\n');
    const kept: string[] = [];
    const pruned: PrunedIsNewBadge[] = [];

    lines.forEach((line, index) => {
        const date = isNewLine.exec(line)?.[1];
        const expiry = date === undefined ? undefined : DateTime.fromISO(date);

        if (!date || !expiry?.isValid || expiry.diff(now, 'days').days > 0) {
            kept.push(line);

            return;
        }

        pruned.push({ date, line: index + 1 });

        // No trailing comma means the entry was the object's last property, so the preceding line
        // now ends the object and must lose its own comma (prettier runs `trailingComma: 'none'`).
        if (!line.trimEnd().endsWith(',')) {
            const previous = kept.length - 1;

            kept[previous] = kept[previous].replace(/,(\s*)$/, '$1');
        }
    });

    return { source: pruned.length ? kept.join('\n') : source, pruned };
};
