import { TestBed } from '@angular/core/testing';
import { DocsLocale } from '../constants/locale';
import { docsResolveSeo, DocsSeoService } from './seo';

describe(docsResolveSeo.name, () => {
    it('uses the localized Markdown summary and component preview for an overview page', () => {
        const seo = docsResolveSeo('/en/components/alert/overview', DocsLocale.En);

        expect(seo.title).toBe('Alert — Overview · Koobiq');
        expect(seo.description).toBe(
            'Shows important information on a page. Can contain a hint, signal a status change, or indicate a problem.'
        );
        expect(seo.canonicalUrl).toBe('https://koobiq.io/en/components/alert/overview');
        expect(seo.image).toEqual({
            url: 'https://koobiq.io/assets/images/welcome/alerts-light.png',
            alt: 'Alert — Koobiq component',
            width: 400,
            height: 280
        });
    });

    it('generates distinct localized metadata for examples', () => {
        const seo = docsResolveSeo('/ru/components/select/examples?query=ignored', DocsLocale.Ru);

        expect(seo.title).toBe('Select — Примеры · Koobiq');
        expect(seo.description).toContain('Примеры использования Select');
        expect(seo.canonicalUrl).toBe('https://koobiq.io/ru/components/select/examples');
        expect(seo.alternates).toEqual([
            { locale: 'en', url: 'https://koobiq.io/en/components/select/examples' },
            { locale: 'ru', url: 'https://koobiq.io/ru/components/select/examples' }
        ]);
    });

    it('uses the main illustration when an item has no preview', () => {
        const seo = docsResolveSeo('/en/components/button-group/api', DocsLocale.En);

        expect(seo.image.url).toBe('https://koobiq.io/assets/images/koobiq-illustration-wip.png');
        expect(seo.image.width).toBe(2048);
        expect(seo.image.height).toBe(1024);
    });

    it('uses the shared UI translation for a design-token tab title', () => {
        const seo = docsResolveSeo('/ru/main/design-tokens/palette', DocsLocale.Ru);

        expect(seo.title).toBe('Дизайн-токены — Инженерная палитра · Koobiq');
    });

    it('uses a localized Markdown summary added before the examples', () => {
        const seo = docsResolveSeo('/en/components/list/overview', DocsLocale.En);

        expect(seo.description).toBe(
            'List supports groups, single or multiple selection, keyboard navigation, and virtual scrolling.'
        );
    });

    it('marks non-localized utility and error routes as noindex', () => {
        const seo = docsResolveSeo('/404', DocsLocale.En);

        expect(seo.noIndex).toBe(true);
        expect(seo.canonicalUrl).toBeNull();
        expect(seo.alternates).toEqual([]);
    });
});

describe(DocsSeoService.name, () => {
    let service: DocsSeoService;

    beforeEach(() => {
        document.head
            .querySelectorAll('meta[name], meta[property], link[rel="canonical"], link[rel="alternate"]')
            .forEach((element) => element.remove());

        TestBed.configureTestingModule({ providers: [DocsSeoService] });
        service = TestBed.inject(DocsSeoService);
    });

    it('applies SSG-safe metadata and replaces it on navigation', () => {
        service.update('/en/components/alert/overview', DocsLocale.En);

        expect(document.documentElement.lang).toBe('en');
        expect(document.title).toBe('Alert — Overview · Koobiq');
        expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toContain(
            'alerts-light.png'
        );
        expect(document.querySelectorAll('link[rel="alternate"][hreflang]')).toHaveLength(2);

        service.update('/404', DocsLocale.En);

        expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex,follow');
        expect(document.querySelector('link[rel="canonical"]')).toBeNull();
        expect(document.querySelectorAll('link[rel="alternate"][hreflang]')).toHaveLength(0);
    });
});
