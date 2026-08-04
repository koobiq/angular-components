import { readFileSync, writeFileSync } from 'fs';
import { DateTime } from 'luxon';
import { join } from 'path';
import { pruneIsNewBadges } from './prune-is-new-badges';

/**
 * Deletes `isNew: expiresAt(...)` entries whose date has already passed from the docs structure.
 *
 * An expired badge stops rendering on its own, so nothing is broken while the line survives — it
 * just accumulates. Asserting on it in a unit test would instead fail CI on a calendar date, for
 * everyone, over a change nobody made; this runs from `release:stage:commit` so the cleanup lands in
 * the release commit that is reviewed anyway.
 */
const structurePath = join(process.cwd(), 'apps/docs/src/app/structure.ts');
const timeLabel = 'Runtime';

console.time(timeLabel);

try {
    console.info('🚀 Pruning expired isNew badges');

    const { source, pruned } = pruneIsNewBadges(readFileSync(structurePath, 'utf8'), DateTime.now());

    if (pruned.length === 0) {
        console.info('✅ No expired isNew badges found!');
    } else {
        writeFileSync(structurePath, source);

        pruned.forEach(({ date, line }) => console.info(`   • removed isNew: expiresAt('${date}') (line ${line})`));
        console.info(`✅ ${pruned.length} expired isNew badge(s) removed from structure.ts!`);
    }
} catch (error) {
    console.error('❌ Error occurred while pruning expired isNew badges! Details:\n', error);
    process.exitCode = 1;
} finally {
    console.timeEnd(timeLabel);
}
