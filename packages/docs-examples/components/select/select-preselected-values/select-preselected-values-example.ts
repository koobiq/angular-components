import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectExampleText } from '../l10n';

/**
 * @title Selected preselected values
 */
@Component({
    selector: 'select-preselected-values-example',
    imports: [KbqSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-select
                multiple
                [placeholder]="text().placeholder"
                [showPreselectedValues]="true"
                [formControl]="control"
            >
                @for (option of options(); track option) {
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
export class SelectPreselectedValuesExample {
    protected readonly text = injectExampleText();

    readonly options = computed(() => Array.from({ length: 15 }, (_, i) => 'Option #' + i));
    control = new FormControl(['Option #101', 'Option #102']);
}
