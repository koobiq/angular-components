import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Custom slider appearance */
@Component({
    selector: 'slider-custom-example',
    imports: [KbqSlider],
    template: `
        <kbq-slider
            showTooltip
            class="example-slider-wide"
            [value]="0.6"
            [min]="0"
            [max]="1"
            [step]="0.01"
            [marks]="marks"
            [aria-label]="t().value"
        />
        <kbq-slider showTooltip class="example-slider-round" [value]="[16, 67]" [thumbLabels]="t().bounds" />
        <kbq-slider showTooltip class="example-slider-dot" [value]="74" [aria-label]="t().value" />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: 24px;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            justify-content: center;
            min-height: 96px;
            font-variant-numeric: tabular-nums;
        }
        .example-slider-wide.kbq-slider {
            --kbq-slider-track-size: 24px;
            --kbq-slider-inset: 16px;
            --kbq-slider-tick-size: 4px;
            --kbq-slider-fill-extension: 16px;
            --kbq-slider-track-hover: var(--kbq-states-background-contrast-fade-hover);
            --kbq-slider-fill-hover: var(--kbq-states-background-theme-hover);
            --kbq-slider-thumb-pressed-scale: 0.85;
            --kbq-slider-track-radius: 8px;
            --kbq-slider-thumb-width: 24px;
            --kbq-slider-thumb-height: 16px;
            --kbq-slider-thumb-radius: 4px;
            --kbq-slider-thumb-border: transparent;
        }
        .example-slider-round.kbq-slider {
            --kbq-slider-thumb-width: 16px;
            --kbq-slider-thumb-height: 16px;
            --kbq-slider-thumb-corner-shape: round;
            --kbq-slider-thumb-radius: 50%;
        }
        .example-slider-dot.kbq-slider {
            --kbq-slider-track-size: 2px;
            --kbq-slider-thumb-pressed-scale: 1.3;
            --kbq-slider-thumb-width: 16px;
            --kbq-slider-thumb-height: 16px;
            --kbq-slider-thumb-corner-shape: round;
            --kbq-slider-thumb-radius: 50%;
            --kbq-slider-thumb-background: var(--kbq-background-theme);
            --kbq-slider-thumb-border: transparent;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderCustomExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly marks = Array.from({ length: 9 }, (_, index) => ({
        value: index / 8,
        label: index % 2 === 0 ? String(index / 8) : undefined
    }));
}
