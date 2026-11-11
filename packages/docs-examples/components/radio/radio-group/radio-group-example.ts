import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqRadioModule } from '@koobiq/components/radio';
import { injectExampleText } from '../l10n';

/**
 * @title Radio group
 */
@Component({
    selector: 'radio-group-example',
    imports: [
        KbqRadioModule
    ],
    template: `
        <div id="radio-group-label" class="layout-margin-bottom-m kbq-form__label">{{ text().fieldLabel }}</div>
        <kbq-radio-group aria-labelledby="radio-group-label">
            <kbq-radio-button [checked]="true" [value]="'option_1'">{{ text().item(1) }}</kbq-radio-button>

            <kbq-radio-button [value]="'option_2'">{{ text().item(2) }}</kbq-radio-button>

            <kbq-radio-button [value]="'option_3'">{{ text().item(3) }}</kbq-radio-button>

            <kbq-radio-button [value]="'option_4'">{{ text().item(4) }}</kbq-radio-button>

            <kbq-radio-button [disabled]="true" [value]="'option_5'">{{ text().itemDisabled(5) }}</kbq-radio-button>
        </kbq-radio-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioGroupExample {
    protected readonly text = injectExampleText();
}
