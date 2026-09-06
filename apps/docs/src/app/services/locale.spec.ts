import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { DefaultUrlSerializer, Router } from '@angular/router';
import { DocsLocale } from '../constants/locale';
import { DocsLocaleService } from './locale';

describe(DocsLocaleService.name, () => {
    let router: {
        url: string;
        navigate: jest.Mock;
        parseUrl: (url: string) => ReturnType<DefaultUrlSerializer['parse']>;
    };

    const createService = (initialUrl = '/ru'): DocsLocaleService => {
        const serializer = new DefaultUrlSerializer();

        router = { url: initialUrl, navigate: jest.fn(), parseUrl: (url: string) => serializer.parse(url) };

        TestBed.configureTestingModule({
            providers: [
                DocsLocaleService,
                { provide: Router, useValue: router },
                { provide: Location, useValue: { path: () => initialUrl } }
            ]
        });

        return TestBed.inject(DocsLocaleService);
    };

    it('recognizes supported locales only', () => {
        const service = createService();

        expect(service.isSupportedLocale('ru')).toBe(true);
        expect(service.isSupportedLocale('en')).toBe(true);
        expect(service.isSupportedLocale('fr')).toBe(false);
    });

    it('extracts the locale from a URL when present and supported', () => {
        const service = createService();

        expect(service.getLocaleFromURL('/en/components/button')).toBe('en');
        expect(service.getLocaleFromURL('/en?utm=review')).toBe('en');
        expect(service.getLocaleFromURL('/ru#section')).toBe('ru');
        expect(service.getLocaleFromURL('/404')).toBeNull();
    });

    it('synchronizes locale state with Router navigation containing URL extras', () => {
        const service = createService('/en/components/button');

        expect(service.syncLocaleFromURL('/ru?utm=review#section')).toBe(true);
        expect(service.locale).toBe(DocsLocale.Ru);
        expect(service.syncLocaleFromURL('/404')).toBe(false);
        expect(service.locale).toBe(DocsLocale.Ru);
    });

    it('throws on an unsupported locale', () => {
        const service = createService();

        expect(() => service.setLocale('fr' as DocsLocale)).toThrow();
    });

    it('rebuilds the navigation commands preserving query params and fragment', () => {
        const service = createService('/ru/icons?s=arrow#top');

        service.setLocale(DocsLocale.En);

        expect(router.navigate).toHaveBeenCalledWith(['/', 'en', 'icons'], {
            queryParams: { s: 'arrow' },
            fragment: 'top'
        });
    });

    it('switches locale on the locale root preserving query params and fragment', () => {
        const service = createService('/ru?utm=review#section');

        service.setLocale(DocsLocale.En);

        expect(router.navigate).toHaveBeenCalledWith(['/', 'en'], {
            queryParams: { utm: 'review' },
            fragment: 'section'
        });
    });

    it('does not navigate when the current URL has no locale segment', () => {
        const service = createService('/404');

        service.setLocale(DocsLocale.En);

        expect(router.navigate).not.toHaveBeenCalled();
    });
});
