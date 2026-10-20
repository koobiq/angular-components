import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchKeyboardEvent, ENTER, KbqComponentColors, KbqDefaultSizes } from '@koobiq/components/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import {
    KbqLoaderOverlay,
    KbqLoaderOverlayCaption,
    KbqLoaderOverlayIndicator,
    KbqLoaderOverlayModule,
    KbqLoaderOverlaySurface,
    KbqLoaderOverlayText
} from './index';

describe('KbqLoaderOverlay', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqProgressSpinnerModule,
                KbqLoaderOverlayModule,
                OverlayWithParams,
                OverlayNoParams,
                OverlayWithExternalParams,
                OverlayWithValuelessTransparent,
                OverlayWithChangingText,
                OverlayWithSize
            ]
        }).compileComponents();
    });

    it('should map the default transparent input to the bg surface', () => {
        const fixture = TestBed.createComponent(OverlayWithParams);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes).toEqual(
            expect.objectContaining({
                'kbq-loader-overlay_surface_bg': true,
                'kbq-loader-overlay_transparent': true
            })
        );
    });

    it('should render params', () => {
        const fixture = TestBed.createComponent(OverlayWithParams);

        fixture.detectChanges();

        const indicatorElement = fixture.debugElement.query(By.css('kbq-progress-spinner'));
        const textElement = fixture.debugElement.query(By.css('.kbq-loader-overlay-text'));
        const captionElement = fixture.debugElement.query(By.css('.kbq-loader-overlay-caption'));

        expect(indicatorElement).toBeDefined();
        expect(textElement.nativeElement.textContent.trim()).toContain('Создание отчета');
        expect(captionElement.nativeElement.textContent.trim()).toBe('18,7 МБ из 25 МБ — осталось 2 мин');
    });

    it('should render only spinner with modifier', () => {
        const fixture = TestBed.createComponent(OverlayNoParams);

        fixture.detectChanges();

        const indicatorElement = fixture.debugElement.query(By.css('kbq-progress-spinner'));
        const containerElement = fixture.debugElement.query(By.css('kbq-loader-overlay'));
        const textElement = fixture.debugElement.query(By.css('.kbq-loader-overlay-text'));
        const captionElement = fixture.debugElement.query(By.css('.kbq-loader-overlay-caption'));

        expect(indicatorElement).toBeDefined();
        expect(containerElement.nativeElement.classList).toContain('kbq-loader-overlay_empty');
        expect(textElement).toBeNull();
        expect(captionElement).toBeNull();
    });

    it('should render external params', () => {
        const fixture = TestBed.createComponent(OverlayWithExternalParams);

        fixture.detectChanges();

        const indicatorElement = fixture.debugElement.query(By.directive(KbqLoaderOverlayIndicator));
        const textElement = fixture.debugElement.query(By.directive(KbqLoaderOverlayText));
        const captionElement = fixture.debugElement.query(By.directive(KbqLoaderOverlayCaption));

        expect(indicatorElement.nativeElement.classList).toContain('kbq-error');
        expect(textElement.nativeElement.textContent.trim()).toBe('Создание отчета');
        expect(captionElement.nativeElement.textContent.trim()).toBe('18,7 МБ из 25 МБ — осталось 2 мин');
    });

    it('should assign default css classes including size-related css-class', () => {
        const fixture = TestBed.createComponent(OverlayWithParams);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes).toMatchSnapshot();
    });
    it('should treat a valueless transparent attribute as true', () => {
        const fixture = TestBed.createComponent(OverlayWithValuelessTransparent);

        fixture.detectChanges();

        const host = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).nativeElement as HTMLElement;

        expect(host.classList).toContain('kbq-loader-overlay_transparent');
        expect(host.classList).not.toContain('kbq-loader-overlay_filled');
    });

    it('should stop being empty once the text arrives', () => {
        const fixture = TestBed.createComponent(OverlayWithChangingText);

        fixture.detectChanges();

        const host = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).nativeElement as HTMLElement;

        expect(host.classList).toContain('kbq-loader-overlay_empty');

        fixture.componentInstance.text.set('Загрузка');
        fixture.detectChanges();

        expect(host.classList).not.toContain('kbq-loader-overlay_empty');
        expect(host.querySelector('.kbq-loader-overlay-text')!.textContent!.trim()).toBe('Загрузка');
    });

    it('should report undefined for an unbound text and caption', () => {
        const fixture = TestBed.createComponent(OverlayNoParams);

        fixture.detectChanges();

        const overlay = fixture.debugElement.query(By.directive(KbqLoaderOverlay))
            .componentInstance as KbqLoaderOverlay;

        expect(overlay.text()).toBeUndefined();
        expect(overlay.caption()).toBeUndefined();
    });
    it('should map every size to a class and a spinner size', () => {
        const fixture = TestBed.createComponent(OverlayWithSize);

        fixture.detectChanges();

        const host = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).nativeElement as HTMLElement;
        const spinner = fixture.nativeElement.querySelector('kbq-progress-spinner') as HTMLElement;

        expect(host.classList).toContain('kbq-loader-overlay_big');
        expect(spinner.classList).toContain('kbq-progress-spinner_big');

        fixture.componentInstance.size.set('normal');
        fixture.detectChanges();

        expect(host.classList).toContain('kbq-loader-overlay_normal');
        expect(host.classList).not.toContain('kbq-loader-overlay_big');
        // There is no `normal` progress spinner, so the overlay keeps the big indicator for it.
        expect(spinner.classList).toContain('kbq-progress-spinner_big');

        fixture.componentInstance.size.set('compact');
        fixture.detectChanges();

        expect(host.classList).toContain('kbq-loader-overlay_compact');
        expect(spinner.classList).not.toContain('kbq-progress-spinner_big');
    });

    it('should mark the overlay as a card', () => {
        const fixture = TestBed.createComponent(OverlayWithSize);

        fixture.detectChanges();

        const host = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).nativeElement as HTMLElement;

        expect(host.classList).not.toContain('kbq-loader-overlay_card');

        fixture.componentInstance.card.set(true);
        fixture.detectChanges();

        expect(host.classList).toContain('kbq-loader-overlay_card');
    });

    it('should use a solid surface', () => {
        const fixture = TestBed.createComponent(OverlayWithSurface);

        fixture.componentInstance.surface.set('solid');

        fixture.detectChanges();

        const classes = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes;

        expect(classes).toEqual(
            expect.objectContaining({
                'kbq-loader-overlay_filled': true
            })
        );
        expect(classes).not.toHaveProperty('kbq-loader-overlay_transparent');
    });

    it.each(['bg', 'bg-secondary', 'bg-tertiary', 'card'] as const)(
        'should use a transparent %s surface',
        (surface) => {
            const fixture = TestBed.createComponent(OverlayWithSurface);

            fixture.componentInstance.surface.set(surface);

            fixture.detectChanges();

            const classes = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes;
            const surfaceClass =
                surface === 'card' ? 'kbq-loader-overlay_card' : `kbq-loader-overlay_surface_${surface}`;

            expect(classes).toEqual(
                expect.objectContaining({
                    'kbq-loader-overlay_transparent': true,
                    [surfaceClass]: true
                })
            );
            expect(classes).not.toHaveProperty('kbq-loader-overlay_filled');
        }
    );

    it('should let surface define opacity mode', () => {
        const fixture = TestBed.createComponent(OverlayWithSurface);

        fixture.componentInstance.surface.set('solid');
        fixture.componentInstance.transparent.set(true);
        fixture.detectChanges();

        let classes = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes;

        expect(classes).toEqual(expect.objectContaining({ 'kbq-loader-overlay_filled': true }));
        expect(classes).not.toHaveProperty('kbq-loader-overlay_transparent');

        fixture.componentInstance.surface.set('bg-secondary');
        fixture.componentInstance.transparent.set(false);
        fixture.detectChanges();

        classes = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes;

        expect(classes).toEqual(expect.objectContaining({ 'kbq-loader-overlay_transparent': true }));
        expect(classes).not.toHaveProperty('kbq-loader-overlay_filled');
    });

    it('should map legacy transparent=true to the bg surface', () => {
        const fixture = TestBed.createComponent(OverlayWithSurface);

        fixture.componentInstance.surface.set(undefined);
        fixture.componentInstance.transparent.set(true);
        fixture.detectChanges();

        const classes = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes;

        expect(classes).toEqual(
            expect.objectContaining({
                'kbq-loader-overlay_surface_bg': true,
                'kbq-loader-overlay_transparent': true
            })
        );
    });

    it('should let surface override legacy card and transparent inputs', () => {
        const fixture = TestBed.createComponent(OverlayWithSurface);

        fixture.componentInstance.surface.set('solid');
        fixture.componentInstance.card.set(true);
        fixture.componentInstance.transparent.set(true);
        fixture.detectChanges();

        let classes = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes;

        expect(classes).toEqual(expect.objectContaining({ 'kbq-loader-overlay_filled': true }));
        expect(classes).not.toHaveProperty('kbq-loader-overlay_card');

        fixture.componentInstance.surface.set('card');
        fixture.componentInstance.transparent.set(false);
        fixture.detectChanges();

        classes = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes;

        expect(classes).toEqual(
            expect.objectContaining({
                'kbq-loader-overlay_card': true,
                'kbq-loader-overlay_transparent': true
            })
        );
        expect(classes).not.toHaveProperty('kbq-loader-overlay_filled');
    });

    it('should let legacy card override transparent input without a surface', () => {
        const fixture = TestBed.createComponent(OverlayWithSurface);

        fixture.componentInstance.surface.set(undefined);
        fixture.componentInstance.card.set(true);
        fixture.componentInstance.transparent.set(false);
        fixture.detectChanges();

        const classes = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes;

        expect(classes).toEqual(
            expect.objectContaining({
                'kbq-loader-overlay_card': true,
                'kbq-loader-overlay_transparent': true
            })
        );
        expect(classes).not.toHaveProperty('kbq-loader-overlay_filled');
    });

    it('should treat null surface as unset', () => {
        const fixture = TestBed.createComponent(OverlayWithSurface);

        fixture.componentInstance.surface.set(null);
        fixture.componentInstance.card.set(true);
        fixture.detectChanges();

        const classes = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes;

        expect(classes).toEqual(
            expect.objectContaining({
                'kbq-loader-overlay_card': true,
                'kbq-loader-overlay_transparent': true
            })
        );
    });

    it('should preserve the transparent input behavior without a background', () => {
        const fixture = TestBed.createComponent(OverlayWithLegacyTransparent);

        fixture.detectChanges();

        const classes = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes;

        expect(classes).toEqual(expect.objectContaining({ 'kbq-loader-overlay_filled': true }));
        expect(classes).not.toHaveProperty('kbq-loader-overlay_transparent');
    });

    it('should preserve the card input behavior', () => {
        const fixture = TestBed.createComponent(OverlayWithLegacyCard);

        fixture.detectChanges();

        const classes = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes;

        expect(classes).toEqual(
            expect.objectContaining({
                'kbq-loader-overlay_card': true,
                'kbq-loader-overlay_transparent': true
            })
        );
    });

    it('should prioritize the new surface input over the legacy card input', () => {
        const fixture = TestBed.createComponent(OverlayWithSurface);

        fixture.componentInstance.surface.set('bg-tertiary');
        fixture.componentInstance.card.set(true);

        fixture.detectChanges();

        const classes = fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes;

        expect(classes).toEqual(expect.objectContaining({ 'kbq-loader-overlay_surface_bg-tertiary': true }));
        expect(classes).not.toHaveProperty('kbq-loader-overlay_card');
    });

    it('should not throw when destroyed before ngOnInit runs', () => {
        const fixture = TestBed.createComponent(OverlayNoParams);
        const overlay = fixture.debugElement.query(By.directive(KbqLoaderOverlay))
            .componentInstance as KbqLoaderOverlay;

        expect(() => overlay.ngOnDestroy()).not.toThrow();
    });

    it('should make the parent inert while the overlay is shown', () => {
        const fixture = TestBed.createComponent(OverlayToggled);

        fixture.detectChanges();

        const parent = fixture.nativeElement.querySelector('.loader-overlay-container') as HTMLElement;

        expect(parent.hasAttribute('inert')).toBe(true);

        fixture.componentInstance.shown.set(false);
        fixture.detectChanges();

        expect(parent.hasAttribute('inert')).toBe(false);
    });

    it('should leave the parent inert when it was inert before the overlay', () => {
        const fixture = TestBed.createComponent(OverlayToggledInInertParent);

        fixture.detectChanges();

        const parent = fixture.nativeElement.querySelector('.loader-overlay-container') as HTMLElement;

        fixture.componentInstance.shown.set(false);
        fixture.detectChanges();

        expect(parent.hasAttribute('inert')).toBe(true);
    });

    it('should remove an inert the parent got from an overlay before this one, such as on the server', () => {
        const fixture = TestBed.createComponent(OverlayToggledInParentMarkedByOverlay);

        fixture.detectChanges();

        const parent = fixture.nativeElement.querySelector('.loader-overlay-container') as HTMLElement;

        fixture.componentInstance.shown.set(false);
        fixture.detectChanges();

        expect(parent.hasAttribute('inert')).toBe(false);
    });

    it('should give the focus back to the element the overlay took it from', async () => {
        const fixture = TestBed.createComponent(OverlayToggled);

        fixture.componentInstance.shown.set(false);
        fixture.detectChanges();

        const behind = fixture.nativeElement.querySelector('.behind') as HTMLButtonElement;
        const focusVia = vi.spyOn(TestBed.inject(FocusMonitor), 'focusVia');

        dispatchKeyboardEvent(behind, 'keydown', ENTER);
        behind.focus();
        fixture.componentInstance.shown.set(true);
        fixture.detectChanges();
        // jsdom does not implement `inert`, so the focus is dropped the way a browser drops it.
        behind.blur();

        fixture.componentInstance.shown.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(document.activeElement).toBe(behind);
        expect(focusVia).toHaveBeenCalledWith(behind, 'keyboard', { preventScroll: true });
    });

    it('should leave the focus where the user moved it while the overlay was shown', async () => {
        const fixture = TestBed.createComponent(OverlayToggled);

        fixture.componentInstance.shown.set(false);
        fixture.detectChanges();

        const behind = fixture.nativeElement.querySelector('.behind') as HTMLButtonElement;
        const outside = fixture.nativeElement.querySelector('.outside') as HTMLButtonElement;

        behind.focus();
        fixture.componentInstance.shown.set(true);
        fixture.detectChanges();
        outside.focus();

        fixture.componentInstance.shown.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(document.activeElement).toBe(outside);
    });

    it('should give the focus back to an element enabled later in the pass that hides the overlay', async () => {
        const fixture = TestBed.createComponent(OverlayBeforeDisabledButton);

        fixture.detectChanges();

        const behind = fixture.nativeElement.querySelector('.behind') as HTMLButtonElement;

        behind.focus();
        fixture.componentInstance.shown.set(true);
        fixture.detectChanges();

        // jsdom implements neither `inert` nor a `blur()` of a disabled button, so the focus is dropped by
        // removing the element that holds it.
        const standIn = document.createElement('button');

        document.body.append(standIn);
        standIn.focus();
        standIn.remove();

        expect(document.activeElement).toBe(document.body);

        fixture.componentInstance.shown.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(document.activeElement).toBe(behind);
    });
});

