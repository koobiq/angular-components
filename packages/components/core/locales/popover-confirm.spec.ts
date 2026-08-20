import { TestBed } from '@angular/core/testing';
import { enUSLocaleData } from './en-US';
import { esLALocaleData } from './es-LA';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from './locale-service';
import {
    kbqInjectPopoverConfirmLocaleConfiguration,
    kbqPopoverConfirmLocaleConfigurationProvider
} from './popover-confirm';
import { ptBRLocaleData } from './pt-BR';
import { ruRULocaleData } from './ru-RU';
import { tkTMLocaleData } from './tk-TM';
import { KbqPopoverConfirmLocaleConfiguration } from './types';

describe('kbqInjectPopoverConfirmLocaleConfiguration', () => {
    const inject = () => TestBed.runInInjectionContext(kbqInjectPopoverConfirmLocaleConfiguration);

    it('should fall back to the default locale when no locale service is provided', () => {
        TestBed.configureTestingModule({});

        expect(inject()()).toBe(ruRULocaleData.popoverConfirm);
    });

    it('should use the configuration provided through the injection token', () => {
        const configuration = { ...ruRULocaleData.popoverConfirm, confirmButtonText: 'Custom' };

        TestBed.configureTestingModule({
            providers: [kbqPopoverConfirmLocaleConfigurationProvider(configuration)]
        });

        expect(inject()().confirmButtonText).toBe('Custom');
    });

    it('should follow the locale service', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
        });

        const configuration = inject();

        expect(configuration().confirmText).toBe(ruRULocaleData.popoverConfirm.confirmText);

        TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');

        expect(configuration().confirmText).toBe(enUSLocaleData.popoverConfirm.confirmText);
    });

    it('should fall back when the active locale data carries no popoverConfirm section', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
        });

        const localeService = TestBed.inject(KBQ_LOCALE_SERVICE);

        // Locale data registered by a consumer may predate the section entirely. `addLocale` only registers
        // it — `setLocale` is what makes it the active one the configuration is read from.
        localeService.addLocale('custom', { select: { hiddenItemsText: '+{{ number }}' } });
        localeService.setLocale('custom');

        expect(inject()()).toBe(ruRULocaleData.popoverConfirm);
    });
});

describe('popoverConfirm locale data', () => {
    // A missing string leaves the confirmation popover rendering `undefined` in that locale only, which no
    // component test would catch — the section is asserted complete for every shipped locale instead.
    const locales: [string, KbqPopoverConfirmLocaleConfiguration][] = [
        ['en-US', enUSLocaleData.popoverConfirm],
        ['es-LA', esLALocaleData.popoverConfirm],
        ['pt-BR', ptBRLocaleData.popoverConfirm],
        ['ru-RU', ruRULocaleData.popoverConfirm],
        ['tk-TM', tkTMLocaleData.popoverConfirm]
    ];

    it.each(locales)('should provide every string for %s', (_, data) => {
        expect(Object.keys(data).sort()).toEqual(Object.keys(ruRULocaleData.popoverConfirm).sort());
        Object.values(data).forEach((text) => expect(text.trim()).not.toBe(''));
    });
});
