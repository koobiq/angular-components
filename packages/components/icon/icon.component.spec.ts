import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DomSanitizer } from '@angular/platform-browser';
import { axe } from 'jest-axe';
import { KbqIconButton } from './icon-button.component';
import { KBQ_ICON_ERROR_STATE_CONTEXT } from './icon-error-state-context';
import { KbqIconRegistry } from './icon-registry';
import { kbqIconsResolverProvider } from './icon-registry-providers';
import { KbqIcon } from './icon.component';

const svgOf = (path: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="${path}"/></svg>`;

const ICON_SVG = svgOf('M0 0h16v16H0z');

@Component({
    imports: [KbqIcon],
    template: `
        <i [kbq-icon]="name()" [iconSize]="iconSize()"></i>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly name = signal<string | undefined>('kbq-plus_16');
    readonly iconSize = signal<number | undefined>(undefined);
}

@Component({
    imports: [KbqIcon],
    template: `
        <i kbq-icon="kbq-plus_16" [autoColor]="autoColor()"></i>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class AutoColorIcon {
    readonly autoColor = signal<boolean | undefined>(false);
}

@Component({
    imports: [KbqIcon],
    template: `
        <i kbq-icon="kbq-plus_16" role="img" aria-hidden="false" aria-label="Add"></i>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class MeaningfulIcon {}

@Component({
    imports: [KbqIcon],
    template: `
        <i kbq-icon="kbq-plus_16" [aria-hidden]="ariaHidden()"></i>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class BoundAriaHiddenIcon {
    readonly ariaHidden = signal<boolean | null>(null);
}

@Component({
    imports: [KbqIcon],
    template: `
        <i [kbq-icon]="name()">
            <svg class="projected" viewBox="0 0 16 16"><path d="M0 0h16v16H0z" /></svg>
        </i>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ProjectedSvgIcon {
    readonly name = signal('');
}

@Component({
    imports: [KbqIconButton],
    template: `
        <i aria-hidden="true" kbq-icon-button="kbq-chevron-up-s_16" [tabindex]="-1"></i>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DecorativeIconButton {}

describe('KbqIcon', () => {
    const hostOf = (fixture: ComponentFixture<unknown>): HTMLElement => fixture.nativeElement.querySelector('i');

    describe('font icon class', () => {
        let fixture: ComponentFixture<TestApp>;

        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
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

        it('should drop the font class once the bound name turns undefined', () => {
            fixture.componentInstance.name.set(undefined);
            fixture.detectChanges();

            expect(hostOf(fixture).classList).not.toContain('kbq-plus_16');
        });
    });

    describe('max-height', () => {
        let fixture: ComponentFixture<TestApp>;

        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
        });

        // The size is inferred from the `_<px>` suffix of the name, so the table doubles as the
        // specification of the name parsing.
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
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            expect(hostOf(fixture).getAttribute('aria-hidden')).toBe('true');
        });

        it('should let a meaningful icon opt out', () => {
            const fixture = TestBed.createComponent(MeaningfulIcon);

            fixture.detectChanges();

            expect(hostOf(fixture).getAttribute('aria-hidden')).toBe('false');
        });

        it('should keep an icon button hidden when the caller asked for it', () => {
            const fixture = TestBed.createComponent(DecorativeIconButton);

            fixture.detectChanges();

            expect(hostOf(fixture).getAttribute('aria-hidden')).toBe('true');
        });

        // `cond ? true : null` is how a template leaves a value unset. `booleanAttribute(null)` is `false`,
        // which would have turned "say nothing" into an explicit opt-out of the default.
        it('should treat a null binding as no answer at all', () => {
            const fixture = TestBed.createComponent(BoundAriaHiddenIcon);

            fixture.detectChanges();

            expect(hostOf(fixture).getAttribute('aria-hidden')).toBe('true');

            fixture.componentInstance.ariaHidden.set(false);
            fixture.detectChanges();

            expect(hostOf(fixture).getAttribute('aria-hidden')).toBe('false');
        });

        it('should have no violations', async () => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });

    describe('svg resolution', () => {
        let registry: KbqIconRegistry;
        let sanitizer: DomSanitizer;

        const register = (name: string, svg = ICON_SVG) =>
            registry.addSvgIconLiteral(name, sanitizer.bypassSecurityTrustHtml(svg));

        beforeEach(() => {
            TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });

            registry = TestBed.inject(KbqIconRegistry);
            sanitizer = TestBed.inject(DomSanitizer);
        });

        afterEach(() => TestBed.inject(HttpTestingController).verify());

        it('should render a registered icon as inline SVG instead of the font class', () => {
            register('kbq-plus_16');

            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            expect(hostOf(fixture).querySelector('svg')).not.toBeNull();
            expect(hostOf(fixture).classList).not.toContain('kbq-plus_16');
        });

        it('should keep the font class for a name the registry does not know', () => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            expect(hostOf(fixture).querySelector('svg')).toBeNull();
            expect(hostOf(fixture).classList).toContain('kbq-plus_16');
        });

        it('should render an SVG that arrives after the first render', async () => {
            registry.addSvgIcon('kbq-plus_16', sanitizer.bypassSecurityTrustResourceUrl('/icons/plus.svg'));

            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            expect(hostOf(fixture).classList).toContain('kbq-plus_16');

            TestBed.inject(HttpTestingController).expectOne('/icons/plus.svg').flush(ICON_SVG);
            await fixture.whenStable();

            expect(hostOf(fixture).querySelector('svg')).not.toBeNull();
            expect(hostOf(fixture).classList).not.toContain('kbq-plus_16');
        });

        it('should size the injected svg from the name', () => {
            register('kbq-plus_16');

            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            const svg = hostOf(fixture).querySelector('svg')!;

            expect(svg.getAttribute('width')).toBe('16');
            expect(svg.getAttribute('height')).toBe('16');
        });

        it('should size the injected svg from iconSize', () => {
            register('kbq-plus_16');

            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            fixture.componentInstance.iconSize.set(24);
            fixture.detectChanges();

            expect(hostOf(fixture).querySelector('svg')!.getAttribute('width')).toBe('24');
        });

        it('should replace the injected svg on a name change instead of stacking', () => {
            register('kbq-plus_16');
            register('kbq-check_16', svgOf('M1 8l4 4 8-8'));

            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            fixture.componentInstance.name.set('kbq-check_16');
            fixture.detectChanges();

            const svgs = hostOf(fixture).querySelectorAll('svg');

            expect(svgs).toHaveLength(1);
            expect(svgs[0].querySelector('path')?.getAttribute('d')).toBe('M1 8l4 4 8-8');
        });

        // The stream used to terminate on the first unresolved name, which the default font-icon
        // configuration guarantees, leaving the element unable to render anything later.
        it('should still resolve a registered name after an unregistered one', () => {
            register('kbq-play_64');

            const fixture = TestBed.createComponent(TestApp);

            fixture.componentInstance.name.set('kbq-missing_16');
            fixture.detectChanges();

            expect(hostOf(fixture).querySelector('svg')).toBeNull();

            fixture.componentInstance.name.set('kbq-play_64');
            fixture.detectChanges();

            expect(hostOf(fixture).querySelector('svg')).not.toBeNull();
        });

        it('should remove the stale svg and restore the font class for an unregistered name', () => {
            register('kbq-plus_16');

            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            expect(hostOf(fixture).querySelector('svg')).not.toBeNull();

            fixture.componentInstance.name.set('kbq-missing_16');
            fixture.detectChanges();

            expect(hostOf(fixture).querySelector('svg')).toBeNull();
            expect(hostOf(fixture).classList).toContain('kbq-missing_16');
        });

        // The docs site projects the GitHub logo into an `<i kbq-icon="">` this way.
        it('should keep an svg projected into the host', () => {
            register('kbq-plus_16');

            const fixture = TestBed.createComponent(ProjectedSvgIcon);
            const projected = () => hostOf(fixture).querySelector('svg.projected');

            fixture.detectChanges();
            expect(projected()).not.toBeNull();

            fixture.componentInstance.name.set('kbq-plus_16');
            fixture.detectChanges();
            fixture.componentInstance.name.set('kbq-missing_16');
            fixture.detectChanges();

            expect(projected()).not.toBeNull();
            expect(hostOf(fixture).querySelectorAll('svg')).toHaveLength(1);
        });

        it('should remove the stale svg once the bound name turns undefined', () => {
            register('kbq-plus_16');

            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            fixture.componentInstance.name.set(undefined);
            fixture.detectChanges();

            expect(hostOf(fixture).querySelector('svg')).toBeNull();
        });
    });

    // A resolver is consumer code. One that throws must fall back to the font class and leave the next
    // name to be resolved again.
    it('should survive a resolver that throws', () => {
        TestBed.configureTestingModule({
            providers: [
                kbqIconsResolverProvider((name) => {
                    if (name === 'kbq-boom_16') throw Error('resolver blew up');

                    return null;
                })
            ]
        });

        TestBed.inject(KbqIconRegistry).addSvgIconLiteral(
            'kbq-play_64',
            TestBed.inject(DomSanitizer).bypassSecurityTrustHtml(ICON_SVG)
        );

        const fixture = TestBed.createComponent(TestApp);

        fixture.componentInstance.name.set('kbq-boom_16');
        fixture.detectChanges();

        expect(hostOf(fixture).querySelector('svg')).toBeNull();
        expect(hostOf(fixture).classList).toContain('kbq-boom_16');

        fixture.componentInstance.name.set('kbq-play_64');
        fixture.detectChanges();

        expect(hostOf(fixture).querySelector('svg')).not.toBeNull();
    });

    describe('autoColor', () => {
        const errorState = signal(false);

        const hasErrorClass = (fixture: ComponentFixture<AutoColorIcon>) =>
            hostOf(fixture).classList.contains('kbq-error');

        beforeEach(() => {
            errorState.set(false);

            TestBed.configureTestingModule({
                providers: [{ provide: KBQ_ICON_ERROR_STATE_CONTEXT, useValue: { errorState } }]
            });
        });

        it('should not follow the error state while off', () => {
            const fixture = TestBed.createComponent(AutoColorIcon);

            fixture.detectChanges();
            errorState.set(true);
            fixture.detectChanges();

            expect(hasErrorClass(fixture)).toBe(false);
        });

        it('should pick up the error state when turned on after init', () => {
            const fixture = TestBed.createComponent(AutoColorIcon);

            fixture.detectChanges();
            errorState.set(true);
            fixture.componentInstance.autoColor.set(true);
            fixture.detectChanges();

            expect(hasErrorClass(fixture)).toBe(true);
        });

        it('should follow every change of the error state', () => {
            const fixture = TestBed.createComponent(AutoColorIcon);

            fixture.componentInstance.autoColor.set(true);
            fixture.detectChanges();
            expect(hasErrorClass(fixture)).toBe(false);

            errorState.set(true);
            fixture.detectChanges();

            expect(hasErrorClass(fixture)).toBe(true);
        });

        it('should stop taking the error color when turned back off', () => {
            const fixture = TestBed.createComponent(AutoColorIcon);

            errorState.set(true);
            fixture.componentInstance.autoColor.set(true);
            fixture.detectChanges();
            expect(hasErrorClass(fixture)).toBe(true);

            fixture.componentInstance.autoColor.set(false);
            fixture.detectChanges();

            expect(hasErrorClass(fixture)).toBe(false);
        });

        it('should stop taking the error color once the bound autoColor turns undefined', () => {
            const fixture = TestBed.createComponent(AutoColorIcon);

            errorState.set(true);
            fixture.componentInstance.autoColor.set(true);
            fixture.detectChanges();
            expect(hasErrorClass(fixture)).toBe(true);

            fixture.componentInstance.autoColor.set(undefined);
            fixture.detectChanges();

            expect(hasErrorClass(fixture)).toBe(false);
        });
    });

    it('should expose the host element', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const icon: KbqIcon = fixture.debugElement.query(By.directive(KbqIcon)).componentInstance;

        expect(icon.getHostElement()).toBe(hostOf(fixture));
    });
});
