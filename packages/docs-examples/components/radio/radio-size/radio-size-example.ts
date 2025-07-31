import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqRadioModule } from '@koobiq/components/radio';

/**
 * @title Radio size
 */
@Component({
    standalone: true,
    selector: 'radio-size-example',
    imports: [
        KbqRadioModule
    ],
    template: `
        <div class="kbq-text-big layout-wrap">
            <div class="layout-row layout-wrap" style="gap: 24px">
                <div class="example-radio-group">
                    <div class="layout-margin-bottom-m kbq-form__label">Normal</div>
                    <kbq-radio-group name="my_options">
                        <kbq-radio-button [checked]="true" [value]="'option_1'">William Anderson</kbq-radio-button>

                        <kbq-radio-button [value]="'option_2'">James Peterson</kbq-radio-button>

                        <kbq-radio-button [value]="'option_3'">Alexander Brown</kbq-radio-button>

                        <kbq-radio-button [value]="'option_4'">Benjamin Collins</kbq-radio-button>

                        <kbq-radio-button [value]="'option_5'">Nicholas Cooper</kbq-radio-button>
                    </kbq-radio-group>
                </div>
                <div class="example-radio-group">
                    <div class="layout-margin-bottom-m kbq-form__label">Big</div>
                    <kbq-radio-group name="my_options_2" [big]="true">
                        <kbq-radio-button [checked]="true" [value]="'option_1'">William Anderson</kbq-radio-button>

                        <kbq-radio-button [value]="'option_2'">James Peterson</kbq-radio-button>

                        <kbq-radio-button [value]="'option_3'">Alexander Brown</kbq-radio-button>

                        <kbq-radio-button [value]="'option_4'">Benjamin Collins</kbq-radio-button>

                        <kbq-radio-button [value]="'option_5'">Nicholas Cooper</kbq-radio-button>
                    </kbq-radio-group>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioSizeExample {}
