import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ThemePalette } from '@koobiq/components/core';
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
                OverlayWithExternalParams
            ]
        }).compileComponents();
    });

    it('should be transparent by default', () => {
        const fixture = TestBed.createComponent(OverlayWithParams);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.directive(KbqLoaderOverlay)).classes).toEqual(
            expect.objectContaining({ 'kbq-loader-overlay_transparent': true })
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
});

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
    readonly surface = signal<KbqLoaderOverlaySurface>('bg-secondary');
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
                <kbq-progress-spinner
                    kbq-loader-overlay-indicator
                    [mode]="'indeterminate'"
                    [color]="themePalette.Error"
                />

                <div kbq-loader-overlay-text>Создание отчета</div>
                <div kbq-loader-overlay-caption>18,7 МБ из 25 МБ — осталось 2 мин</div>
            </kbq-loader-overlay>
        </div>
    `
})
class OverlayWithExternalParams {
    themePalette = ThemePalette;
}
