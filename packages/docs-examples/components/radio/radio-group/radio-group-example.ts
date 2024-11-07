import { Component } from '@angular/core';
import { KbqRadioModule } from '@koobiq/components/radio';

/**
 * @title Radio group
 */
@Component({
    standalone: true,
    selector: 'radio-group-example',
    imports: [
        KbqRadioModule
    ],
    template: `
        <div class="layout-margin-bottom-m kbq-form__label">Наименование поля</div>
        <kbq-radio-group name="my_options_7">
            <kbq-radio-button
                [checked]="true"
                [value]="'option_1'"
            >
                Item 1
            </kbq-radio-button>

            <kbq-radio-button [value]="'option_2'">Item 2</kbq-radio-button>

            <kbq-radio-button [value]="'option_3'">Item 3</kbq-radio-button>

            <kbq-radio-button [value]="'option_4'">Item 4</kbq-radio-button>

            <kbq-radio-button
                [disabled]="true"
                [value]="'option_5'"
            >
                Item 5 (Disabled)
            </kbq-radio-button>
        </kbq-radio-group>
    `
})
export class RadioGroupExample {}
