import { Component, signal, viewChild } from '@angular/core';
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
                OverlayWithExternalParams,
                OverlayWithValuelessTransparent,
                OverlayWithChangingText
            ]
        }).compileComponents();
    });

    it('should be transparent by default', () => {
        const fixture = TestBed.createComponent(OverlayWithParams);

        fixture.detectChanges();

        expect(fixture.componentInstance.overlay().transparent()).toBeTruthy();
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
    readonly overlay = viewChild.required(KbqLoaderOverlay);
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
