import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Select disabled
 */
@Component({
    selector: 'select-disabled-example',
    imports: [KbqSelectModule],
    template: `
        <div class="example-row">
            <div class="kbq-form__label">{{ text().forSelect }}</div>
            <kbq-form-field>
                <kbq-select disabled [placeholder]="text().placeholder" [value]="selected">
                    @for (option of options(); track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>

        <div class="example-row">
            <div class="kbq-form__label">{{ text().forOptions }}</div>
            <kbq-form-field>
                <kbq-select [placeholder]="text().placeholder" [value]="selected">
                    @for (option of options(); track option) {
                        <kbq-option [disabled]="$odd" [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>

        <div class="example-row">
            <div class="kbq-form__label">{{ text().forOptgroup }}</div>
            <kbq-form-field>
                <kbq-select [placeholder]="text().placeholder" [value]="selected">
                    @for (group of groups(); track group; let odd = $odd) {
                        <kbq-optgroup [label]="group" [disabled]="odd">
                            @for (option of options(); track option) {
                                <kbq-option [value]="option">{{ option }}</kbq-option>
                            }
                        </kbq-optgroup>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    styles: `
        .example-row {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 440px;
            margin: 0 auto;
            padding: var(--kbq-size-l);
            gap: var(--kbq-size-xxl);
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectDisabledExample extends BaseLocalizedExample<ExampleText> {
    readonly options = computed(() => Array.from({ length: 5 }, (_, i) => 'Option #' + i));
    readonly groups = computed(() => Array.from({ length: 3 }, (_, i) => 'Group #' + i));
    readonly selected = this.options[0];

    constructor() {
        super(TEXT);
    }
}
