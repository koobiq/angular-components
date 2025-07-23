import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Validation message for specific field
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'validation-message-for-specific-field-example',
    template: `
        <form class="kbq-form-vertical" [formGroup]="form" novalidate style="width: 320px">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>The error message appears above the hint</kbq-label>
                        <input formControlName="first" kbqInput />

                        @if (form.get('first')?.hasError('required')) {
                            <kbq-error>Required</kbq-error>
                        }

                        <kbq-hint>Hint under the field</kbq-hint>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>The error message replaces the hint</kbq-label>
                        <input formControlName="last" kbqInput />

                        @if (form.get('first')?.hasError('required')) {
                            <kbq-error>Required</kbq-error>
                        } @else {
                            <kbq-hint>Hint under the field</kbq-hint>
                        }
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <button class="flex-25" color="contrast" kbq-button type="submit">Send</button>
                </div>
            </div>
        </form>
    `,
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormsModule
    ],
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationMessageForSpecificFieldExample {
    protected readonly form = new FormGroup({
        first: new FormControl('', [Validators.required]),
        last: new FormControl('', [Validators.required])
    });
}
