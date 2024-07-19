import { Component, Provider, Type, ViewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { createMouseEvent, dispatchEvent, dispatchFakeEvent } from '@koobiq/cdk/testing';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTextarea, KbqTextareaModule } from './index';

const MIN_TEXTAREA_HEIGHT = 50;

function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            FormsModule,
            KbqTextareaModule,
            KbqFormFieldModule,
            ...imports
        ],
        declarations: [component],
        providers: [
            { provide: ComponentFixtureAutoDetect, useValue: true },
            ...providers
        ]
    }).compileComponents();

    return TestBed.createComponent<T>(component);
}

// tslint:disable no-unnecessary-class
@Component({
    template: `
        <kbq-form-field>
            <textarea
                [(ngModel)]="value"
                kbqTextarea
                required
            ></textarea>
        </kbq-form-field>
    `
})
class KbqTextareaInvalid {
    value: string = '';
}

@Component({
    template: `
        <form #form="ngForm">
            <kbq-form-field>
                <textarea
                    [(ngModel)]="value"
                    kbqTextarea
                    name="control"
                    required
                ></textarea>
            </kbq-form-field>

            <button type="submit"></button>
        </form>
    `
})
class KbqFormFieldWithNgModelInForm {
    @ViewChild('form', { static: false }) form: NgForm;

    value: string = '';
}

@Component({
    template: `
        <kbq-form-field>
            <textarea
                class="kbq-textarea_monospace"
                [(ngModel)]="value"
                kbqTextarea
            ></textarea>
        </kbq-form-field>
    `
})
class KbqTextareaWithMonospace {
    value: string = 'test';
}

@Component({
    template: `
        <kbq-form-field>
            <textarea
                [(ngModel)]="value"
                [placeholder]="placeholder"
                [disabled]="disabled"
                kbqTextarea
            ></textarea>
        </kbq-form-field>
    `
})
class KbqTextareaForBehaviors {
    value: string = 'test\ntest\ntest';
    placeholder: string;
    disabled: boolean = false;
}

@Component({
    template: `
        <kbq-form-field>
            <textarea
                [(ngModel)]="value"
                [canGrow]="false"
                kbqTextarea
            ></textarea>
        </kbq-form-field>
    `
})
class KbqTextareaGrowOff {
    value: string = 'test\ntest\ntest';
    placeholder: string;
    disabled: boolean = false;
}

@Component({
    template: `
        <kbq-form-field kbqFormFieldWithoutBorders>
            <textarea kbqTextarea></textarea>
        </kbq-form-field>
    `
})
class KbqFormFieldWithoutBorders {}

// tslint:enable no-unnecessary-class

describe('KbqTextarea', () => {
    describe('basic behaviors', () => {
        it('should change state "disable"', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);
            fixture.detectChanges();

            tick();

            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            expect(formFieldElement.classList.contains('kbq-disabled')).toBe(false);
            expect(textareaElement.disabled).toBe(false);

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(formFieldElement.classList.contains('kbq-disabled')).toBe(true);
                expect(textareaElement.disabled).toBe(true);
            });
        }));

        it('should has placeholder', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);
            fixture.detectChanges();

            tick();

            const testComponent = fixture.debugElement.componentInstance;

            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            expect(textareaElement.getAttribute('placeholder')).toBe(null);

            testComponent.placeholder = 'placeholder';
            fixture.detectChanges();

            expect(textareaElement.getAttribute('placeholder')).toBe('placeholder');

            testComponent.placeholder = '';
            fixture.detectChanges();

            expect(textareaElement.getAttribute('placeholder')).toBe('');
        }));
    });

    describe('appearance', () => {
        it('should change font to monospace', () => {
            const fixture = createComponent(KbqTextareaWithMonospace);
            fixture.detectChanges();

            const kbqTextareaDebug = fixture.debugElement.query(By.directive(KbqTextarea));
            const textareaElement = kbqTextareaDebug.nativeElement;

            expect(textareaElement.classList).toContain('kbq-textarea_monospace');
        });

        it('should run validation (required)', () => {
            const fixture = createComponent(KbqTextareaInvalid);
            fixture.detectChanges();

            const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
            expect(formFieldElement.classList.contains('ng-invalid')).toBe(true);
        });

        describe('in form', () => {
            it('should not run validation (required)', () => {
                const fixture = createComponent(KbqFormFieldWithNgModelInForm);
                fixture.detectChanges();

                const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
                expect(formFieldElement.classList.contains('ng-valid')).toBe(true);
            });

            it('should run validation after submit (required)', fakeAsync(() => {
                const fixture = createComponent(KbqFormFieldWithNgModelInForm);
                fixture.detectChanges();

                const formFieldElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
                const submitButton = fixture.debugElement.query(By.css('button')).nativeElement;

                expect(formFieldElement.classList.contains('ng-valid')).toBe(true);

                const event = createMouseEvent('click');
                dispatchEvent(submitButton, event);
                flush();
                expect(formFieldElement.classList.contains('ng-invalid')).toBe(true);
            }));
        });

        it('should be without borders', () => {
            const fixture = createComponent(KbqFormFieldWithoutBorders, [
                KbqIconModule
            ]);
            fixture.detectChanges();

            const kbqFormFieldDebug = fixture.debugElement.query(By.directive(KbqFormField));
            const formFieldElement = kbqFormFieldDebug.nativeElement;

            expect(formFieldElement.classList.contains('kbq-form-field_without-borders')).toBe(true);
        });
    });

    describe('grow', () => {
        // TODO Expected pixels
        xit('should grow initially', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);
            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            expect(textareaElement.getBoundingClientRect().height).toBeGreaterThan(MIN_TEXTAREA_HEIGHT);
        }));

        // TODO Expected pixels
        xit('should grow on input', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);
            fixture.componentInstance.value = 'test\ntest';
            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            const firstSize = textareaElement.getBoundingClientRect().height;

            expect(firstSize).toBeGreaterThan(MIN_TEXTAREA_HEIGHT);

            textareaElement.value = 'test\ntest\ntest\ntest\ntest\ntest';
            dispatchFakeEvent(textareaElement, 'input');

            fixture.detectChanges();

            tick();

            const secondSize = textareaElement.getBoundingClientRect().height;

            expect(firstSize).toBeLessThan(secondSize);
        }));

        // TODO Expected pixels
        xit('should grow on input', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);
            fixture.componentInstance.value = 'test\ntest\ntest\ntest\ntest\ntest';
            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            const firstSize = textareaElement.getBoundingClientRect().height;

            expect(firstSize).toBeGreaterThan(MIN_TEXTAREA_HEIGHT);

            textareaElement.value = 'test\ntest';
            dispatchFakeEvent(textareaElement, 'input');

            fixture.detectChanges();

            tick();

            const secondSize = textareaElement.getBoundingClientRect().height;

            expect(firstSize).toBeGreaterThan(secondSize);
        }));

        it('should have the class when glow is off', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaGrowOff);
            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            expect(textareaElement.classList.contains('kbq-textarea-resizable')).toBeTruthy();
        }));

        it('should not have the class when glow is on', fakeAsync(() => {
            const fixture = createComponent(KbqTextareaForBehaviors);
            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(By.directive(KbqTextarea)).nativeElement;

            expect(textareaElement.classList.contains('kbq-textarea-resizable')).toBeFalsy();
        }));
    });
});
