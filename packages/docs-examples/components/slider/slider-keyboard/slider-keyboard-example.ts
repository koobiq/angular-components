import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Slider keyboard interaction */
@Component({
    selector: 'slider-keyboard-example',
    imports: [KbqFormFieldModule, KbqSlider],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().regular }}</kbq-label>
            <kbq-slider showTooltip [value]="[25, 65]" [marks]="marks" [thumbAriaLabels]="t().bounds" />
        </kbq-form-field>
        <kbq-form-field>
            <kbq-label>{{ t().reversed }}</kbq-label>
            <kbq-slider reversed showTooltip [value]="[25, 65]" [marks]="marks" [thumbAriaLabels]="t().bounds" />
        </kbq-form-field>
        <kbq-form-field>
            <kbq-label>{{ t().discrete }}</kbq-label>
            <kbq-slider showTooltip [value]="50" [step]="null" [marks]="marks" />
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: grid;
            gap: 16px;
            width: min(100%, 320px);
            margin: auto;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderKeyboardExample {
    protected readonly marks = [15, 50, 80].map((value) => ({ value, label: String(value) }));
    protected readonly t = injectTranslation(TRANSLATIONS);
}
