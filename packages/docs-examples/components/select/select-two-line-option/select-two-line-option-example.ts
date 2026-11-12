import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title select two line option
 */
@Component({
    selector: 'select-two-line-option-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple multilineOptions [value]="selected()">
                @for (option of options(); track option) {
                    <kbq-option [value]="option" [viewValue]="option">
                        <div>{{ option }}</div>
                        <div class="kbq-option-caption">caption</div>
                    </kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectTwoLineOptionExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly options = computed(() => [
        'Option #0',
        'Option #1',
        this.t().twoLong1,
        'Option #3',
        this.t().twoLong2
    ]);
    readonly selected = computed(() => [this.options()[0]]);

    constructor() {
        super(TRANSLATIONS);
    }
}
