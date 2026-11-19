import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Vertical slider */
@Component({
    selector: 'slider-vertical-example',
    imports: [KbqSlider],
    template: `
        <div class="example-slider-vertical-row">
            @for (level of levels; track $index) {
                <kbq-slider showTooltip vertical [value]="level" [aria-label]="t().channel + ' ' + ($index + 1)" />
            }
            <kbq-slider showTooltip vertical [value]="[25, 75]" [marks]="marks" [thumbLabels]="t().bounds" />
        </div>
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
        .example-slider-vertical-row {
            display: flex;
            justify-content: center;
            gap: 0;
            padding-inline-end: 24px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderVerticalExample {
    protected readonly levels = [40, 90, 60, 30, 85, 60, 15];
    protected readonly marks = [0, 50, 100].map((value) => ({ value, label: String(value) }));
    protected readonly t = injectTranslation(TRANSLATIONS);
}
