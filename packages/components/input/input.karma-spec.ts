import { Component, Provider, Type } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ESCAPE } from '@koobiq/cdk/keycodes';
import { dispatchFakeEvent, dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInput, KbqInputModule } from './index';

function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [FormsModule, KbqInputModule, KbqFormFieldModule, ...imports],
        declarations: [component],
        providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }, ...providers]
    }).compileComponents();

    return TestBed.createComponent<T>(component);
}

@Component({
    template: `
        <kbq-form-field>
            <input
                [(ngModel)]="value"
                kbqInput
            />
            <kbq-cleaner />
        </kbq-form-field>
    `
})
class KbqFormFieldWithCleaner {
    value: string;
}

describe('KbqInput', () => {
    describe('basic behaviors', () => {
        it('should has cleaner', () => {
            const fixture = createComponent(KbqFormFieldWithCleaner, [KbqIconModule]);
            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);

            inputElement.value = 'test';
            dispatchFakeEvent(inputElement, 'input');

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(1);

            const kbqCleaner = fixture.debugElement.query(By.css('.kbq-form-field__cleaner'));
            const kbqCleanerElement = kbqCleaner.nativeElement;
            kbqCleanerElement.click();

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);
            expect(testComponent.value).toBe(null);
        });

        it('with cleaner on keydown "ESC" should clear field', () => {
            const fixture = createComponent(KbqFormFieldWithCleaner, [KbqIconModule]);
            const kbqFormFieldDebug = fixture.debugElement.query(By.directive(KbqFormField));
            const formFieldElement = kbqFormFieldDebug.nativeElement;
            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            inputElement.value = 'test';
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(1);

            dispatchKeyboardEvent(kbqFormFieldDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);
            expect(testComponent.value).toBe(null);
        });
    });

    describe('validation', () => {
        it('should has cleaner', () => {
            const fixture = createComponent(KbqFormFieldWithCleaner, [KbqIconModule]);
            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);

            inputElement.value = 'test';
            dispatchFakeEvent(inputElement, 'input');

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(1);

            const kbqCleaner = fixture.debugElement.query(By.css('.kbq-form-field__cleaner'));
            const kbqCleanerElement = kbqCleaner.nativeElement;
            kbqCleanerElement.click();

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);
            expect(testComponent.value).toBe(null);
        });

        it('with cleaner on keydown "ESC" should clear field', () => {
            const fixture = createComponent(KbqFormFieldWithCleaner, [KbqIconModule]);
            const kbqFormFieldDebug = fixture.debugElement.query(By.directive(KbqFormField));
            const formFieldElement = kbqFormFieldDebug.nativeElement;
            const inputElementDebug = fixture.debugElement.query(By.directive(KbqInput));
            const inputElement = inputElementDebug.nativeElement;

            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            inputElement.value = 'test';
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(1);

            dispatchKeyboardEvent(kbqFormFieldDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.kbq-form-field__cleaner').length).toBe(0);
            expect(testComponent.value).toBe(null);
        });
    });
});
