import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Textarea error state
 */
@Component({
    selector: 'textarea-error-state-example',
    imports: [KbqTextareaModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().label }}</kbq-label>
            <textarea kbqTextarea [placeholder]="t().placeholder" [formControl]="control"></textarea>
            <kbq-hint>{{ t().hint10 }}</kbq-hint>
            <kbq-error>{{ t().min10 }}</kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-xl layout-row'
    }
})
export class TextareaErrorStateExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly control = new FormControl('', [Validators.minLength(10), Validators.required]);

    constructor() {
        afterNextRender(() => {
            this.control.markAsTouched();
            this.control.updateValueAndValidity();
        });
    }
}
