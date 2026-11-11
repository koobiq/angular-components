import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectExampleText } from '../l10n';

/**
 * @title Select all label
 */
@Component({
    selector: 'select-select-all-label-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select #select="kbqSelect" multiple selectAll [placeholder]="text().placeholder" [value]="selected">
                <!-- Projected only while everything is selected, so the rest of the time the select falls
                     back to its default trigger and lists the selected options as usual. -->
                @if (select.allOptionsSelected) {
                    <kbq-select-trigger>All options</kbq-select-trigger>
                }

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
export class SelectSelectAllLabelExample {
    protected readonly text = injectExampleText();

    readonly options = computed(() => Array.from({ length: 6 }, (_, i) => this.text().optionN(i + 1)));
    readonly selected = [...this.options()];
}
