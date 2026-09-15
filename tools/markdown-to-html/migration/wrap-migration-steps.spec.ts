import { readFileSync } from 'fs';
import { join } from 'path';
import { configureMarkedGlobally } from '../marked/configuration';
import { DocsMarkdownRenderer } from '../marked/docs-marked-renderer';
import { docsCreateMigrationStepsTransform } from './wrap-migration-steps';

describe('docsCreateMigrationStepsTransform', () => {
    const MIGRATION_SOURCE = 'docs/guides/migration.ru.md';

    const transform = docsCreateMigrationStepsTransform();

    const heading = (depth: 3 | 4, id: string): string =>
        `<div id="${id}" class="docs-header-link kbq-markdown__h${depth}"><span header-link="${id}"></span></div>`;

    const run = (html: string): string => transform(html, MIGRATION_SOURCE);

    it('should leave a document that is not the migration guide untouched', () => {
        const html = heading(3, '1.-a-step-(21.0.0)');

        expect(transform(html, 'docs/guides/theming.ru.md')).toBe(html);
    });

    it('should wrap a numbered step with its ordinal and version', () => {
        const html = run(`${heading(3, '1.-a-step-(21.0.0)')}<p>body</p>`);

        expect(html).toContain('<section class="docs-migration-section docs-migration-step"');
        expect(html).toContain('data-docs-migration-step="1"');
        expect(html).toContain('data-docs-migration-version="21.0.0"');
        expect(html.match(/<\/section>/g)).toHaveLength(1);
    });

    // The title names the release the whole guide starts from, so the filtered page needs a handle
    // on it. It sits in the preamble, which is otherwise passed through untouched.
    it('should tag the document title', () => {
        const title = '<div id="how-to-upgrade" class="docs-header-link kbq-markdown__h2">t</div>';
        const html = run(title + heading(3, '1.-a-step-(21.0.0)'));

        expect(html).toContain('class="docs-header-link kbq-markdown__h2" data-docs-migration-title');
    });

    // Framing is wrapped like a step but carries no step attributes: it earns the same heading gap
    // as everything around it, and the page can drop it on the one range that holds no step at all.
    it('should wrap a framing section without step attributes', () => {
        const html = run(`${heading(3, '1.-a-step-(21.0.0)')}${heading(3, 'after-the-migration')}<p>tail</p>`);

        expect(html).toContain('<section class="docs-migration-section docs-migration-framing">');
        expect(html).toContain('after-the-migration');
        expect(html.match(/<section /g)).toHaveLength(2);
        expect(html.match(/data-docs-migration-step=/g)).toHaveLength(1);
    });

    // A step's own `#### Running the migration` / `#### What is fixed automatically` subsections
    // belong to it: hiding the step has to hide everything under it.
    it('should keep a step whole across its own subsections', () => {
        const html = run(`${heading(3, '1.-a-step-(21.0.0)')}${heading(4, 'running-the-migration')}<p>body</p>`);

        expect(html.match(/<section /g)).toHaveLength(1);
    });

    it('should take the version from an override when the heading cannot spell one', () => {
        const html = run(`${heading(3, '2.-token-update-(18.6.x)')}<!-- migration-step-version(18.6.0) -->`);

        expect(html).toContain('data-docs-migration-version="18.6.0"');
        expect(html).not.toContain('migration-step-version');
    });

    it('should fail the build for a step with no resolvable version', () => {
        expect(() => run(heading(3, '1.-a-step-without-a-version'))).toThrow(/no version for step\(s\) 1/);
    });

    it('should fail the build when the guide has no sections at all', () => {
        expect(() => run('<p>nothing</p>')).toThrow(/layout changed/);
    });

    /**
     * The one case that exercises the real renderer. It is what catches a change to
     * `DocsMarkdownRenderer.heading()`'s output shape, which would otherwise disable the whole
     * filter without failing anything else. Asserted against the guide's own step count rather
     * than a hardcoded one, so adding a step does not also mean editing this spec.
     */
    it('should wrap every step of the real guide', () => {
        const renderer = new DocsMarkdownRenderer();
        const markdown = readFileSync(join('docs', 'guides', 'migration.ru.md'), 'utf8');
        const rendered = renderer.finalizeOutput(configureMarkedGlobally(renderer).parse(markdown) as string);
        const html = docsCreateMigrationStepsTransform()(rendered, MIGRATION_SOURCE);

        const steps = [...html.matchAll(/data-docs-migration-step="(\d+)" data-docs-migration-version="([^"]+)"/g)];

        expect(steps).toHaveLength(markdown.match(/^### \d+\. /gm)!.length);
        expect(steps.map(([, number]) => Number(number))).toEqual(steps.map((_, index) => index + 1));
        expect(steps.every(([, , version]) => /^\d+\.\d+\.\d+$/.test(version))).toBe(true);
        // The releases already published: unlike the rest, these cannot change.
        expect(steps.slice(0, 6).map(([, , version]) => version)).toEqual([
            '18.5.3',
            '18.6.0',
            '18.22.0',
            '20.0.0',
            '20.2.0',
            '20.2.0'
        ]);
        expect(html.match(/<li data-docs-migration-step=/g)).toHaveLength(steps.length);
    });
});
