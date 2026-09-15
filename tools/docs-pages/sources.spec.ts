import { DocsLocale } from '../../apps/docs/src/app/constants/locale';
import { DocsStructureItemTab } from '../../apps/docs/src/app/structure';
import { findRoutesWithoutPage, parsePageSource } from './sources';

describe(findRoutesWithoutPage.name, () => {
    it('lists the overview and examples tabs no page compiles to, and ignores the other routes', () => {
        const routes = [
            '/',
            '/en',
            '/en/components/alert/overview',
            '/en/components/alert/api',
            '/en/components/alert/examples',
            '/ru/components/alert/overview',
            '/en/main/design-tokens/colors',
            '/en/icons',
            '/404'
        ];

        expect(findRoutesWithoutPage(routes, [{ url: '/en/components/alert/overview' }, { url: null }])).toEqual([
            '/en/components/alert/examples',
            '/ru/components/alert/overview'
        ]);
    });
});

describe(parsePageSource.name, () => {
    it('reads the item, the tab and the locale from the file name, and finds the URL of the page', () => {
        expect(parsePageSource('packages/components/alert/alert.ru.mdx')).toEqual({
            path: 'packages/components/alert/alert.ru.mdx',
            id: 'alert',
            tab: DocsStructureItemTab.Overview,
            locale: DocsLocale.Ru,
            url: '/ru/components/alert/overview'
        });
        expect(parsePageSource('packages/components/button-toggle/examples.button-toggle.en.mdx')).toEqual({
            path: 'packages/components/button-toggle/examples.button-toggle.en.mdx',
            id: 'button-toggle',
            tab: DocsStructureItemTab.Examples,
            locale: DocsLocale.En,
            url: '/en/components/button-toggle/examples'
        });
        expect(parsePageSource('docs/guides/installation.en.mdx').url).toBe('/en/main/installation/overview');
    });

    it('leaves the URL out for a page that structure.ts does not list', () => {
        expect(parsePageSource('packages/components/ellipsis-center/ellipsis-center.en.mdx').url).toBeNull();
    });

    it.each([
        ['a file without a locale', 'packages/components/alert/alert.mdx'],
        ['an unsupported locale', 'packages/components/alert/alert.de.mdx']
    ])('rejects %s', (_name, path) => {
        expect(() => parsePageSource(path)).toThrow('expected a file named');
    });
});
