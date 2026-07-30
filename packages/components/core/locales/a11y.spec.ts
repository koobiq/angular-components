import { TestBed } from '@angular/core/testing';
import { kbqA11yLocaleConfigurationProvider, kbqInjectA11yLocaleConfiguration } from './a11y';
import { enUSLocaleData } from './en-US';
import { esLALocaleData } from './es-LA';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from './locale-service';
import { ptBRLocaleData } from './pt-BR';
import { ruRULocaleData } from './ru-RU';
import { tkTMLocaleData } from './tk-TM';
import { KbqA11yLocaleConfiguration } from './types';

describe('kbqInjectKbqA11yLocaleConfiguration', () => {
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

    it('should fall back when the active locale data carries no a11y section', () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
            ]
        });

        const localeService = TestBed.inject(KBQ_LOCALE_SERVICE);

        // Locale data registered by a consumer may predate the section entirely.
        localeService.addLocale('custom', { select: { hiddenItemsText: '+{{ number }}' } });

        expect(inject()()).toBe(ruRULocaleData.a11y);
    });
});

describe('a11y locale data', () => {
    // A missing accessible name leaves the button nameless in that locale only, which no component
    // test would catch — the section is asserted complete for every shipped locale instead.
    const locales: [string, KbqA11yLocaleConfiguration][] = [
        ['en-US', enUSLocaleData.a11y],
        ['es-LA', esLALocaleData.a11y],
        ['pt-BR', ptBRLocaleData.a11y],
        ['ru-RU', ruRULocaleData.a11y],
        ['tk-TM', tkTMLocaleData.a11y]
    ];

    it.each(locales)('should provide every accessible name for %s', (_, data) => {
        expect(Object.keys(data).sort()).toEqual(Object.keys(ruRULocaleData.a11y).sort());
        Object.values(data).forEach((name) => expect(name.trim()).not.toBe(''));
    });
});
