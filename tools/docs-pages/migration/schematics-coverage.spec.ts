import { readFileSync } from 'fs';
import { join } from 'path';
import { compilePage } from '../compile-page';
import { DocsMigrationSection, docsFindMigrationSchematics, docsSplitMigrationSections } from './migration-steps';

/**
 * Every `ng update` migration is a breaking change a consumer has to act on, so every one of them
 * belongs in the migration guide — and at the release it is registered for, or the guide sends the
 * reader to a version that never ran it.
 */
describe('migration guide schematics coverage', () => {
    /**
     * Schematics the guide does not describe yet. Entries may only be removed: the next test fails
     * once a name here turns out to be documented, so the list cannot quietly outlive the gap it
     * records. All three are 21.0.0, i.e. not yet released.
     */
    const UNDOCUMENTED = ['button-truncation', 'filter-bar-rename-action', 'mandatory-peer-dependencies'];

    /**
     * Schematics documented only by a step filed at a later release than the one they are
     * registered for. `alert-signals` shipped in 20.2.0 but is described inside the 21.0.0
     * component review, which says so in prose — deliberately, because the paragraph is aimed at
     * projects that have already stepped past 20.2.0 and have to run it by hand. The consequence
     * is that someone upgrading 20.1 → 20.2 is not shown it.
     */
    const FILED_LATE = ['alert-signals'];

    const registry = JSON.parse(readFileSync(join('packages', 'schematics', 'src', 'migrations.json'), 'utf8')) as {
        schematics: Record<string, { version: string }>;
    };

    const names = Object.keys(registry.schematics);

    /** `20.2.0-0` is how a migration is registered to run on any `20.2.0` prerelease included. */
    const releaseOf = (schematic: string): string => registry.schematics[schematic].version.replace(/-\d+$/, '');

    const stepsOf = (locale: 'en' | 'ru'): DocsMigrationSection[] => {
        const path = join('docs', 'guides', `migration.${locale}.mdx`);
        let steps!: DocsMigrationSection[];

        compilePage(readFileSync(path, 'utf8'), {
            path,
            examples: {},
            url: null,
            layout: (blocks) => {
                steps = docsSplitMigrationSections(blocks).sections.filter(({ version }) => version !== null);

                return '';
            }
        });

        return steps;
    };

    /**
     * Every release a schematic is documented at. A schematic can legitimately be named by more
     * than one step — `v20-upgrade` closes the Angular 20 step and is referenced again from the
     * component review — so coverage is "documented at its registered release", not "named once".
     */
    const documentedIn = (locale: 'en' | 'ru') => {
        const releases = new Map<string, string[]>();

        for (const step of stepsOf(locale)) {
            for (const name of docsFindMigrationSchematics(step.blocks, names)) {
                releases.set(name, [...(releases.get(name) ?? []), step.version!]);
            }
        }

        return releases;
    };

    const ru = documentedIn('ru');
    const en = documentedIn('en');

    it('should describe every registered schematic in both languages', () => {
        const missing = names.filter((name) => !ru.has(name) || !en.has(name));

        expect(missing.sort()).toEqual(UNDOCUMENTED);
    });

    it('should not keep an allow-list entry for a schematic that is now documented', () => {
        expect(UNDOCUMENTED.filter((name) => ru.has(name) && en.has(name))).toEqual([]);
    });

    it('should document each schematic at the release it is registered for', () => {
        const mismatched = [...ru]
            .filter(([name, versions]) => !versions.includes(releaseOf(name)))
            .map(([name]) => name);

        expect(mismatched.sort()).toEqual(FILED_LATE);
    });
});
