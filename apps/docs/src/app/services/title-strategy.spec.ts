import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { DefaultUrlSerializer, Router, RouterStateSnapshot } from '@angular/router';
import { DocsLocale } from '../constants/locale';
import { DocsLocaleService } from './locale';
import { DocsSeoService } from './seo';
import { DocsTitleStrategy } from './title-strategy';

describe(DocsTitleStrategy.name, () => {
    let strategy: DocsTitleStrategy;
    let localeService: DocsLocaleService;
    let seo: { update: jest.Mock };
    let router: { url: string; navigate: jest.Mock; parseUrl: DefaultUrlSerializer['parse'] };

    beforeEach(() => {
        const serializer = new DefaultUrlSerializer();

        seo = { update: jest.fn() };
        router = {
            url: '/en/components/alert/overview',
            navigate: jest.fn(),
            parseUrl: (url) => serializer.parse(url)
        };

        TestBed.configureTestingModule({
            providers: [
                DocsTitleStrategy,
                DocsLocaleService,
                { provide: DocsSeoService, useValue: seo },
                { provide: Router, useValue: router },
                { provide: Location, useValue: { path: () => router.url } }
            ]
        });

        strategy = TestBed.inject(DocsTitleStrategy);
        localeService = TestBed.inject(DocsLocaleService);
    });

    const navigate = (url: string): void => strategy.updateTitle({ url } as RouterStateSnapshot);

    it('synchronizes locale state and metadata when browser history changes the locale segment', () => {
        navigate('/en/components/alert/overview');
        navigate('/ru/components/alert/overview');

        expect(localeService.locale).toBe(DocsLocale.Ru);
        expect(seo.update).toHaveBeenLastCalledWith('/ru/components/alert/overview', DocsLocale.Ru);
    });

    it('updates metadata when locale changes on a route without a locale segment', () => {
        navigate('/404');
        router.url = '/404';
        localeService.setLocale(DocsLocale.Ru);

        expect(seo.update).toHaveBeenLastCalledWith('/404', DocsLocale.Ru);
        expect(router.navigate).not.toHaveBeenCalled();
    });
});
