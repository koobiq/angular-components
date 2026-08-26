import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
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

// The section is read through the shared `kbqInjectLocaleConfiguration`, whose behaviour is covered once in
// `a11y.spec.ts`. What is left to pin here is that the confirmation popover is wired to that helper with its
// own section name and token.
describe('kbqInjectPopoverConfirmLocaleConfiguration', () => {
    const inject = () => TestBed.runInInjectionContext(kbqInjectPopoverConfirmLocaleConfiguration);

    it('should fall back to the default locale when no locale service is provided', () => {
        TestBed.configureTestingModule({});

        expect(inject()()).toBe(ruRULocaleData.popoverConfirm);
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

    it('should apply the override on top of the active locale', () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
                kbqPopoverConfirmLocaleConfigurationProvider({ confirmButtonText: 'Delete' })
            ]
        });

        const configuration = inject();

        expect(configuration().confirmButtonText).toBe('Delete');

        TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');

        // The overridden caption stays pinned; the rest of the section follows the locale.
        expect(configuration().confirmButtonText).toBe('Delete');
        expect(configuration().confirmText).toBe(enUSLocaleData.popoverConfirm.confirmText);
    });

    it('should fall back when the locale service hands back no section at all', () => {
        // `KbqLocaleService` itself always completes a section, but applications routinely provide a stand-in
        // under `KBQ_LOCALE_SERVICE` in their own tests — that one is free to return nothing.
        const stub = { changes: new BehaviorSubject('custom'), getParams: () => undefined };

        TestBed.configureTestingModule({ providers: [{ provide: KBQ_LOCALE_SERVICE, useValue: stub }] });

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
