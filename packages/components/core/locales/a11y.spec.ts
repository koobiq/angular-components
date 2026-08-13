import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { kbqA11yLocaleConfigurationProvider, kbqInjectA11yLocaleConfiguration } from './a11y';
import { enUSLocaleData } from './en-US';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from './locale-service';
import { ruRULocaleData } from './ru-RU';

describe('kbqInjectA11yLocaleConfiguration', () => {
    const inject = () => TestBed.runInInjectionContext(kbqInjectA11yLocaleConfiguration);

    it('should fall back to the default locale when no locale service is provided', () => {
        TestBed.configureTestingModule({});

        expect(inject()()).toBe(ruRULocaleData.a11y);
    });

    it('should use the configuration provided through the injection token', () => {
        const configuration = { ...ruRULocaleData.a11y, close: 'Custom close' };

        TestBed.configureTestingModule({ providers: [kbqA11yLocaleConfigurationProvider(configuration)] });

        expect(inject()().close).toBe('Custom close');
    });

    it('should follow the locale service', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
        });

        const configuration = inject();

        expect(configuration().close).toBe(ruRULocaleData.a11y.close);

        TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');

        expect(configuration().close).toBe(enUSLocaleData.a11y.close);
    });

    it('should get a complete section for locale data registered without one', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
        });

        const localeService = TestBed.inject(KBQ_LOCALE_SERVICE);

        // Locale data registered by a consumer may predate the section entirely; the service completes it.
        localeService.addLocale('custom', { select: { hiddenItemsText: '+{{ number }}' } });

        expect(inject()()).toBe(ruRULocaleData.a11y);
    });

    it('should fall back when the locale service hands back no section at all', () => {
        // `KbqLocaleService` itself always completes a section, but applications routinely provide a stand-in
        // under `KBQ_LOCALE_SERVICE` in their own tests — that one is free to return nothing.
        const stub = { changes: new BehaviorSubject('custom'), getParams: () => undefined };

        TestBed.configureTestingModule({ providers: [{ provide: KBQ_LOCALE_SERVICE, useValue: stub }] });

        expect(inject()()).toBe(ruRULocaleData.a11y);
    });
});
