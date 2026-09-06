import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DomSanitizer } from '@angular/platform-browser';
import { axe } from 'jest-axe';
import { Subject } from 'rxjs';
import { KbqIconButton } from './icon-button.component';
import { KBQ_ICON_ERROR_STATE_CONTEXT, KbqIconErrorStateContext } from './icon-error-state-context';
import { KbqIconRegistry } from './icon-registry';
import { KbqIcon } from './icon.component';

const ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>';

@Component({
    selector: 'icon-test-app',
    imports: [KbqIcon],
    template: `
        <i [kbq-icon]="name()" [iconSize]="iconSize()"></i>
    `
})
class IconTestApp {
    readonly name = signal<string | undefined>('kbq-plus_16');
    readonly iconSize = signal<number | undefined>(undefined);
}

@Component({
    selector: 'auto-color-test-app',
    imports: [KbqIcon],
    template: `
        <i kbq-icon="kbq-plus_16" [autoColor]="autoColor()"></i>
    `
})
class AutoColorTestApp {
    readonly autoColor = signal(false);
}

describe('KbqIcon', () => {
    const hostOf = (fixture: ComponentFixture<unknown>): HTMLElement =>
        fixture.nativeElement.querySelector('i') as HTMLElement;

    describe('font icon class', () => {
        let fixture: ComponentFixture<IconTestApp>;

        beforeEach(() => {
            fixture = TestBed.createComponent(IconTestApp);
            fixture.detectChanges();
        });

        it('should apply the icon name as a class', () => {
            expect(hostOf(fixture).classList).toContain('kbq-plus_16');
        });

        it('should apply a namespaced name verbatim', () => {
            fixture.componentInstance.name.set('brand:logo_24');
            fixture.detectChanges();

            expect(hostOf(fixture).classList).toContain('brand:logo_24');
        });

        it('should replace the class when the name changes', () => {
            fixture.componentInstance.name.set('kbq-play_64');
            fixture.detectChanges();

            expect(hostOf(fixture).classList).not.toContain('kbq-plus_16');
            expect(hostOf(fixture).classList).toContain('kbq-play_64');
        });
    });

    describe('max-height', () => {
        let fixture: ComponentFixture<IconTestApp>;

        beforeEach(() => {
            fixture = TestBed.createComponent(IconTestApp);
        });

        // The size is inferred from the `_<px>` suffix of the name, so the table doubles as the
        // specification of `parseIconSize`.
        it.each([
            ['kbq-plus_16', '16px'],
            ['ns:plus_24', '24px'],
            ['brand_2024', '2024px'],
            ['logo', ''],
            ['check-16', '']
        ])('should derive max-height from %s', (name, expected) => {
            fixture.componentInstance.name.set(name);
            fixture.detectChanges();

            expect(hostOf(fixture).style.maxHeight).toBe(expected);
        });

        it('should track the name when it changes', () => {
            fixture.detectChanges();
            expect(hostOf(fixture).style.maxHeight).toBe('16px');

            fixture.componentInstance.name.set('kbq-play_64');
            fixture.detectChanges();

            expect(hostOf(fixture).style.maxHeight).toBe('64px');
        });

        it('should clear a previously written max-height for an unsized name', () => {
            fixture.detectChanges();
            expect(hostOf(fixture).style.maxHeight).toBe('16px');

            fixture.componentInstance.name.set('logo');
            fixture.detectChanges();

            expect(hostOf(fixture).style.maxHeight).toBe('');
        });

        it('should let iconSize win over the name', () => {
            fixture.componentInstance.iconSize.set(32);
            fixture.detectChanges();

            expect(hostOf(fixture).style.maxHeight).toBe('32px');
        });

        it('should follow iconSize when it changes after init', () => {
            fixture.detectChanges();
            expect(hostOf(fixture).style.maxHeight).toBe('16px');

            fixture.componentInstance.iconSize.set(48);
            fixture.detectChanges();

            expect(hostOf(fixture).style.maxHeight).toBe('48px');
        });
    });

    describe('aria', () => {
        it('should hide a bare icon from assistive technology', () => {
            const fixture = TestBed.createComponent(IconTestApp);

            fixture.detectChanges();

            expect(hostOf(fixture).getAttribute('aria-hidden')).toBe('true');
        });

        it('should let a meaningful icon opt out', () => {
            @Component({
                selector: 'meaningful-icon-app',
                imports: [KbqIcon],
                template: `
                    <i kbq-icon="kbq-plus_16" role="img" aria-hidden="false" aria-label="Add"></i>
                `
            })
            class MeaningfulIconApp {}

            const fixture = TestBed.createComponent(MeaningfulIconApp);

            fixture.detectChanges();

            expect(hostOf(fixture).getAttribute('aria-hidden')).toBe('false');
        });

        it('should keep an icon button hidden when the caller asked for it', () => {
            @Component({
                selector: 'decorative-icon-button-app',
                imports: [KbqIconButton],
                template: `
                    <i aria-hidden="true" kbq-icon-button="kbq-chevron-up-s_16" [tabindex]="-1"></i>
                `
            })
            class DecorativeIconButtonApp {}

            const fixture = TestBed.createComponent(DecorativeIconButtonApp);

            fixture.detectChanges();

            expect(hostOf(fixture).getAttribute('aria-hidden')).toBe('true');
        });
    });

    describe('svg resolution', () => {
        let registry: KbqIconRegistry;

        const register = (name: string) => {
            registry.addSvgIconLiteral(name, TestBed.inject(DomSanitizer).bypassSecurityTrustHtml(ICON_SVG));
        };

        beforeEach(() => {
            registry = TestBed.inject(KbqIconRegistry);
        });

        it('should inject the resolved svg and drop the font class', () => {
            register('kbq-plus_16');

            const fixture = TestBed.createComponent(IconTestApp);

            fixture.detectChanges();

            const host = hostOf(fixture);

            expect(host.querySelector('svg')).not.toBeNull();
            expect(host.classList).not.toContain('kbq-plus_16');
        });

        it('should size the injected svg from the name', () => {
            register('kbq-plus_16');

            const fixture = TestBed.createComponent(IconTestApp);

            fixture.detectChanges();

            const svg = hostOf(fixture).querySelector('svg')!;

            expect(svg.getAttribute('width')).toBe('16');
            expect(svg.getAttribute('height')).toBe('16');
        });

        it('should replace the injected svg on a name change instead of stacking', () => {
            register('kbq-plus_16');
            register('kbq-play_64');

            const fixture = TestBed.createComponent(IconTestApp);

            fixture.detectChanges();
            fixture.componentInstance.name.set('kbq-play_64');
            fixture.detectChanges();

            expect(hostOf(fixture).querySelectorAll('svg')).toHaveLength(1);
        });

        // ICN-BUG-01: the stream used to terminate on the first unresolved name, which the default
        // font-icon configuration guarantees, leaving the element unable to render anything later.
        it('should still resolve a registered name after an unregistered one', () => {
            register('kbq-play_64');

            const fixture = TestBed.createComponent(IconTestApp);

            fixture.componentInstance.name.set('kbq-missing_16');
            fixture.detectChanges();

            expect(hostOf(fixture).querySelector('svg')).toBeNull();

            fixture.componentInstance.name.set('kbq-play_64');
            fixture.detectChanges();

            expect(hostOf(fixture).querySelector('svg')).not.toBeNull();
        });

        it('should remove the stale svg and restore the font class for an unregistered name', () => {
            register('kbq-plus_16');

            const fixture = TestBed.createComponent(IconTestApp);

            fixture.detectChanges();
            expect(hostOf(fixture).querySelector('svg')).not.toBeNull();

            fixture.componentInstance.name.set('kbq-missing_16');
            fixture.detectChanges();

            expect(hostOf(fixture).querySelector('svg')).toBeNull();
            expect(hostOf(fixture).classList).toContain('kbq-missing_16');
        });

        it('should keep updating max-height once the stream has seen a failure', () => {
            const fixture = TestBed.createComponent(IconTestApp);

            fixture.detectChanges();
            expect(hostOf(fixture).style.maxHeight).toBe('16px');

            fixture.componentInstance.name.set('kbq-play_64');
            fixture.detectChanges();

            expect(hostOf(fixture).style.maxHeight).toBe('64px');
        });
    });

    describe('autoColor', () => {
        let stateChanges: Subject<void>;
        let context: KbqIconErrorStateContext;
        let errorState: boolean;

        beforeEach(() => {
            stateChanges = new Subject<void>();
            errorState = false;
            context = {
                get errorState() {
                    return errorState;
                },
                get stateChanges() {
                    return stateChanges;
                }
            };

            TestBed.configureTestingModule({
                providers: [{ provide: KBQ_ICON_ERROR_STATE_CONTEXT, useValue: context }]
            });
        });

        const errorClassOf = (fixture: ComponentFixture<AutoColorTestApp>) =>
            hostOf(fixture).classList.contains('kbq-error');

        it('should not follow the error state while off', () => {
            const fixture = TestBed.createComponent(AutoColorTestApp);

            fixture.detectChanges();

            errorState = true;
            stateChanges.next();
            fixture.detectChanges();

            expect(errorClassOf(fixture)).toBe(false);
        });

        it('should pick up the error state when turned on after init', () => {
            const fixture = TestBed.createComponent(AutoColorTestApp);

            fixture.detectChanges();

            errorState = true;
            fixture.componentInstance.autoColor.set(true);
            fixture.detectChanges();

            expect(errorClassOf(fixture)).toBe(true);
        });

        it('should reset and stop following when turned back off', () => {
            const fixture = TestBed.createComponent(AutoColorTestApp);

            fixture.componentInstance.autoColor.set(true);
            errorState = true;
            fixture.detectChanges();
            expect(errorClassOf(fixture)).toBe(true);

            fixture.componentInstance.autoColor.set(false);
            fixture.detectChanges();

            expect(errorClassOf(fixture)).toBe(false);
        });

        it('should re-read the error state off the context on every change', () => {
            const fixture = TestBed.createComponent(AutoColorTestApp);

            fixture.componentInstance.autoColor.set(true);
            fixture.detectChanges();
            expect(errorClassOf(fixture)).toBe(false);

            errorState = true;
            stateChanges.next();
            fixture.detectChanges();

            expect(errorClassOf(fixture)).toBe(true);
        });
    });

    describe('accessibility', () => {
        it('should have no violations', async () => {
            const fixture = TestBed.createComponent(IconTestApp);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });

    it('should expose the host element', () => {
        const fixture = TestBed.createComponent(IconTestApp);

        fixture.detectChanges();

        const icon = fixture.debugElement.query(By.directive(KbqIcon)).componentInstance as KbqIcon;

        expect(icon.getHostElement()).toBe(hostOf(fixture));
    });
});
