import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioModule } from '@koobiq/components/radio';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Radio multiline example
 */
@Component({
    selector: 'radio-multiline-example',
    imports: [KbqRadioModule, KbqFormFieldModule],
    template: `
        <kbq-radio-group aria-label="Security practices">
            @for (option of options(); track option) {
                <kbq-radio-button [checked]="$first" [value]="$index">
                    {{ option.label }}
                    <kbq-hint>{{ option.hint }}</kbq-hint>
                </kbq-radio-button>
            }
        </kbq-radio-group>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
        }

        .kbq-radio-group {
            max-width: 255px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioMultilineExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly options = computed(() => this.t().practiceOptions);
}
