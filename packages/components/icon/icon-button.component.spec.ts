import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, ThemePalette } from '@koobiq/components/core';
import { KbqIconButtonSize, KbqIconModule } from '@koobiq/components/icon';

describe('KbqIconButton', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, TestApp, SizeTestApp]
        }).compileComponents();
    });

    it('should apply class based on color attribute', () => {
        const fixture = TestBed.createComponent(TestApp);

        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));
        const iDebugElement = fixture.debugElement.query(By.css('i'));

        testComponent.color = KbqComponentColors.Theme;
        fixture.detectChanges();
        expect(buttonDebugElement.nativeElement.classList.contains('kbq-theme')).toBe(true);
        expect(iDebugElement.nativeElement.classList.contains('kbq-theme')).toBe(true);
    });

    it('should not clear previous defined classes', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));

        buttonDebugElement.nativeElement.classList.add('custom-class');

        testComponent.color = KbqComponentColors.Theme;
        fixture.detectChanges();

        expect(buttonDebugElement.nativeElement.classList.contains('kbq-theme')).toBe(true);
        expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);
    });

    it('should handle a click on the button', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));

        const spyFn = jest.spyOn(testComponent, 'onClick');

        expect(spyFn).not.toHaveBeenCalled();

        buttonDebugElement.nativeElement.click();

        expect(spyFn).toHaveBeenCalled();
    });

    it('should disable the native button element', () => {
        const fixture = TestBed.createComponent(TestApp);
        const buttonNativeElement = fixture.nativeElement.querySelector('button');

        expect(buttonNativeElement.disabled).toBeFalsy();

        fixture.componentInstance.isDisabled = true;
        fixture.detectChanges();
        expect(buttonNativeElement.disabled).toBeTruthy();
        expect(buttonNativeElement.classList.contains('kbq-disabled')).toBe(true);
    });

    describe('size input', () => {
        let fixture: ComponentFixture<SizeTestApp>;
        let buttonEl: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(SizeTestApp);
            buttonEl = fixture.debugElement.query(By.css('i')).nativeElement;
            fixture.detectChanges();
        });

        it('should not add compact class when size is normal (default)', () => {
            expect(buttonEl.classList.contains('kbq-icon-button_compact')).toBe(false);
        });

        it('should add compact class when size is compact', () => {
            fixture.componentInstance.size = 'compact';
            fixture.detectChanges();
            expect(buttonEl.classList.contains('kbq-icon-button_compact')).toBe(true);
        });

        it('should add compact class when deprecated small input is true', () => {
            fixture.componentInstance.small = true;
            fixture.detectChanges();
            expect(buttonEl.classList.contains('kbq-icon-button_compact')).toBe(true);
        });

        it('should not add compact class when size is normal and small is false', () => {
            fixture.componentInstance.size = 'normal';
            fixture.componentInstance.small = false;
            fixture.detectChanges();
            expect(buttonEl.classList.contains('kbq-icon-button_compact')).toBe(false);
        });
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button
            kbq-icon-button="kbq-chevron-down-s_16"
            [color]="color"
            [disabled]="isDisabled"
            (click)="onClick()"
        ></button>

        <i kbq-icon-button="kbq-chevron-down-s_16" [color]="color" [disabled]="isDisabled" (click)="onClick()"></i>
    `
})
class TestApp {
    isDisabled: boolean = false;
    color: ThemePalette;

    onClick() {}
}

@Component({
    selector: 'size-test-app',
    imports: [KbqIconModule],
    template: `
        <i kbq-icon-button="kbq-chevron-down-s_16" [size]="size" [small]="small"></i>
    `
})
class SizeTestApp {
    size: KbqIconButtonSize = 'normal';
    small = false;
}