@Component({
    selector: 'overlay-toggled',
    imports: [KbqLoaderOverlayModule],
    template: `
        <button class="outside" type="button">Outside the overlay</button>

        <div class="loader-overlay-container">
            <button class="behind" type="button">Behind the overlay</button>

            @if (shown()) {
                <kbq-loader-overlay />
            }
        </div>
    `
})
class OverlayToggled {
    readonly shown = signal(true);
}

@Component({
    selector: 'overlay-toggled-in-inert-parent',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="loader-overlay-container" inert>
            @if (shown()) {
                <kbq-loader-overlay />
            }
        </div>
    `
})
class OverlayToggledInInertParent {
    readonly shown = signal(true);
}

@Component({
    selector: 'overlay-toggled-in-parent-marked-by-overlay',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="loader-overlay-container kbq-loader-overlay_parent" inert>
            @if (shown()) {
                <kbq-loader-overlay />
            }
        </div>
    `
})
class OverlayToggledInParentMarkedByOverlay {
    readonly shown = signal(true);
}

@Component({
    selector: 'overlay-before-disabled-button',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="loader-overlay-container">
            @if (shown()) {
                <kbq-loader-overlay />
            }

            <button class="behind" type="button" [disabled]="shown()">Behind the overlay</button>
        </div>
    `
})
class OverlayBeforeDisabledButton {
    readonly shown = signal(false);
}

@Component({
    selector: 'overlay-with-params',
    imports: [KbqProgressSpinnerModule, KbqLoaderOverlayModule],
    template: `
        <div class="loader-overlay-container">
            text text text text text text text text text text text text text text text text text text text text

            <kbq-loader-overlay [text]="'Создание отчета'" [caption]="'18,7 МБ из 25 МБ — осталось 2 мин'" />
        </div>
    `
})
class OverlayWithParams {}

@Component({
    selector: 'overlay-with-surface',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="loader-overlay-container">
            <kbq-loader-overlay [surface]="surface()" [transparent]="transparent()" [card]="card()" />
        </div>
    `
})
class OverlayWithSurface {
    readonly surface = signal<KbqLoaderOverlaySurface | null | undefined>('bg-secondary');
    readonly transparent = signal(true);
    readonly card = signal(false);
}

