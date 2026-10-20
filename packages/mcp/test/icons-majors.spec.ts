import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCatalog } from '../src/catalog';
import { parseIconRenames } from '../src/indexer/parse-renames';
import { describeRename, resolveRename } from '../src/sources/icon-renames';
import { readIcons } from '../src/sources/icons';
import { toolGetIcon } from '../src/tools';
import type { Icon } from '../src/types';
import { REPO } from './project';

/**
 * Fixtures are real records lifted from the published tarballs of 9.4.1, 10.10.3, 11.7.1 and
 * 12.3.0 — not hand-written ones, which would only prove the parser agrees with my idea of the
 * shape. Each is laid out like the package itself, so these exercise `readIcons` end to end
 * rather than the parser alone.
 */

const MAJORS = [9, 10, 11, 12] as const;

const fixtures = join(import.meta.dirname, 'fixtures', 'icons');

const packageAt = (major: number, version = `${major}.0.0`) => ({
    name: '@koobiq/icons',
    version,
    root: join(fixtures, `v${major}-pkg`),
    major
});

const read = (major: number): Icon[] => {
    const result = readIcons(packageAt(major));

    expect(result.ok, `${result.ok ? '' : result.reason}`).toBe(true);

    return result.ok ? result.data : [];
};

const raw = (major: number): Record<string, { tags: unknown }> =>
    JSON.parse(readFileSync(join(fixtures, `v${major}-pkg`, 'info', 'kbq-icons-info.json'), 'utf-8'));

const byName = (major: number): Map<string, Icon> => new Map(read(major).map((icon) => [icon.name, icon]));

for (const major of MAJORS) {
    test(`major ${major}: reads, with sizes off the name`, () => {
        const icons = byName(major);

        expect(icons.size > 0).toBeTruthy();
        expect(icons.get('aix_16')?.size).toBe(16);
        expect(icons.get('aix_24')?.size).toBe(24);
    });

    test(`major ${major}: duplicate tags are folded`, () => {
        const tags = byName(major).get('aix_16')?.tags ?? [];

        expect(tags.length > 0).toBeTruthy();
        expect(tags, 'the generator emits ["aix","aix","ibm","ibm",…]').toEqual([...new Set(tags)]);
    });

    test(`major ${major}: no degradation note — the major has its own reader`, () => {
        const result = readIcons(packageAt(major));

        expect(result.ok && result.degraded).toBe(undefined);
        expect(result.ok && result.readerMajor).toBe(major);
    });
}

test('majors 9 and 10 ship `tags` as a bare string on some records', () => {
    // 156 of v10's 1066 records look like this; an array-only schema rejects the whole file.
    expect(raw(10)['aix_24']!.tags).toBe('');
    expect(raw(9)['bsd_24']!.tags).toBe('');
    expect(Array.isArray(raw(11)['aix_24']!.tags), 'v11 moved to arrays').toBeTruthy();
    expect(Array.isArray(raw(12)['aix_24']!.tags), 'v12 moved to arrays').toBeTruthy();
});

test('a string `tags` is read as no tags rather than throwing', () => {
    const aix24 = byName(10).get('aix_24');

    expect(aix24, 'aix_24 was dropped').toBeTruthy();
    expect(aix24!.tags.length > 0, 'it should have borrowed tags from aix_16').toBeTruthy();
    expect(aix24!.tagsInherited).toBe(true);
});

test('the rename between 10 and 11 is reflected, not smoothed over', () => {
    expect(byName(10).has('info-circle_16'), 'v10 name missing').toBeTruthy();
    expect(byName(10).has('circle-info_16'), 'v10 must not know the v11 name').toBe(false);

    expect(byName(11).has('circle-info_16'), 'v11 name missing').toBeTruthy();
    expect(byName(11).has('info-circle_16'), 'v11 must not know the v10 name').toBe(false);
});

test('a major above the known range is read forward, and says so', () => {
    const result = readIcons({ ...packageAt(12, '99.0.0'), major: 99 });

    expect(result.ok).toBe(true);
    expect(result.ok && result.readerMajor).toBe(12);
    expect(result.ok ? (result.degraded ?? '') : '').toMatch(/newer than this server knows \(majors 9–12\)/);
});

