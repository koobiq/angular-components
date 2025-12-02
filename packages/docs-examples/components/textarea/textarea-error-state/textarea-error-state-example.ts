import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Textarea error state
 */
@Component({
    selector: 'textarea-error-state-example',
    imports: [KbqFormFieldModule, KbqTextareaModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-label>Label</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" [formControl]="control"></textarea>
            <kbq-hint>Please enter at least 10 characters</kbq-hint>
            <kbq-error>Minimum 10 characters</kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    host: {
        class: 'layout-margin-xl layout-row'
    }
})
export class TextareaErrorStateExample {
    protected readonly control = new FormControl('', [Validators.minLength(10), Validators.required]);

    constructor() {
        afterNextRender(() => {
            this.control.markAsTouched();
            this.control.updateValueAndValidity();
        });
    }
}
