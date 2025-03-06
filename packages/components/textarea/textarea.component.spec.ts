import { Component, Provider, Type, ViewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { createMouseEvent, dispatchEvent } from '@koobiq/cdk/testing';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTextarea, KbqTextareaModule } from './index';

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

@Component({
    template: `
        <kbq-form-field>
            <textarea [(ngModel)]="value" kbqTextarea required></textarea>
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
                <textarea [(ngModel)]="value" kbqTextarea name="control" required></textarea>
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
            <textarea class="kbq-textarea_monospace" [(ngModel)]="value" kbqTextarea></textarea>
        </kbq-form-field>
    `
})
class KbqTextareaWithMonospace {
    value: string = 'test';
}

@Component({
    template: `
        <kbq-form-field>
            <textarea [(ngModel)]="value" [placeholder]="placeholder" [disabled]="disabled" kbqTextarea></textarea>
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
        <kbq-form-field kbqFormFieldWithoutBorders>
            <textarea kbqTextarea></textarea>
        </kbq-form-field>
    `
})
class KbqFormFieldWithoutBorders {}

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
});
