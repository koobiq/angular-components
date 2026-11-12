import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqSelectModule } from '@koobiq/components/select';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Selected preselected values
 */
@Component({
    selector: 'select-preselected-values-example',
    imports: [KbqSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple [placeholder]="t().placeholder" [showPreselectedValues]="true" [formControl]="control">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }

                <kbq-cleaner />
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectPreselectedValuesExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly options = Array.from({ length: 15 }, (_, i) => 'Option #' + i);
    control = new FormControl(['Option #101', 'Option #102']);

    constructor() {
        super(TRANSLATIONS);
    }
}
