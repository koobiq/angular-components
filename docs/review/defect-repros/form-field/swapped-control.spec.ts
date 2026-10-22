import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqInputModule, KbqInputPassword } from '@koobiq/components/input';

@Component({
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            @if (password()) {
                <input kbqInputPassword [formControl]="second" />
            } @else {
                <input kbqInput [formControl]="first" />
            }
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class SwappedControl {
    readonly password = signal(false);
    readonly first = new FormControl('', Validators.required);
    readonly second = new FormControl('', Validators.required);
}

const setup = async () => {
    TestBed.configureTestingModule({ imports: [SwappedControl] });
    const fixture = TestBed.createComponent(SwappedControl);

    fixture.autoDetectChanges();
    await fixture.whenStable();

    const { classList } = fixture.debugElement.query(By.directive(KbqFormField)).nativeElement as HTMLElement;

    return { fixture, classList };
};

describe('triage: a control swapped into KbqFormField after initialization', () => {
    it('DEFECT: the form field keeps the type class of the first control', async () => {
        const { fixture, classList } = await setup();

        expect(classList).toContain('kbq-form-field-type-input');

        fixture.componentInstance.password.set(true);
        await fixture.whenStable();

        expect(fixture.debugElement.query(By.directive(KbqInputPassword))).not.toBeNull();
        expect(classList).toContain('kbq-form-field-type-input');
        expect(classList).not.toContain('kbq-form-field-type-input-password');
    });

    // Not a defect: the `valueChanges` subscription is tied to the first control, but NgControlStatus on the new
    // input reads the signals of Angular forms, and an embedded view tracks them in the consumer of its component.
    it('control: the forwarded ng-* classes still follow a programmatic change of the swapped-in control', async () => {
        const { fixture, classList } = await setup();
        const { componentInstance } = fixture;

        componentInstance.password.set(true);
        await fixture.whenStable();
        expect(classList).toContain('ng-invalid');

        componentInstance.second.setValue('koobiq');
        await fixture.whenStable();

        expect(classList).toContain('ng-valid');
        expect(classList).not.toContain('ng-invalid');

        componentInstance.second.markAsTouched();
        await fixture.whenStable();

        expect(classList).toContain('ng-touched');
    });
});
