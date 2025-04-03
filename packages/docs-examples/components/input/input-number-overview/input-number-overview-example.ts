import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Input number
 */
@Component({
    standalone: true,
    selector: 'input-number-overview-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule,
        KbqFormsModule,
        KbqInputModule
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
                            [(ngModel)]="value"
                            [max]="12000"
                            [min]="-12000"
                            kbqNumberInput
                            placeholder="Allowed number from -7 to 7"
                        />
                        <kbq-stepper />

                        <kbq-hint>От −12 000 до 12 000</kbq-hint>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40">С разделителем групп разрядов</label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input [(ngModel)]="value" kbqNumberInput />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40">Без разделителя групп разрядов</label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input [(ngModel)]="value" [withThousandSeparator]="false" kbqNumberInput />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40">Целочисленное значение</label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input [(ngModel)]="integerValue" [integer]="true" kbqNumberInput />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>
            </div>
        </div>
    `
})
export class InputNumberOverviewExample {
    value = '';
    integerValue = '';
}
