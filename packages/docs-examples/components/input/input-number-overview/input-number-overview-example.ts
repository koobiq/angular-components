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
        FormsModule,
        KbqFormsModule,
        KbqInputModule
    ],
    template: `
        <div class="kbq-body">
            <div class="kbq-form-horizontal">
                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40">
                        With min value, max value and localized thousand separator
                    </label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input
                            [(ngModel)]="value"
                            [bigStep]="1.5"
                            [max]="7"
                            [min]="-7"
                            [step]="0.5"
                            kbqNumberInput
                            placeholder="Allowed number from -7 to 7"
                        />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40">With localized thousand separator</label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input
                            [(ngModel)]="value"
                            kbqNumberInput
                        />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40">Without localized thousand separator</label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input
                            [(ngModel)]="value"
                            [withThousandSeparator]="false"
                            kbqNumberInput
                        />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label flex-40">With integer</label>
                    <kbq-form-field class="kbq-form__control flex-60">
                        <input
                            [(ngModel)]="integerValue"
                            [integer]="true"
                            kbqNumberInput
                        />
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
