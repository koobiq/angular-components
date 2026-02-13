import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, ThemePalette } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

describe('KbqIconButton', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, TestApp]
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