test('a major below the known range is warned about differently — names changed between majors', () => {
    const result = readIcons({ ...packageAt(9, '8.0.2'), major: 8 });

    expect(result.ok).toBe(true);
    expect(result.ok && result.readerMajor).toBe(9);
    expect(result.ok ? (result.degraded ?? '') : '').toMatch(/older than this server knows/);
    expect(result.ok ? (result.degraded ?? '') : '').toMatch(/icon names changed between majors/);
});

test('the rename map is a clean partition of the 10 / 11 boundary', () => {
    const renames = parseIconRenames(
        readFileSync(join(REPO, 'packages', 'schematics', 'src', 'migrations', 'icons-replacement', 'data.ts'), 'utf-8')
    );

    expect(renames.length).toBe(86);

    const v10 = new Set(byName(10).keys());
    const v11 = new Set(byName(11).keys());
    const inFixture = renames.filter((rename) => v10.has(rename.from) || v11.has(rename.to));

    expect(inFixture.length > 0, 'the fixtures carry none of the renamed names').toBeTruthy();

    for (const rename of inFixture) {
        expect(v10.has(rename.to), `${rename.to} must not exist in v10`).toBe(false);
        expect(v11.has(rename.from), `${rename.from} must not exist in v11`).toBe(false);
    }
});

test('a project before the rename is told the name it actually has', () => {
    const renames = [{ from: 'info-circle_16', to: 'circle-info_16' }];
    const hint = resolveRename('circle-info_16', renames, new Set(byName(10).keys()));

    expect(hint).toEqual({ use: 'info-circle_16', asked: 'circle-info_16', direction: 'not-yet-renamed' });

    const described = describeRename(hint!, '10.10.3');

    expect(described, 'the working name must lead').toMatch(/this icon is "info-circle_16" — use that/);
    expect(described).toMatch(/Names changed in major 11/);
    expect(described).toMatch(/icons-replacement/);
});

test('a project after the rename is told the old name is gone', () => {
    const renames = [{ from: 'info-circle_16', to: 'circle-info_16' }];
    const hint = resolveRename('info-circle_16', renames, new Set(byName(11).keys()));

    expect(hint).toEqual({ use: 'circle-info_16', asked: 'info-circle_16', direction: 'renamed-since' });
    expect(describeRename(hint!, '11.7.1')).toMatch(/was renamed to "circle-info_16"/);
});

test('a name in neither direction gets no invented suggestion', () => {
    const renames = [{ from: 'info-circle_16', to: 'circle-info_16' }];

    expect(resolveRename('dumpster_16', renames, new Set(byName(11).keys()))).toBe(null);
});

test('both sides of the renaming get the name that works in their project', () => {
    const base = loadCatalog(REPO);
    const at = (major: number, version: string) => ({ ...base, icons: readIcons(packageAt(major, version)) });

    // Past the renaming: the old name resolves forward.
    expect(toolGetIcon(at(11, '11.7.1'), { name: 'info-circle_16' })).toMatch(/was renamed to "circle-info_16"/);

    // Before it: current documentation spells the new name, so that is what gets asked for. The
    // answer leads with the name that works here and states the renaming as a fact, not an errand.
    const onTen = toolGetIcon(at(10, '10.10.3'), { name: 'circle-info_16' });

    expect(onTen).toMatch(/this icon is "info-circle_16" — use that/);
    expect(onTen).toMatch(/Names changed in major 11/);
    expect(onTen, 'the usable snippet is still produced').toMatch(/kbq-icon="kbq-info-circle_16"/);
});

test('a layout that no reader recognises still refuses instead of guessing', () => {
    const result = readIcons({ name: '@koobiq/icons', version: '13.0.0', root: '/nowhere', major: 13 });

    expect(result.ok).toBe(false);
    expect(result.ok === false ? result.reason : '').toMatch(/is missing — the package layout changed/);
    expect(result.ok === false ? result.hint : '').toMatch(/majors 9–12/);
});
