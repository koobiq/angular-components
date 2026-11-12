import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Select locale configuration
 */
@Component({
    selector: 'select-locale-configuration-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().defaultStrings }}</kbq-label>
            <kbq-select multiple selectAll [placeholder]="t().placeholder" [value]="selected">
                @for (option of options(); track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>{{ t().overriddenInstance }}</kbq-label>
            <!-- Keyed by locale section, so one binding also reaches the accessible name of the cleaner
                 projected into the select. Every string it does not mention keeps following the locale. -->
            <kbq-select
                multiple
                selectAll
                [placeholder]="t().placeholder"
                [value]="selected"
                [localeOverrides]="{
                    select: { selectAll: 'Take everything' },
                    a11y: { clear: 'Drop the selection' }
                }"
            >
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
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l);
        }

        .kbq-form-field-type-select {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectLocaleConfigurationExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly options = computed(() => Array.from({ length: 4 }, (_, i) => 'Option #' + (i + 1)));
    readonly selected = [this.options[0]];

    constructor() {
        super(TRANSLATIONS);
    }
}
