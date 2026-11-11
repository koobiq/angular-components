import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectExampleText } from './l10n';

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
export class SelectTwoLineOptionExample {
    protected readonly text = injectExampleText();

    readonly options = computed(() => [
        this.text().optionN(0),
        this.text().optionN(1),
        this.text().twoLong1,
        this.text().optionN(3),
        this.text().twoLong2
    ]);
    readonly selected = computed(() => [this.options()[0]]);
}
