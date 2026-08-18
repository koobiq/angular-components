import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { kbqInjectLocaleConfiguration } from './configuration';
import { enUSLocaleData } from './en-US';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from './locale-service';
import { ruRULocaleData } from './ru-RU';
import {
    KBQ_SELECT_DEFAULT_LOCALE_CONFIGURATION,
    KBQ_SELECT_LOCALE_CONFIGURATION,
    kbqSelectLocaleConfigurationProvider
} from './select';

describe('KBQ_SELECT_LOCALE_CONFIGURATION', () => {
    const inject = () =>
        TestBed.runInInjectionContext(() => kbqInjectLocaleConfiguration('select', KBQ_SELECT_LOCALE_CONFIGURATION));

    it('should fall back to the default locale when no locale service is provided', () => {
        TestBed.configureTestingModule({});

        expect(KBQ_SELECT_DEFAULT_LOCALE_CONFIGURATION).toBe(ruRULocaleData.select);
        expect(inject()()).toBe(ruRULocaleData.select);
    });

    it('should use the configuration provided through the injection token', () => {
        const configuration = { ...ruRULocaleData.select, selectAll: 'Custom select all' };

        TestBed.configureTestingModule({
            providers: [{ provide: KBQ_SELECT_LOCALE_CONFIGURATION, useValue: configuration }]
        });

        expect(inject()().selectAll).toBe('Custom select all');
    });

    it('should apply the override on top of the active locale', () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
                kbqSelectLocaleConfigurationProvider({ hiddenItemsText: 'and {{ number }} more' })
            ]
        });

        const configuration = inject();

        expect(configuration().hiddenItemsText).toBe('and {{ number }} more');

        TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');

        // The overridden string stays pinned; the rest of the section follows the locale.
        expect(configuration().hiddenItemsText).toBe('and {{ number }} more');
        expect(configuration().selectAll).toBe(enUSLocaleData.select.selectAll);
    });

    it('should follow the locale service', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
        });

        const configuration = inject();

        expect(configuration().selectAll).toBe(ruRULocaleData.select.selectAll);

        TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');

        expect(configuration().selectAll).toBe(enUSLocaleData.select.selectAll);
    });

    it('should get a complete section for locale data registered without one', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
        });

        const localeService = TestBed.inject(KBQ_LOCALE_SERVICE);

        // Locale data registered by a consumer may predate the section entirely; the service completes it.
        localeService.addLocale('custom', { a11y: { close: 'Close' } });

        expect(inject()()).toBe(ruRULocaleData.select);
    });

    it('should fall back when the locale service hands back no section at all', () => {
        // `KbqLocaleService` itself always completes a section, but applications routinely provide a stand-in
        // under `KBQ_LOCALE_SERVICE` in their own tests — that one is free to return nothing.
        const stub = { changes: new BehaviorSubject('custom'), getParams: () => undefined };

        TestBed.configureTestingModule({ providers: [{ provide: KBQ_LOCALE_SERVICE, useValue: stub }] });

        expect(inject()()).toBe(ruRULocaleData.select);
    });
});
