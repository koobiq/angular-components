import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { ThemePalette } from '@koobiq/components/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

import { KbqLoaderOverlayCaption, KbqLoaderOverlayIndicator, KbqLoaderOverlayModule, KbqLoaderOverlayText } from './index';


describe('KbqLoaderOverlay', () => {

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                BrowserModule,
                CommonModule,
                KbqProgressSpinnerModule,
                KbqLoaderOverlayModule
            ],
            declarations: [OverlayWithParams, OverlayNoParams, OverlayWithExternalParams]
        });

        TestBed.compileComponents();
    }));

    it('should render params', () => {
        const fixture = TestBed.createComponent(OverlayWithParams);
        fixture.detectChanges();

        const indicatorElement = fixture.debugElement.query(By.css('kbq-progress-spinner'));
        const textElement = fixture.debugElement.query(By.css('.kbq-loader-overlay-text'));
        const captionElement = fixture.debugElement.query(By.css('.kbq-loader-overlay-caption'));

        expect(indicatorElement).toBeDefined();
        expect(textElement.nativeElement.innerText).toBe('Создание отчета');
        expect(captionElement.nativeElement.innerText).toBe('18,7 МБ из 25 МБ — осталось 2 мин');
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
        expect(textElement.nativeElement.innerText).toBe('Создание отчета');
        expect(captionElement.nativeElement.innerText).toBe('18,7 МБ из 25 МБ — осталось 2 мин');
    });
});


@Component({
    selector: 'overlay-with-params',
    template: `
        <div class="loader-overlay-container">
            text text text text text text text text text text text text text text text text text text text text

            <kbq-loader-overlay
                [text]="'Создание отчета'"
                [caption]="'18,7 МБ из 25 МБ — осталось 2 мин'">
            </kbq-loader-overlay>
        </div>`
})
class OverlayWithParams {}

@Component({
    selector: 'overlay-no-params',
    template: `
        <div class="loader-overlay-container">
            text text text text text text text text text text text text text text text text text text text text

            <kbq-loader-overlay></kbq-loader-overlay>
        </div>`
})
class OverlayNoParams {}

@Component({
    selector: 'overlay-with-external-params',
    template: `
        <div class="loader-overlay-container">
            text text text text text text text text text text text text text text text text text text text text

            <kbq-loader-overlay>
                <kbq-progress-spinner
                    kbq-loader-overlay-indicator
                    [mode]="'indeterminate'"
                    [color]="themePalette.Error">
                </kbq-progress-spinner>

                <div kbq-loader-overlay-text>Создание отчета</div>
                <div kbq-loader-overlay-caption>18,7 МБ из 25 МБ — осталось 2 мин</div>
            </kbq-loader-overlay>
        </div>`
})
class OverlayWithExternalParams {
    themePalette = ThemePalette;
}
