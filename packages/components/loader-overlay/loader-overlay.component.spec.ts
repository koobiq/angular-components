import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ThemePalette } from '@koobiq/components/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import {
    KbqLoaderOverlay,
    KbqLoaderOverlayCaption,
    KbqLoaderOverlayIndicator,
    KbqLoaderOverlayModule,
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

        expect(fixture.componentInstance.overlay.transparent).toBeTruthy();
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
class OverlayWithParams {
    @ViewChild(KbqLoaderOverlay) overlay: KbqLoaderOverlay;
}

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
