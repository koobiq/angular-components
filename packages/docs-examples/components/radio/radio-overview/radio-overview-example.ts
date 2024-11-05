import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioModule } from '@koobiq/components/radio';

/**
 * @title Radio
 */
@Component({
    standalone: true,
    selector: 'radio-overview-example',
    imports: [
        KbqRadioModule,
        KbqCheckboxModule,
        KbqFormFieldModule,
        FormsModule
    ],
    template: `
        <kbq-radio-group name="my_options">
            <kbq-radio-button
                [disabled]="isDisabled"
                [value]="'option_1'"
            >
                Option 1
                <kbq-hint>kbq-hint</kbq-hint>
            </kbq-radio-button>

            <kbq-radio-button
                [disabled]="isDisabled"
                [value]="'option_2'"
            >
                Option 2
                <kbq-hint>kbq-hint</kbq-hint>
            </kbq-radio-button>

            <kbq-radio-button
                [disabled]="isDisabled"
                [value]="'option_3'"
            >
                Option 3
                <kbq-hint>kbq-hint</kbq-hint>
            </kbq-radio-button>
        </kbq-radio-group>

        <br />
        <br />

        <kbq-radio-group
            class="example-radio-group"
            [big]="true"
            name="my_options"
        >
            <kbq-radio-button
                [disabled]="isDisabled"
                [value]="'option_1'"
            >
                Option 1
                <kbq-hint>kbq-hint</kbq-hint>
            </kbq-radio-button>

            <kbq-radio-button
                [disabled]="isDisabled"
                [value]="'option_2'"
            >
                Option 2
                <kbq-hint>kbq-hint</kbq-hint>
            </kbq-radio-button>

            <kbq-radio-button
                [disabled]="isDisabled"
                [value]="'option_3'"
            >
                Option 3
                <kbq-hint>kbq-hint</kbq-hint>
            </kbq-radio-button>
        </kbq-radio-group>

        <kbq-checkbox
            [(ngModel)]="isDisabled"
            style="display: flex; margin-top: 10px"
        >
            Disabled
        </kbq-checkbox>
    `
})
export class RadioOverviewExample {
    isDisabled = false;
}
