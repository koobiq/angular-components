import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule, KbqNormalizeWhitespace } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Input number
 */
@Component({
    selector: 'input-number-overview-example',
    imports: [
        KbqInputModule,
        FormsModule,
        KbqFormsModule,
        KbqNormalizeWhitespace
    ],
    template: `
        <div class="kbq-text-big">
            <div class="kbq-form-horizontal">
                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40" for="number-with-bounds">
                        {{ t().numberWithBounds }}
                    </label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input
                            id="number-with-bounds"
                            kbqNumberInput
                            kbqNormalizeWhitespace
                            [max]="12000"
                            [min]="-12000"
                            [(ngModel)]="value"
                        />
                        <kbq-stepper />

                        <kbq-hint>{{ t().hintBounds }}</kbq-hint>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40" for="number-with-separator">
                        {{ t().numberWithSeparator }}
                    </label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input id="number-with-separator" kbqNumberInput kbqNormalizeWhitespace [(ngModel)]="value" />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40" for="number-without-separator">
                        {{ t().numberWithoutSeparator }}
                    </label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input
                            id="number-without-separator"
                            kbqNumberInput
                            kbqNormalizeWhitespace
                            [withThousandSeparator]="false"
                            [(ngModel)]="value"
                        />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40" for="number-integer">{{ t().integer }}</label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input
                            id="number-integer"
                            kbqNumberInput
                            kbqNormalizeWhitespace
                            [integer]="true"
                            [(ngModel)]="integerValue"
                        />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputNumberOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    value = '';
    integerValue = '';
}
