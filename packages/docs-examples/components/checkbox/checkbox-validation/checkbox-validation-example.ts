import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqError, KbqHint } from '@koobiq/components/form-field';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Checkbox validation
 */
@Component({
    selector: 'checkbox-validation-example',
    imports: [FormsModule, KbqCheckboxModule, KbqHint, KbqError, KbqButtonModule],
    template: `
        <form class="example-checkbox-validation layout-column layout-align-start-start layout-gap-l">
            <kbq-checkbox name="agreement" required [(ngModel)]="agreement">
                {{ text().acceptTerms }}
                <kbq-hint>{{ text().validationHint }}</kbq-hint>
                <kbq-error>{{ text().validationError }}</kbq-error>
            </kbq-checkbox>

            <button color="contrast" kbq-button type="submit">{{ text().continue }}</button>
        </form>
    `,
    // A fixed width keeps the centered example in place whatever the width of the error that appears.
    styles: `
        .example-checkbox-validation {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-align-center-center layout-row layout-padding-l'
    }
})
export class CheckboxValidationExample extends BaseLocalizedExample<ExampleText> {
    protected readonly agreement = signal(false);

    constructor() {
        super(TEXT);
    }
}
