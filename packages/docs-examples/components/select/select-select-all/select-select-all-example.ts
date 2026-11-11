import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectExampleText } from '../l10n';

/**
 * @title Select all
 */
@Component({
    selector: 'select-select-all-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple selectAll [placeholder]="text().placeholder" [value]="selected">
                <kbq-cleaner />

                @for (option of options(); track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field-type-select {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSelectAllExample {
    protected readonly text = injectExampleText();

    readonly options = computed(() => Array.from({ length: 6 }, (_, i) => this.text().optionN(i + 1)));
    readonly selected = [this.options[1]];
}
