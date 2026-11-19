import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Slider states */
@Component({
    selector: 'slider-states-example',
    imports: [KbqSlider],
    template: `
        <span>{{ t().normal }}</span>
        <kbq-slider showTooltip [value]="30" [aria-label]="t().normal" />
        <span>{{ t().error }}</span>
        <kbq-slider showTooltip invalid [value]="30" [aria-label]="t().error" />
        <span>{{ t().disabled }}</span>
        <kbq-slider showTooltip disabled [value]="30" [aria-label]="t().disabled" />
        <span>{{ t().readonly }}</span>
        <kbq-slider showTooltip readonly tooltipOnFocus [value]="30" [aria-label]="t().readonly" />
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderStatesExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
