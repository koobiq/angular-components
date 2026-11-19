import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Range collision strategies */
@Component({
    selector: 'slider-range-example',
    imports: [KbqFormFieldModule, KbqSlider],
    template: `
        @for (mode of modes; track mode) {
            <kbq-form-field>
                <kbq-label class="example-scenario">{{ t().scenarios[mode] }}</kbq-label>
                <kbq-slider showTooltip [value]="[25, 75]" [collision]="mode" [thumbLabels]="t().bounds" />
            </kbq-form-field>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
            justify-content: center;
            min-height: 96px;
            font-variant-numeric: tabular-nums;
        }
        .example-scenario {
            text-transform: uppercase;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderRangeExample {
    protected readonly modes = ['none', 'swap', 'push'] as const;
    protected readonly t = injectTranslation(TRANSLATIONS);
}
