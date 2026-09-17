import { readFileSync } from 'fs';
import { join } from 'path';
import { compilePage } from '../compile-page';
import {
    DocsMigrationDocument,
    docsIsMigrationSource,
    docsJoinMigrationBlocks,
    docsSplitMigrationSections
} from './migration-steps';

/**
 * The interactive migration guide reads which release a step lands in out of the guide's own
 * markup. That makes the guide's layout a contract: a step written in a shape the parser does not
 * recognise would silently drop out of the filter. These are the tests that make it fail loudly.
 */
describe('migration guide steps', () => {
    /** The guide as the page compiler splits it, read through the `layout` it hands the blocks to. */
    const sectionsOf = (locale: 'en' | 'ru'): DocsMigrationDocument => {
        const path = join('docs', 'guides', `migration.${locale}.mdx`);
        let document!: DocsMigrationDocument;

        compilePage(readFileSync(path, 'utf8'), {
            path,
            examples: {},
            url: null,
            layout: (blocks) => {
                document = docsSplitMigrationSections(blocks);

                return '';
            }
        });

        return document;
    };

    const ru = sectionsOf('ru');
    const en = sectionsOf('en');

    const stepsOf = (document: typeof ru) => document.sections.filter(({ version }) => version !== null);

    it('should recognise both guides as migration sources and nothing else', () => {
        expect(docsIsMigrationSource('docs/guides/migration.ru.mdx')).toBe(true);
        expect(docsIsMigrationSource(join('docs', 'guides', 'migration.en.mdx'))).toBe(true);
        expect(docsIsMigrationSource('docs/guides/theming.ru.mdx')).toBe(false);
        expect(docsIsMigrationSource('packages/components/button/button.en.mdx')).toBe(false);
    });

    it('should describe the same steps at the same releases in both languages', () => {
        expect(stepsOf(en).map(({ version }) => version)).toEqual(stepsOf(ru).map(({ version }) => version));
    });

    // Naming a release is what makes a section a step, so a step that omitted one would silently
    // stop being filterable. Only the framing may: the upgrade plan opens the guide, the closing
    // note ends it.
    it('should name a release in every section but the framing', () => {
        for (const { sections } of [ru, en]) {
            const framing = sections.filter(({ version }) => version === null);

            expect(framing).toEqual([sections[0], sections[sections.length - 1]]);
        }
    });

    it('should list exactly one upgrade-plan item per step', () => {
        for (const document of [ru, en]) {
            expect(docsJoinMigrationBlocks(document.sections[0].blocks).match(/<li/g)).toHaveLength(
                stepsOf(document).length
            );
        }
    });

    // The guide is one ordered upgrade path, so a reader who follows it top to bottom walks the
    // releases in order. A step filed out of order would also make the upgrade-plan list lie.
    it('should order the steps by release', () => {
        for (const document of [ru, en]) {
            const versions = stepsOf(document).map(({ version }) => version!);

            expect(versions).toEqual([...versions].sort(compareVersions));
        }
    });

    describe('components', () => {
        /** What the reader picks components by: the docs item ids, read from the enum that declares them. */
        const DOCS_ITEM_IDS = new Set(
            [
                ...readFileSync(join('apps', 'docs', 'src', 'app', 'structure.ts'), 'utf8')
                    .match(/export enum DocsStructureItemId \{([^}]*)\}/)![1]
                    .matchAll(/=\s*'([^']+)'/g)
            ].map(([, id]) => id)
        );

        /** Per step: its own components, then its subsections' in order. */
        const componentsOf = (document: typeof ru) =>
            stepsOf(document).map(({ components, subsections }) => [
                components,
                subsections?.items.map(({ components }) => components) ?? null
            ]);

        // A tag the picker cannot offer hides its step from everyone who picked the component.
        it('should name only components the docs site knows', () => {
            const unknown = componentsOf(ru)
                .flat(3)
                .filter((component): component is string => !!component && !DOCS_ITEM_IDS.has(component));

            expect(unknown).toEqual([]);
        });

        it('should tag the same components in both languages', () => {
            expect(componentsOf(en)).toEqual(componentsOf(ru));
        });

        it('should split only the component review into subsections', () => {
            expect(
                stepsOf(ru)
                    .filter(({ subsections }) => subsections)
                    .map(({ id }) => id)
            ).toEqual([
                'ревью-компонентов-(21.0.0)'
            ]);
        });
    });
});

const compareVersions = (a: string, b: string): number => {
    const left = a.split('.').map(Number);
    const right = b.split('.').map(Number);

    return left.reduce((result, part, index) => result || part - right[index], 0);
};
