import { ChangeDetectionStrategy, Component, inject, Provider, signal, ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KBQ_A11Y_LOCALE_CONFIGURATION, kbqA11yLocaleConfigurationProvider } from './a11y';
import { kbqInjectLocaleConfiguration, kbqLocaleConfigurationOverrideProvider } from './configuration';
import { enUSLocaleData } from './en-US';
import { KbqLocaleOverridesDirective } from './locale-overrides.directive';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from './locale-service';
import { ruRULocaleData } from './ru-RU';
import { KBQ_SELECT_LOCALE_CONFIGURATION } from './select';
import { KbqPartialLocaleData } from './types';

/** Stands in for a leaf that renders an accessible name of its own, the way `KbqCleaner` does. */
@Component({
    selector: 'localized-leaf',
    template: '{{ a11y().clear }}',
    changeDetection: ChangeDetectionStrategy.OnPush
})
class LocalizedLeaf {
    readonly a11y = kbqInjectLocaleConfiguration('a11y', KBQ_A11Y_LOCALE_CONFIGURATION);
}

/** Stands in for a localized component applying the carrier the way every one of them will. */
@Component({
    selector: 'localized-host',
    imports: [LocalizedLeaf],
    template: '{{ select().selectAll }}<localized-leaf />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ]
})
class LocalizedHost {
    readonly select = kbqInjectLocaleConfiguration('select', KBQ_SELECT_LOCALE_CONFIGURATION);
}

