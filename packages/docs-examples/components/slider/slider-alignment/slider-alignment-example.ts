import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Thumb alignment */
@Component({
    selector: 'slider-alignment-example',
    imports: [KbqSlider],
    template: `
        <span>{{ t().contain }}</span>
        <kbq-slider showTooltip [value]="0" [aria-label]="t().value" />
        <kbq-slider showTooltip [value]="100" [aria-label]="t().value" />
        <span>{{ t().center }}</span>
        <kbq-slider showTooltip thumbAlignment="center" [value]="0" [aria-label]="t().value" />
        <kbq-slider showTooltip thumbAlignment="center" [value]="100" [aria-label]="t().value" />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: 6px;
            text-align: center;
            border-inline: 1px solid var(--kbq-line-error);
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
export class SliderAlignmentExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
