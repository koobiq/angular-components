import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSlider, type KbqSliderValue } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Slider label and selected value */
@Component({
    selector: 'slider-labels-example',
    imports: [KbqSlider, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().limit }}</kbq-label>
            <kbq-slider [max]="1000" [step]="10" [(value)]="limit" />
            <kbq-hint>{{ t().hint }}</kbq-hint>
        </kbq-form-field>
        <output aria-hidden="true">{{ limit() }}</output>
    `,
    styles: `
        :host {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
            font-variant-numeric: tabular-nums;
        }
        output {
            position: absolute;
            top: 0;
            inset-inline-end: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderLabelsExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly limit = signal<KbqSliderValue>(700);
}
