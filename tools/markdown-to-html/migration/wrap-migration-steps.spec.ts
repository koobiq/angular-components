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
        const html = heading(3, 'a-step-(21.0.0)');

        expect(transform(html, 'docs/guides/theming.ru.md')).toBe(html);
    });

    it('should wrap a step with the release it lands in', () => {
        const html = run(`${heading(3, 'a-step-(21.0.0)')}<p>body</p>`);

        expect(html).toContain('<section class="docs-migration-section docs-migration-step"');
        expect(html).toContain('data-docs-migration-version="21.0.0"');
        expect(html.match(/<\/section>/g)).toHaveLength(1);
    });

    // The page mounts the reader's "done" mark there: under the heading, ahead of the step's body.
    it('should leave a host for the done mark right under the step heading', () => {
        const html = run(`${heading(3, 'a-step-(21.0.0)')}<p>body</p>`);

        expect(html).toContain('</span></div><div data-docs-migration-done></div><p>body</p>');
    });

    // The title names the release the whole guide starts from, so the filtered page needs a handle
    // on it; and the page hides the intro until a start is picked, so it needs a handle on that too.
    it('should wrap the intro as framing and tag its title', () => {
        const title = '<div id="how-to-upgrade" class="docs-header-link kbq-markdown__h2">t</div>';
        const html = run(`${title}<p>lead</p>${heading(3, 'a-step-(21.0.0)')}`);

        expect(html).toMatch(
            /^<section class="docs-migration-framing docs-migration-intro"><div [^>]*data-docs-migration-title>t<\/div><p>lead<\/p><\/section>/
        );
    });

    // Framing is wrapped like a step but names no release: it earns the same heading gap as
    // everything around it, and the page can drop it on the one range that holds no step at all.
    it('should wrap a framing section without a release', () => {
        const html = run(`${heading(3, 'a-step-(21.0.0)')}${heading(3, 'after-the-migration')}<p>tail</p>`);

        expect(html).toContain('<section class="docs-migration-section docs-migration-framing">');
        expect(html).toContain('after-the-migration');
        expect(html.match(/<section /g)).toHaveLength(2);
        expect(html.match(/data-docs-migration-version=/g)).toHaveLength(1);
    });

    // A step's own `#### Running the migration` / `#### What is fixed automatically` subsections
    // belong to it: hiding the step has to hide everything under it.
    it('should keep a step whole across its own subsections', () => {
        const html = run(`${heading(3, 'a-step-(21.0.0)')}${heading(4, 'running-the-migration')}<p>body</p>`);

        expect(html.match(/<section /g)).toHaveLength(1);
    });

    it('should take the version from an override when the heading cannot spell one', () => {
        const html = run(`${heading(3, 'token-update-(18.6.x)')}<!-- migration-step-version(18.6.0) -->`);

        expect(html).toContain('data-docs-migration-version="18.6.0"');
        expect(html).not.toContain('migration-step-version');
    });

    it('should fail the build for a step with no resolvable release', () => {
        const html = heading(3, 'upgrade-plan') + heading(3, 'a-step') + heading(3, 'after-the-migration');

        expect(() => run(html)).toThrow(/no release for section\(s\) a-step/);
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

        const steps = [...html.matchAll(/docs-migration-step" data-docs-migration-version="([^"]+)"/g)];

        // Every `###` of the guide but its framing: the upgrade plan and the closing note.
        expect(steps).toHaveLength(markdown.match(/^### /gm)!.length - 2);
        expect(steps.every(([, version]) => /^\d+\.\d+\.\d+$/.test(version))).toBe(true);
        // The releases already published: unlike the rest, these cannot change.
        expect(steps.slice(0, 6).map(([, version]) => version)).toEqual([
            '18.5.3',
            '18.6.0',
            '18.22.0',
            '20.0.0',
            '20.2.0',
            '20.2.0'
        ]);
        expect(html.match(/<li data-docs-migration-step=/g)).toHaveLength(steps.length);
        expect(html.match(/<\/div><div data-docs-migration-done><\/div>/g)).toHaveLength(steps.length);
        expect(html.startsWith('<section class="docs-migration-framing docs-migration-intro">')).toBe(true);

        // The component review is the one step made of per-component subsections.
        const components = [
            ...html.matchAll(/class="docs-migration-component" data-docs-migration-component="([^"]+)"/g)
        ];

        expect(components.length).toBeGreaterThan(1);
        expect(components.map(([, component]) => component)).toContain('dl');
        expect(html).not.toContain('<!-- migration-');
    });

    it('should tag a step with the components it concerns', () => {
        const html = run(`${heading(3, 'a-step-(21.0.0)')}<!-- migration-step-components(button, button-group) -->`);

        expect(html).toContain(
            'data-docs-migration-version="21.0.0" data-docs-migration-components="button button-group"'
        );
    });

    it('should leave a step that concerns every project untagged', () => {
        expect(run(heading(3, 'a-step-(21.0.0)'))).not.toContain('data-docs-migration-components');
    });

    // The subsection's slug names its component, unless the directive says otherwise.
    it('should wrap each subsection of a step made of them', () => {
        const html = run(
            `${heading(3, 'review-(21.0.0)')}<!-- migration-component-subsections --><p>intro</p>` +
                `${heading(4, 'alert')}<p>a</p>${heading(4, 'description-list')}<!-- migration-component(dl) --><p>d</p>`
        );

        expect(html).toContain(
            '<p>intro</p><div class="docs-migration-component" data-docs-migration-component="alert">'
        );
        expect(html).toContain('<div class="docs-migration-component" data-docs-migration-component="dl">');
        expect(html.match(/<\/div><div data-docs-migration-done><\/div>/g)).toHaveLength(1);
    });

    it('should fail the build for a step marked as made of subsections that has none', () => {
        const html = `${heading(3, 'review-(21.0.0)')}<!-- migration-component-subsections --><p>intro</p>`;

        expect(() => run(html)).toThrow(/no "####" subsections in review-\(21\.0\.0\)/);
    });
});
