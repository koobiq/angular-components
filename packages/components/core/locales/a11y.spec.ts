import { Component, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { kbqA11yLocaleConfigurationProvider, kbqInjectA11yLocaleConfiguration } from './a11y';
import { kbqInjectLocaleConfiguration, kbqLocaleConfigurationOverrideProvider } from './configuration';
import { enUSLocaleData } from './en-US';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from './locale-service';
import { ruRULocaleData } from './ru-RU';
import { KbqSelectLocaleConfiguration } from './types';

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

    it('should apply the override on top of the active locale', () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
                kbqA11yLocaleConfigurationProvider({ close: 'Dismiss' })
            ]
        });

        const configuration = inject();

        expect(configuration().close).toBe('Dismiss');

        TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');

        // The overridden name stays pinned; the rest of the section follows the locale.
        expect(configuration().close).toBe('Dismiss');
        expect(configuration().save).toBe(enUSLocaleData.a11y.save);
    });

    it('should apply every section overridden in the same providers array', () => {
        // The realistic case is two components' providers side by side, which is why the overrides token is
        // `multi`: a single-value one would let the second provider drop the first.
        const selectConfiguration = new InjectionToken<KbqSelectLocaleConfiguration>('SelectLocaleConfiguration', {
            factory: () => ruRULocaleData.select
        });

        TestBed.configureTestingModule({
            providers: [
                kbqA11yLocaleConfigurationProvider({ close: 'Dismiss' }),
                kbqLocaleConfigurationOverrideProvider('select', { selectAll: 'Everything' })
            ]
        });

        const select = TestBed.runInInjectionContext(() => kbqInjectLocaleConfiguration('select', selectConfiguration));

        expect(inject()().close).toBe('Dismiss');
        expect(select().selectAll).toBe('Everything');
    });

    it('should apply sections overridden at different levels of the injector tree', () => {
        // Scoping an override to a component is what the localization guide recommends, and every section
        // shares one `multi` token — which Angular resolves from the nearest injector that has any entry
        // for it, without merging the levels above.
        const selectConfiguration = new InjectionToken<KbqSelectLocaleConfiguration>('SelectLocaleConfiguration', {
            factory: () => ruRULocaleData.select
        });

        @Component({
            selector: 'scoped-override',
            template: '',
            providers: [kbqLocaleConfigurationOverrideProvider('select', { selectAll: 'Everything' })]
        })
        class ScopedOverride {
            readonly a11y = kbqInjectA11yLocaleConfiguration();
            readonly select = kbqInjectLocaleConfiguration('select', selectConfiguration);
        }

        @Component({
            selector: 'root-override',
            imports: [ScopedOverride],
            template: '<scoped-override />',
            providers: [kbqA11yLocaleConfigurationProvider({ close: 'Dismiss' })]
        })
        class RootOverride {}

        TestBed.configureTestingModule({});

        const fixture = TestBed.createComponent(RootOverride);

        fixture.detectChanges();

        const scoped: ScopedOverride = fixture.debugElement.query(By.directive(ScopedOverride)).componentInstance;

        expect(scoped.select().selectAll).toBe('Everything');
        expect(scoped.a11y().close).toBe('Dismiss');
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
