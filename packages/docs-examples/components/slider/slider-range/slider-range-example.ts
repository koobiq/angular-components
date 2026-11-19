import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqSlider, type KbqSliderCollision, type KbqSliderValue } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Range collision strategies */
@Component({
    selector: 'slider-range-example',
    imports: [FormsModule, KbqButtonToggleModule, KbqSlider],
    template: `
        <kbq-button-toggle-group stretched [attr.aria-label]="t().behavior" [(ngModel)]="collision">
            @for (mode of modes; track mode) {
                <kbq-button-toggle [value]="mode">{{ mode }}</kbq-button-toggle>
            }
        </kbq-button-toggle-group>
        <div class="example-price">
            <span>{{ t().price }}</span>
            <output>{{ formatRange(price.value()) }}</output>
        </div>
        <kbq-slider
            #price
            [value]="[250, 750]"
            [max]="1000"
            [step]="10"
            [minDistance]="100"
            [collision]="collision"
            [thumbLabels]="t().bounds"
            [displayWith]="formatPrice"
        />
        <span class="kbq-text-compact">{{ t().gap }}</span>
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
        .example-price {
            display: flex;
            justify-content: space-between;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderRangeExample {
    protected readonly modes = ['none', 'swap', 'push'] as const;
    protected collision: KbqSliderCollision = 'none';
    protected readonly formatPrice = (value: number) => (this.t().currency === '$' ? `$${value}` : `${value} ₽`);
    protected formatRange(value: KbqSliderValue): string {
        return typeof value === 'number' ? this.formatPrice(value) : value.map(this.formatPrice).join(' – ');
    }
    protected readonly t = injectTranslation(TRANSLATIONS);
}
