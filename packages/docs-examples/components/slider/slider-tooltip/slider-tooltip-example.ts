import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Slider value tooltip */
@Component({
    selector: 'slider-tooltip-example',
    imports: [KbqSlider],
    template: `
        <kbq-slider showTooltip [value]="35" [displayWith]="formatPercent" [aria-label]="t().value" />
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
export class SliderTooltipExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly formatPercent = (value: number): string => `${value}%`;
}
