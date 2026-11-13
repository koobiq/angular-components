import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqOptionBase } from '@koobiq/components/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Select cleaner with disabled options
 */
@Component({
    selector: 'select-cleaner-with-disabled-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple [placeholder]="t().kept" [value]="selected">
                <kbq-cleaner />
                @for (option of options; track option.value) {
                    <kbq-option [value]="option.value" [disabled]="option.disabled">{{ option.value }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-select multiple [placeholder]="t().cleared" [value]="selected" [clearPredicate]="clearEverything">
                <kbq-cleaner />
                @for (option of options; track option.value) {
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
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly options = Array.from({ length: 4 }, (_, i) => ({
        value: 'Option #' + i,
        disabled: i === 1
    }));

    readonly selected = this.options.map(({ value }) => value);

    /** Opts out of the default, which leaves the disabled options selected. */
    readonly clearEverything = (_option: KbqOptionBase) => true;
}