describe('KbqLocaleOverridesDirective', () => {
    const localeServiceProvider: Provider = { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService };
    const textOf = (fixture: ComponentFixture<unknown>, selector: string): string =>
        fixture.debugElement.query(By.css(selector)).nativeElement.textContent.trim();

    describe('applied through hostDirectives', () => {
        @Component({
            imports: [LocalizedHost],
            template: '<localized-host [localeOverrides]="configuration()" />'
        })
        class TestApp {
            readonly configuration = signal<KbqPartialLocaleData | undefined>(undefined);
        }

        const createComponent = (providers: Provider[] = []): ComponentFixture<TestApp> => {
            TestBed.configureTestingModule({ providers });

            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            return fixture;
        };

        it('should override the strings of a single instance', () => {
            const fixture = createComponent();

            expect(textOf(fixture, 'localized-host')).toContain(ruRULocaleData.select.selectAll);

            fixture.componentInstance.configuration.set({ select: { selectAll: 'Everything' } });
            fixture.detectChanges();

            expect(textOf(fixture, 'localized-host')).toContain('Everything');
        });

        it('should leave the keys it does not mention following the locale', () => {
            const fixture = createComponent([localeServiceProvider]);

            fixture.componentInstance.configuration.set({ a11y: { close: 'Dismiss' } });
            fixture.detectChanges();

            TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');
            fixture.detectChanges();

            expect(textOf(fixture, 'localized-host')).toContain(enUSLocaleData.select.selectAll);
        });

        it('should win over an override registered through a provider', () => {
            const fixture = createComponent([
                kbqLocaleConfigurationOverrideProvider('select', { selectAll: 'Provided' })
            ]);

            expect(textOf(fixture, 'localized-host')).toContain('Provided');

            fixture.componentInstance.configuration.set({ select: { selectAll: 'Bound' } });
            fixture.detectChanges();

            expect(textOf(fixture, 'localized-host')).toContain('Bound');
        });

        it('should not hide an override an ancestor registered for another section', () => {
            const fixture = createComponent([kbqA11yLocaleConfigurationProvider({ clear: 'Wipe' })]);

            fixture.componentInstance.configuration.set({ select: { selectAll: 'Everything' } });
            fixture.detectChanges();

            expect(textOf(fixture, 'localized-leaf')).toBe('Wipe');
        });

        it('should reach a sub-component rendered inside the host', () => {
            const fixture = createComponent();

            fixture.componentInstance.configuration.set({ a11y: { clear: 'Wipe' } });
            fixture.detectChanges();

            expect(textOf(fixture, 'localized-leaf')).toBe('Wipe');
        });

        it('should leave an unbound section referentially identical to the locale data', () => {
            const fixture = createComponent([localeServiceProvider]);
            const host: LocalizedHost = fixture.debugElement.query(By.directive(LocalizedHost)).componentInstance;

            fixture.componentInstance.configuration.set({ a11y: { clear: 'Wipe' } });
            fixture.detectChanges();

            expect(host.select()).toBe(ruRULocaleData.select);
        });
    });

    describe('read()', () => {
        /** Stands in for a localized component that reads its strings through the carrier it applies. */
        @Component({
            selector: 'localized-reader',
            template: '{{ select().selectAll }}',
            changeDetection: ChangeDetectionStrategy.OnPush,
            hostDirectives: [
                { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
            ]
        })
        class LocalizedReader {
            readonly carrier = inject(KbqLocaleOverridesDirective, { host: true });
            readonly select = this.carrier.read('select', KBQ_SELECT_LOCALE_CONFIGURATION);

            readSelect() {
                return this.carrier.read('select', KBQ_SELECT_LOCALE_CONFIGURATION);
            }

            readA11y() {
                return this.carrier.read('a11y', KBQ_A11Y_LOCALE_CONFIGURATION);
            }
        }

        @Component({
            imports: [LocalizedReader],
            template: '<localized-reader [localeOverrides]="configuration()" />'
        })
        class TestApp {
            readonly configuration = signal<KbqPartialLocaleData | undefined>(undefined);
        }

        const createComponent = (providers: Provider[] = []): ComponentFixture<TestApp> => {
            TestBed.configureTestingModule({ providers });

            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            return fixture;
        };

        const readerOf = (fixture: ComponentFixture<TestApp>): LocalizedReader =>
            fixture.debugElement.query(By.directive(LocalizedReader)).componentInstance;

        it('should resolve the section the way the injected reader does', () => {
            const fixture = createComponent([localeServiceProvider]);

            expect(textOf(fixture, 'localized-reader')).toBe(ruRULocaleData.select.selectAll);

            TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');
            fixture.detectChanges();

            expect(textOf(fixture, 'localized-reader')).toBe(enUSLocaleData.select.selectAll);
        });

        it('should merge the binding of its own carrier over an override registered through a provider', () => {
            const fixture = createComponent([
                kbqLocaleConfigurationOverrideProvider('select', { selectAll: 'Provided' })
            ]);

            expect(textOf(fixture, 'localized-reader')).toBe('Provided');

            fixture.componentInstance.configuration.set({ select: { selectAll: 'Bound' } });
            fixture.detectChanges();

            expect(textOf(fixture, 'localized-reader')).toBe('Bound');
        });

        it('should return the same signal for repeated reads of one token', () => {
            const reader = readerOf(createComponent());

            expect(reader.readSelect()).toBe(reader.select);
        });

        it('should read a section outside an injection context', () => {
            const fixture = createComponent();

            fixture.componentInstance.configuration.set({ a11y: { clear: 'Wipe' } });
            fixture.detectChanges();

            expect(readerOf(fixture).readA11y()().clear).toBe('Wipe');
        });
    });

    describe('applied to an element of your own', () => {
        @Component({
            imports: [LocalizedHost, KbqLocaleOverridesDirective],
            template: `
                <div [kbqLocaleOverrides]="region()">
                    <localized-host [localeOverrides]="scoped()" />
                </div>
                <localized-host />
            `
        })
        class TestApp {
            readonly region = signal<KbqPartialLocaleData | undefined>(undefined);
            readonly scoped = signal<KbqPartialLocaleData | undefined>(undefined);
        }

        let fixture: ComponentFixture<TestApp>;

        beforeEach(() => {
            TestBed.configureTestingModule({});

            fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
        });

        it('should scope an override to everything inside it', () => {
            fixture.componentInstance.region.set({ select: { selectAll: 'Everything' } });
            fixture.detectChanges();

            const hosts = fixture.debugElement.queryAll(By.directive(LocalizedHost));

            expect(hosts[0].nativeElement.textContent).toContain('Everything');
            // The instance outside the region keeps the locale.
            expect(hosts[1].nativeElement.textContent).toContain(ruRULocaleData.select.selectAll);
        });

        it('should merge a nested carrier over the enclosing one instead of hiding it', () => {
            fixture.componentInstance.region.set({ a11y: { clear: 'Wipe' }, select: { selectAll: 'Everything' } });
            fixture.componentInstance.scoped.set({ select: { selectAll: 'Only this one' } });
            fixture.detectChanges();

            const host = fixture.debugElement.queryAll(By.directive(LocalizedHost))[0];

            expect(host.nativeElement.textContent).toContain('Only this one');
            expect(host.query(By.css('localized-leaf')).nativeElement.textContent.trim()).toBe('Wipe');
        });
    });

    // Every pop-up in the library builds its overlay content as `new ComponentPortal(type, this.hostView)`,
    // and a `ComponentPortal` given a `ViewContainerRef` creates through it — so the content resolves against
    // the trigger's element injector. That is what lets a carrier reach a panel that renders in the overlay
    // container, and the pop-up triggers rely on it instead of carrying the directive themselves.
    it('should reach content created through a ViewContainerRef of its subtree', () => {
        @Component({
            selector: 'overlay-trigger',
            template: '',
            changeDetection: ChangeDetectionStrategy.OnPush
        })
        class OverlayTrigger {
            readonly hostView = inject(ViewContainerRef);
        }

        @Component({
            imports: [KbqLocaleOverridesDirective, OverlayTrigger],
            template: '<div [kbqLocaleOverrides]="configuration"><overlay-trigger /></div>'
        })
        class TestApp {
            readonly configuration: KbqPartialLocaleData = { a11y: { clear: 'Wipe' } };
        }

        TestBed.configureTestingModule({});

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const trigger: OverlayTrigger = fixture.debugElement.query(By.directive(OverlayTrigger)).componentInstance;
        const leaf = trigger.hostView.createComponent(LocalizedLeaf);

        expect(leaf.instance.a11y().clear).toBe('Wipe');
    });

    // This is why the two names are not one: a component already carries the directive through
    // `hostDirectives`, so writing the selector on it as well matches the same directive twice. Angular
    // rejects that outright, which is what makes `localeConfiguration` the name to use on Koobiq components
    // and `kbqLocaleConfiguration` the one to use on your own elements.
    it('should reject the selector written on a component that already carries it', () => {
        @Component({
            imports: [LocalizedHost, KbqLocaleOverridesDirective],
            template: '<localized-host [kbqLocaleOverrides]="configuration" />'
        })
        class TestApp {
            readonly configuration: KbqPartialLocaleData = { select: { selectAll: 'Everything' } };
        }

        TestBed.configureTestingModule({});

        expect(() => TestBed.createComponent(TestApp)).toThrow(/NG0309/);
    });
});