@Component({
    selector: 'overlay-with-legacy-transparent',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="loader-overlay-container">
            <kbq-loader-overlay [transparent]="false" />
        </div>
    `
})
class OverlayWithLegacyTransparent {}

@Component({
    selector: 'overlay-with-legacy-card',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="loader-overlay-container">
            <kbq-loader-overlay [card]="true" />
        </div>
    `
})
class OverlayWithLegacyCard {}

@Component({
    selector: 'overlay-no-params',
    imports: [KbqProgressSpinnerModule, KbqLoaderOverlayModule],
    template: `
        <div class="loader-overlay-container">
            text text text text text text text text text text text text text text text text text text text text

            <kbq-loader-overlay />
        </div>
    `
})
class OverlayNoParams {}

@Component({
    selector: 'overlay-with-external-params',
    imports: [KbqProgressSpinnerModule, KbqLoaderOverlayModule],
    template: `
        <div class="loader-overlay-container">
            text text text text text text text text text text text text text text text text text text text text

            <kbq-loader-overlay>
                <kbq-progress-spinner kbq-loader-overlay-indicator [mode]="'indeterminate'" [color]="colors.Error" />

                <div kbq-loader-overlay-text>Создание отчета</div>
                <div kbq-loader-overlay-caption>18,7 МБ из 25 МБ — осталось 2 мин</div>
            </kbq-loader-overlay>
        </div>
    `
})
class OverlayWithExternalParams {
    colors = KbqComponentColors;
}

@Component({
    selector: 'overlay-with-valueless-transparent',
    imports: [KbqProgressSpinnerModule, KbqLoaderOverlayModule],
    template: `
        <kbq-loader-overlay transparent />
    `
})
class OverlayWithValuelessTransparent {}

@Component({
    selector: 'overlay-with-changing-text',
    imports: [KbqProgressSpinnerModule, KbqLoaderOverlayModule],
    template: `
        <kbq-loader-overlay [text]="text()" />
    `
})
class OverlayWithChangingText {
    readonly text = signal<string | undefined>(undefined);
}

@Component({
    selector: 'overlay-with-size',
    imports: [KbqProgressSpinnerModule, KbqLoaderOverlayModule],
    template: `
        <kbq-loader-overlay [size]="size()" [card]="card()" />
    `
})
class OverlayWithSize {
    readonly size = signal<KbqDefaultSizes>('big');
    readonly card = signal(false);
}
