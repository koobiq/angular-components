import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Select multiple
 */
@Component({
    selector: 'select-multiple-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple [placeholder]="text().placeholder" [value]="selected">
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
export class SelectMultipleExample extends BaseLocalizedExample<ExampleText> {
    readonly options = computed(() => Array.from({ length: 10 }, (_, i) => 'Option #' + i));
    readonly selected = this.options().slice(0, 3);

    constructor() {
        super(TEXT);
    }
}
