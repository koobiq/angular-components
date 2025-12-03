import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field with kbq-error */
@Component({
    selector: 'experimental-form-field-with-error-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Email</kbq-label>
            <input kbqInput placeholder="mail@koobiq.io" [formControl]="formControl" />
            <kbq-hint>Enter email</kbq-hint>
            <kbq-error>
                @if (formControl.hasError('required')) {
                    Should enter a value
                } @else {
                    Invalid email
                }
            </kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentalFormFieldWithErrorExample {
    readonly formControl = new FormControl('', [Validators.required, Validators.email]);
}
