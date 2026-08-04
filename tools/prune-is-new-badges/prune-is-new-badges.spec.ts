import { DateTime } from 'luxon';
import { pruneIsNewBadges } from './prune-is-new-badges';

describe('pruneIsNewBadges', () => {
    const now = DateTime.fromISO('2026-08-04');

    /** Shaped like `structure.ts`: an item object indented inside a category's `items` array. */
    const item = (...properties: string[]): string => {
        const body = properties.map((property) => `                    ${property}`).join('\n');

        return `                {\n${body}\n                },`;
    };

    it('removes an entry whose date has passed', () => {
        const source = item('id: DocsStructureItemId.Flag,', "isNew: expiresAt('2026-08-03'),", 'hasApi: true');

        const { source: result, pruned } = pruneIsNewBadges(source, now);

        expect(result).toBe(item('id: DocsStructureItemId.Flag,', 'hasApi: true'));
        expect(pruned).toEqual([{ date: '2026-08-03', line: 3 }]);
    });

    it('keeps an entry whose date is still ahead', () => {
        const source = item('id: DocsStructureItemId.Flag,', "isNew: expiresAt('2026-10-07')");

        const { source: result, pruned } = pruneIsNewBadges(source, now);

        expect(result).toBe(source);
        expect(pruned).toEqual([]);
    });

    // `expiresAt` treats "expires today" as expired (`diffNow(...).days > 0` is what shows a badge).
    it('removes an entry expiring on the current day', () => {
        const source = item("isNew: expiresAt('2026-08-04'),", 'hasApi: true');

        const { pruned } = pruneIsNewBadges(source, now);

        expect(pruned).toEqual([{ date: '2026-08-04', line: 2 }]);
    });

    it('drops the preceding trailing comma when the removed entry was the last property', () => {
        const source = item('id: DocsStructureItemId.Flag,', 'hasApi: true,', "isNew: expiresAt('2026-08-03')");

        const { source: result } = pruneIsNewBadges(source, now);

        expect(result).toBe(item('id: DocsStructureItemId.Flag,', 'hasApi: true'));
    });

    it('leaves an unparseable date in place for the structure spec to report', () => {
        const source = item("isNew: expiresAt('2026-13-45'),", 'hasApi: true');

        const { source: result, pruned } = pruneIsNewBadges(source, now);

        expect(result).toBe(source);
        expect(pruned).toEqual([]);
    });

    it('removes every expired entry in the file', () => {
        const source = [
            item("isNew: expiresAt('2025-07-13'),", 'hasApi: true'),
            item("isNew: expiresAt('2026-10-07'),", 'hasApi: true'),
            item("isNew: expiresAt('2026-01-01'),", 'hasApi: true')
        ].join('\n');

        const { source: result, pruned } = pruneIsNewBadges(source, now);

        expect(pruned.map(({ date }) => date)).toEqual(['2025-07-13', '2026-01-01']);
        expect(result).toBe(
            [item('hasApi: true'), item("isNew: expiresAt('2026-10-07'),", 'hasApi: true'), item('hasApi: true')].join(
                '\n'
            )
        );
    });

    it('is a no-op on its own output', () => {
        const source = item("isNew: expiresAt('2025-07-13'),", 'hasApi: true');

        const once = pruneIsNewBadges(source, now).source;
        const twice = pruneIsNewBadges(once, now);

        expect(twice.source).toBe(once);
        expect(twice.pruned).toEqual([]);
    });

    it('preserves CRLF line endings', () => {
        const source = item("isNew: expiresAt('2025-07-13'),", 'hasApi: true').replace(/\n/g, '\r\n');

        const { source: result } = pruneIsNewBadges(source, now);

        expect(result).toBe(item('hasApi: true').replace(/\n/g, '\r\n'));
    });
});
