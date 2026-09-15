import { readFileSync } from 'fs';
import { join } from 'path';
import { configureMarkedGlobally } from '../marked/configuration';
import { DocsMarkdownRenderer } from '../marked/docs-marked-renderer';
import { docsIsMigrationSource, docsSplitMigrationSections } from './migration-steps';

/**
 * The interactive migration guide reads which release a step lands in out of the guide's own
 * markup. That makes the guide's layout a contract: a step written in a shape the parser does not
 * recognise would silently drop out of the filter. These are the tests that make it fail loudly.
 */
describe('migration guide steps', () => {
    const render = (markdown: string): string => {
        const renderer = new DocsMarkdownRenderer();

        return renderer.finalizeOutput(configureMarkedGlobally(renderer).parse(markdown) as string);
    };

    const sectionsOf = (locale: 'en' | 'ru') =>
        docsSplitMigrationSections(render(readFileSync(join('docs', 'guides', `migration.${locale}.md`), 'utf8')));

    const ru = sectionsOf('ru');
    const en = sectionsOf('en');

    const stepsOf = (document: typeof ru) => document.sections.filter(({ number }) => number !== null);

    it('should recognise both guides as migration sources and nothing else', () => {
        expect(docsIsMigrationSource('docs/guides/migration.ru.md')).toBe(true);
        expect(docsIsMigrationSource(join('docs', 'guides', 'migration.en.md'))).toBe(true);
        expect(docsIsMigrationSource('docs/guides/theming.ru.md')).toBe(false);
        expect(docsIsMigrationSource('packages/components/button/button.en.md')).toBe(false);
    });

    it('should number the steps contiguously from 1', () => {
        const numbers = stepsOf(ru).map(({ number }) => number);

        expect(numbers).toEqual(numbers.map((_, index) => index + 1));
    });

    it('should resolve a version for every step', () => {
        for (const document of [ru, en]) {
            expect(stepsOf(document).filter(({ version }) => !version)).toEqual([]);
        }
    });

    it('should describe the same steps at the same versions in both languages', () => {
        const versionsOf = (document: typeof ru) =>
            Object.fromEntries(stepsOf(document).map(({ number, version }) => [number, version]));

        expect(versionsOf(en)).toEqual(versionsOf(ru));
    });

    // Every non-step `###` is framing (the upgrade plan, the closing note). A framing heading that
    // started with a digit would be mistaken for a step, and a step that lost its number would
    // silently stop being filterable.
    it('should leave only framing sections unnumbered', () => {
        for (const document of [ru, en]) {
            const framing = document.sections.filter(({ number }) => number === null);

            expect(framing).toHaveLength(2);
            expect(framing.every(({ version }) => version === null)).toBe(true);
        }
    });

    it('should list exactly one upgrade-plan item per step', () => {
        for (const document of [ru, en]) {
            const plan = document.sections.find(({ html }) => html.includes('<ol'));

            expect(plan?.html.match(/<li/g)).toHaveLength(stepsOf(document).length);
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
});

const compareVersions = (a: string, b: string): number => {
    const left = a.split('.').map(Number);
    const right = b.split('.').map(Number);

    return left.reduce((result, part, index) => result || part - right[index], 0);
};
