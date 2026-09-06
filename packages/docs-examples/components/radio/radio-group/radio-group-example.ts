import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqRadioModule } from '@koobiq/components/radio';

/**
 * @title Radio group
 */
@Component({
    selector: 'radio-group-example',
    imports: [
        KbqRadioModule
    ],
    template: `
        <div id="radio-group-label" class="layout-margin-bottom-m kbq-form__label">Field label</div>
        <kbq-radio-group aria-labelledby="radio-group-label">
            <kbq-radio-button [checked]="true" [value]="'option_1'">Item 1</kbq-radio-button>

            <kbq-radio-button [value]="'option_2'">Item 2</kbq-radio-button>

            <kbq-radio-button [value]="'option_3'">Item 3</kbq-radio-button>

            <kbq-radio-button [value]="'option_4'">Item 4</kbq-radio-button>

            <kbq-radio-button [disabled]="true" [value]="'option_5'">Item 5 (Disabled)</kbq-radio-button>
        </kbq-radio-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioGroupExample {}
