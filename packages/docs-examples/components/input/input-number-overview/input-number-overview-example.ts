import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule, KbqNormalizeWhitespace } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Input number
 */
@Component({
    selector: 'input-number-overview-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule,
        KbqFormsModule,
        KbqNormalizeWhitespace
    ],
    template: `
        <div class="kbq-text-big">
            <div class="kbq-form-horizontal">
                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40">
                        С разделением групп разрядов, с мин. и макс. ограничением
                    </label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input
                            kbqNumberInput
                            kbqNormalizeWhitespace
                            placeholder="Allowed number from -7 to 7"
                            [max]="12000"
                            [min]="-12000"
                            [(ngModel)]="value"
                        />
                        <kbq-stepper />

                        <kbq-hint>От −12 000 до 12 000</kbq-hint>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40">С разделителем групп разрядов</label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input kbqNumberInput kbqNormalizeWhitespace [(ngModel)]="value" />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40">Без разделителя групп разрядов</label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input
                            kbqNumberInput
                            kbqNormalizeWhitespace
                            [withThousandSeparator]="false"
                            [(ngModel)]="value"
                        />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40">Целочисленное значение</label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input kbqNumberInput kbqNormalizeWhitespace [integer]="true" [(ngModel)]="integerValue" />
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
