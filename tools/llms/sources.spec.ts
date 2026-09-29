import { createExampleResolver, resolveSiteUrl } from './sources';

describe(resolveSiteUrl.name, () => {
    it('leads a link to an item, in any locale, to its Markdown, which holds every tab of it in English', () => {
        expect(resolveSiteUrl('/en/components/select/overview#search')).toBe(
            'https://koobiq.io/en/components/select.md#search'
        );
        expect(resolveSiteUrl('/ru/main/design-tokens/colors')).toBe('https://koobiq.io/en/main/design-tokens.md');
    });

    it('reads a link without the leading slash from the root of the site, as its base href does', () => {
        expect(resolveSiteUrl('en/components/button')).toBe('https://koobiq.io/en/components/button.md');
    });

    it('gives any other link within the site the origin of the site', () => {
        expect(resolveSiteUrl('/en/icons')).toBe('https://koobiq.io/en/icons');
        expect(resolveSiteUrl('/en/components/unknown')).toBe('https://koobiq.io/en/components/unknown');
    });

    it('leaves links elsewhere and within the page as they are', () => {
        expect(resolveSiteUrl('https://semver.org/')).toBe('https://semver.org/');
        expect(resolveSiteUrl('mailto:team@koobiq.io')).toBe('mailto:team@koobiq.io');
        expect(resolveSiteUrl('#size')).toBe('#size');
    });
});

describe(createExampleResolver.name, () => {
    it('gives a document the file its examples share with the first of them only', () => {
        const resolveExample = createExampleResolver();
        const names = (id: string): string[] => resolveExample(id).files.map(({ name }) => name);

        expect(names('timezone-overview')).toContain('../timezone-data.ts');
        expect(names('timezone-search-overview')).not.toContain('../timezone-data.ts');
        expect(names('timezone-search-overview')).toContain('timezone-search-overview-example.ts');
    });

    it('leaves out the JSDoc that only carries the title the caption already shows', () => {
        const [primary] = createExampleResolver()('alert-overview').files;

        expect(primary.content).not.toContain('@title');
    });

    it('fails on an example the catalogue does not have', () => {
        expect(() => createExampleResolver()('missing')).toThrow('Unknown example "missing"');
    });
});
