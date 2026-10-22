import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqInput, KbqInputModule } from '@koobiq/components/input';

@Component({
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [formControl]="control" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ControlInSameTemplate {
    readonly control = new FormControl('koobiq');
}

@Component({
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            @if (show) {
                <input kbqInput [formControl]="control" />
            }
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ControlInEmbeddedView {
    readonly show = true;
    readonly control = new FormControl('koobiq');
}

const setup = async <T>(component: new () => T) => {
    TestBed.configureTestingModule({ imports: [component] });
    const fixture = TestBed.createComponent(component);

    fixture.autoDetectChanges();
    await fixture.whenStable();

    const formField: HTMLElement = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement;
    const input: HTMLInputElement = fixture.debugElement.query(By.directive(KbqInput)).nativeElement;

    return { fixture, formField, input };
};

describe('triage: forwarded ng-* classes after markAllAsTouched() from outside the field', () => {
    it('control: with the control in the same template, NgControlStatus refreshes the shared view and the class follows', async () => {
        const { fixture, formField, input } = await setup(ControlInSameTemplate);

        expect(formField.classList).toContain('ng-untouched');

        fixture.componentInstance.control.markAllAsTouched();
        await fixture.whenStable();

        expect(input.classList).toContain('ng-touched');
        expect(formField.classList).toContain('ng-touched');
        expect(formField.classList).not.toContain('ng-untouched');
    });

    // An embedded view has no reactive consumer of its own: the signals NgControlStatus reads in it refresh the
    // component view, whose refresh runs the host bindings of KbqFormField too.
    it('control: with the control inside an @if block, the class follows as well', async () => {
        const { fixture, formField, input } = await setup(ControlInEmbeddedView);

        expect(formField.classList).toContain('ng-untouched');

        fixture.componentInstance.control.markAllAsTouched();
        await fixture.whenStable();

        expect(input.classList).toContain('ng-touched');
        expect(formField.classList).toContain('ng-touched');
        expect(formField.classList).not.toContain('ng-untouched');
    });
});
