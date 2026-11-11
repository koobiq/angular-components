import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqOptionBase } from '@koobiq/components/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectExampleText } from './l10n';

/**
 * @title Select cleaner with disabled options
 */
@Component({
    selector: 'select-cleaner-with-disabled-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple [placeholder]="text().kept" [value]="selected">
                <kbq-cleaner />
                @for (option of options(); track option.value) {
                    <kbq-option [value]="option.value" [disabled]="option.disabled">{{ option.value }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-select multiple [placeholder]="text().cleared" [value]="selected" [clearPredicate]="clearEverything">
                <kbq-cleaner />
                @for (option of options(); track option.value) {
                    <kbq-option [value]="option.value" [disabled]="option.disabled">{{ option.value }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 240px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectCleanerWithDisabledExample {
    protected readonly text = injectExampleText();

    readonly options = computed(() =>
        Array.from({ length: 4 }, (_, i) => ({
            value: this.text().optionN(i),
            disabled: i === 1
        }))
    );

    readonly selected = this.options().map(({ value }) => value);

    /** Opts out of the default, which leaves the disabled options selected. */
    readonly clearEverything = (_option: KbqOptionBase) => true;
}
