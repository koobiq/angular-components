import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule, KbqNormalizeWhitespace } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

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
                        С разделением групп разрядов, с мин. и макс. ограничением
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

                        <kbq-hint>От −12 000 до 12 000</kbq-hint>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40" for="number-with-separator">
                        С разделителем групп разрядов
                    </label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input id="number-with-separator" kbqNumberInput kbqNormalizeWhitespace [(ngModel)]="value" />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40" for="number-without-separator">
                        Без разделителя групп разрядов
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
                    <label class="kbq-form__label flex-40" for="number-integer">Целочисленное значение</label>
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
    value = '';
    integerValue = '';
}
