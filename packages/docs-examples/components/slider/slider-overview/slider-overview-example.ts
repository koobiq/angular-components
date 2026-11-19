import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Slider */
@Component({
    selector: 'slider-overview-example',
    imports: [KbqSlider],
    template: `
        <kbq-slider showTooltip [value]="0" [aria-label]="t().value" />
        <kbq-slider showTooltip [value]="30" [aria-label]="t().value" />
        <kbq-slider showTooltip [value]="100" [aria-label]="t().value" />
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
export class SliderOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
