import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectExampleText } from '../l10n';

/**
 * @title Select
 */
@Component({
    selector: 'select-overview-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select [value]="selected">
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

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectOverviewExample {
    protected readonly text = injectExampleText();

    readonly options = computed(() => Array.from({ length: 5 }, (_, i) => this.text().optionN(i)));
    readonly selected = this.options[0];
}
