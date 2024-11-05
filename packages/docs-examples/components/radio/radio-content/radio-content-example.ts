import { Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioModule } from '@koobiq/components/radio';

/**
 * @title Radio content
 */
@Component({
    standalone: true,
    selector: 'radio-content-example',
    imports: [
        KbqRadioModule,
        KbqFormFieldModule
    ],
    template: `
        <div class="kbq-body layout-wrap">
            <div
                class="layout-row layout-wrap"
                style="gap: 24px"
            >
                <div class="example-radio-group">
                    <div class="layout-margin-bottom-m kbq-form__label">Text</div>
                    <kbq-radio-group name="my_options_5">
                        <kbq-radio-button
                            [checked]="true"
                            [value]="'option_1'"
                        >
                            William Anderson
                        </kbq-radio-button>

                        <kbq-radio-button [value]="'option_2'">James Peterson</kbq-radio-button>

                        <kbq-radio-button [value]="'option_3'">Alexander Brown</kbq-radio-button>

                        <kbq-radio-button [value]="'option_4'">Benjamin Collins</kbq-radio-button>

                        <kbq-radio-button
                            [disabled]="true"
                            [value]="'option_5'"
                        >
                            Nicholas Cooper
                        </kbq-radio-button>
                    </kbq-radio-group>
                </div>
                <div class="example-radio-group">
                    <div class="layout-margin-bottom-m kbq-form__label">Text with Caption</div>
                    <kbq-radio-group name="my_options_6">
                        <kbq-radio-button
                            [checked]="true"
                            [value]="'option_1'"
                        >
                            William Anderson
                            <kbq-hint>Lawyer</kbq-hint>
                        </kbq-radio-button>

                        <kbq-radio-button [value]="'option_2'">
                            James Peterson
                            <kbq-hint>Programmer</kbq-hint>
                        </kbq-radio-button>

                        <kbq-radio-button [value]="'option_3'">
                            Alexander Brown
                            <kbq-hint>Biologist</kbq-hint>
                        </kbq-radio-button>

                        <kbq-radio-button [value]="'option_4'">
                            Benjamin Collins
                            <kbq-hint>Banker</kbq-hint>
                        </kbq-radio-button>

                        <kbq-radio-button
                            [disabled]="true"
                            [value]="'option_5'"
                        >
                            Nicholas Cooper
                            <kbq-hint>Writer</kbq-hint>
                        </kbq-radio-button>
                    </kbq-radio-group>
                </div>
            </div>
        </div>
    `
})
export class RadioContentExample {
    isDisabled = false;
}
