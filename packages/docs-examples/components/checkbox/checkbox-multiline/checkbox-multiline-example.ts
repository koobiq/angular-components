import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Checkbox multiline example
 */
@Component({
    selector: 'checkbox-multiline-example',
    imports: [KbqCheckboxModule, KbqFormFieldModule],
    template: `
        <kbq-checkbox>
            {{ t().multilineText }}
            <kbq-hint>
                {{ t().multilineHint }}
            </kbq-hint>
        </kbq-checkbox>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
        }

        .kbq-checkbox {
            max-width: 400px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxMultilineExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
