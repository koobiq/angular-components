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
        @for (mode of modes; track mode.value) {
            <kbq-form-field>
                <kbq-label>{{ mode.label }}</kbq-label>
                <kbq-slider
                    showTooltip
                    [value]="[25, 75]"
                    [thumbCollisionBehavior]="mode.value"
                    [thumbAriaLabels]="t().bounds"
                />
            </kbq-form-field>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: 24px;
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
export class SliderRangeExample {
    protected readonly modes = [
        { value: 'none', label: 'None' },
        { value: 'swap', label: 'Swap' },
        { value: 'push', label: 'Push' }
    ] as const;
    protected readonly t = injectTranslation(TRANSLATIONS);
}
