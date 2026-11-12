import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Textarea error state
 */
@Component({
    selector: 'textarea-error-state-example',
    imports: [KbqTextareaModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ text().label }}</kbq-label>
            <textarea kbqTextarea [placeholder]="text().placeholder" [formControl]="control"></textarea>
            <kbq-hint>{{ text().hint10 }}</kbq-hint>
            <kbq-error>{{ text().min10 }}</kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-xl layout-row'
    }
})
export class TextareaErrorStateExample extends BaseLocalizedExample<ExampleText> {
    protected readonly control = new FormControl('', [Validators.minLength(10), Validators.required]);

    constructor() {
        super(TEXT);
        afterNextRender(() => {
            this.control.markAsTouched();
            this.control.updateValueAndValidity();
        });
    }
}
