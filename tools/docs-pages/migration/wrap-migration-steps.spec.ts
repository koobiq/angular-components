import { readFileSync } from 'fs';
import { join } from 'path';
import { compilePage } from '../compile-page';
import { docsMigrationGuideLayout } from './wrap-migration-steps';

describe('docsMigrationGuideLayout', () => {
    const PATH = 'docs/guides/migration.ru.mdx';
    const RELEASE = '20.3.0';
    const INTRO = `<section class="docs-migration-framing docs-migration-intro" data-docs-migration-release="${RELEASE}">`;

    const compile = (source: string): string =>
        compilePage(source, { path: PATH, examples: {}, url: null, layout: docsMigrationGuideLayout(PATH, RELEASE) })
            .template;

    it('should wrap a step with the release it lands in', () => {
        const template = compile('### A step (21.0.0)\n\nbody');

        expect(template).toContain(
            '<section class="docs-migration-section docs-migration-step" data-docs-migration-version="21.0.0">'
        );
        // The intro's and the step's.
        expect(template.match(/<\/section>/g)).toHaveLength(2);
    });

    // The page mounts the reader's "done" mark there: under the heading, ahead of the step's body.
    it('should leave a host for the done mark right under the step heading', () => {
        expect(compile('### A step (21.0.0)\n\nbody')).toContain(
            '</h3>\n<div data-docs-migration-done></div>\n<p class="kbq-markdown__p">body</p>'
        );
    });

    // The title names the release the whole guide starts from, so the filtered page needs a handle
    // on it; and the page hides the intro until a start is picked, so it needs a handle on that too.
    it('should wrap the intro as framing and tag its title', () => {
        const template = compile('## How to upgrade\n\nlead\n\n### A step (21.0.0)');

        expect(template.startsWith(INTRO)).toBe(true);
        expect(template).toMatch(
            /^<section [^>]*><h2 [^>]*data-docs-migration-title>How to upgrade<\/h2>\n<p class="kbq-markdown__p">lead<\/p><\/section>/
        );
    });

    // The pickers offer the release and mark the ones above it, so the page needs it with or without a preamble.
    it('should stamp the release on the intro', () => {
        expect(compile('### A step (21.0.0)').startsWith(`${INTRO}</section>`)).toBe(true);
    });

    // Framing is wrapped like a step but names no release: it earns the same heading gap as
    // everything around it, and the page can drop it on the one range that holds no step at all.
    it('should wrap a framing section without a release', () => {
        const template = compile('### A step (21.0.0)\n\n### After the migration\n\ntail');

        expect(template).toContain('<section class="docs-migration-section docs-migration-framing">');
        expect(template).toContain('after-the-migration');
        expect(template.match(/<section class="docs-migration-section /g)).toHaveLength(2);
        expect(template.match(/data-docs-migration-version=/g)).toHaveLength(1);
    });

    it('should tag each upgrade-plan item with the step it points at', () => {
        const template = compile('### Upgrade plan\n\n- one\n- two\n\n### Step one (18.6.0)\n\n### Step two (20.2.0)');

        expect(template.match(/<li [^>]*>/g)).toEqual([
            '<li data-docs-migration-step="step-one-(18.6.0)" class="kbq-markdown__li">',
            '<li data-docs-migration-step="step-two-(20.2.0)" class="kbq-markdown__li">'
        ]);
    });

    // A step's own `#### Running the migration` / `#### What is fixed automatically` subsections
    // belong to it: hiding the step has to hide everything under it.
    it('should keep a step whole across its own subsections', () => {
        expect(
            compile('### A step (21.0.0)\n\n#### Running the migration\n\nbody').match(
                /<section class="docs-migration-section /g
            )
        ).toHaveLength(1);
    });

    it('should take the version from an override when the heading cannot spell one', () => {
        const template = compile('### Token update (18.6.x)\n\n{/* migration-step-version(18.6.0) */}');

        expect(template).toContain('data-docs-migration-version="18.6.0"');
        expect(template).not.toContain('migration-step-version');
    });

    it('should fail the build for a step with no resolvable release', () => {
        expect(() => compile('### Upgrade plan\n\n### A step\n\n### After the migration')).toThrow(
            /no release for section\(s\) a-step/
        );
    });

    it('should fail the build when the guide has no sections at all', () => {
        expect(() => compile('nothing')).toThrow(/layout changed/);
    });

    // A misspelled directive is still a valid comment, so nothing else would notice it doing nothing.
    it('should fail the build for a directive it does not know', () => {
        expect(() => compile('### A step (21.0.0)\n\n{/* migration-step-component(button) */}')).toThrow(
            /unknown directive\(s\) migration-step-component\(button\)/
        );
    });

    /**
     * The one case that compiles the real guide. It is what catches a change to the compiler's
     * output shape, which would otherwise disable the whole filter without failing anything else.
     * Asserted against the guide's own step count rather than a hardcoded one, so adding a step does
     * not also mean editing this spec.
     */
    it('should wrap every step of the real guide', () => {
        const source = readFileSync(join('docs', 'guides', 'migration.ru.mdx'), 'utf8');
        const template = compile(source);

        const steps = [...template.matchAll(/docs-migration-step" data-docs-migration-version="([^"]+)"/g)];

        // Every `###` of the guide but its framing: the upgrade plan and the closing note.
        expect(steps).toHaveLength(source.match(/^### /gm)!.length - 2);
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
        expect(template.match(/<li data-docs-migration-step=/g)).toHaveLength(steps.length);
        expect(template.match(/<\/h3>\n<div data-docs-migration-done><\/div>/g)).toHaveLength(steps.length);
        expect(template.startsWith(INTRO)).toBe(true);

        // The component review is the one step made of per-component subsections.
        const components = [
            ...template.matchAll(/class="docs-migration-component" data-docs-migration-components="([^"]+)"/g)
        ];

        expect(components.length).toBeGreaterThan(1);
        expect(components.map(([, component]) => component)).toContain('dl');
    });

    it('should tag a step with the components it concerns', () => {
        expect(compile('### A step (21.0.0)\n\n{/* migration-step-components(button, button-group) */}')).toContain(
            'data-docs-migration-version="21.0.0" data-docs-migration-components="button button-group"'
        );
    });

    it('should leave a step that concerns every project untagged', () => {
        expect(compile('### A step (21.0.0)')).not.toContain('data-docs-migration-components');
    });

    // The subsection's slug names its component, unless the directive says otherwise.
    it('should wrap each subsection of a step made of them', () => {
        const template = compile(
            [
                '### Review (21.0.0)',
                '{/* migration-component-subsections */}',
                'intro',
                '#### Alert',
                'a',
                '#### Description list',
                '{/* migration-subsection-components(dl) */}',
                'd',
                '#### Tags',
                '{/* migration-subsection-components(tag, tag-list) */}',
                't'
            ].join('\n\n')
        );

        expect(template).toContain(
            '<p class="kbq-markdown__p">intro</p>\n<div class="docs-migration-component" data-docs-migration-components="alert">'
        );
        expect(template).toContain('<div class="docs-migration-component" data-docs-migration-components="dl">');
        expect(template).toContain(
            '<div class="docs-migration-component" data-docs-migration-components="tag tag-list">'
        );
        expect(template).not.toContain('migration-subsection-components');
        expect(template.match(/<div data-docs-migration-done><\/div>/g)).toHaveLength(1);
    });

    it('should fail the build for a step marked as made of subsections that has none', () => {
        expect(() => compile('### Review (21.0.0)\n\n{/* migration-component-subsections */}\n\nintro')).toThrow(
            /no "####" subsections in review-\(21\.0\.0\)/
        );
    });
});
