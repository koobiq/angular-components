import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqRadioModule } from '@koobiq/components/radio';

/**
 * @title Radio invalid
 */
@Component({
    standalone: true,
    selector: 'radio-invalid-example',
    imports: [
        KbqRadioModule,
        KbqButtonModule
    ],
    template: `
        <div class="example-radio-group">
            <div class="layout-margin-bottom-m kbq-form__label">Наименование поля</div>
            <kbq-radio-group name="my_options_8">
                <kbq-radio-button
                    [checked]="true"
                    [value]="'option_1'"
                >
                    Valid
                </kbq-radio-button>

                <kbq-radio-button [value]="'option_2'">Valid</kbq-radio-button>

                <kbq-radio-button [value]="'option_3'">Invalid</kbq-radio-button>
            </kbq-radio-group>
        </div>
        <button
            class="layout-margin-top-l"
            kbq-button
        >
            Отправить
        </button>
    `
})
export class RadioInvalidExample {}
