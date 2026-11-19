import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqInputSlider, KbqSlider, type KbqSliderValue } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Input and slider */
@Component({
    selector: 'slider-input-example',
    imports: [KbqInputSlider, KbqFormFieldModule, KbqInputModule, FormsModule, KbqSlider],
    template: `
        <div class="example-volume">
            <kbq-slider [aria-label]="t().volume" [value]="volume()" (valueChange)="setVolume($event)" />
            <kbq-form-field>
                <input
                    kbqNumberInput
                    integer
                    [min]="0"
                    [max]="100"
                    [attr.aria-label]="t().volume"
                    [(ngModel)]="draft"
                    (ngModelChange)="setVolume($event)"
                    (blur)="normalizeVolume()"
                />
            </kbq-form-field>
        </div>
        <kbq-form-field>
            <kbq-label>{{ t().price }}</kbq-label>
            <kbq-input-slider [max]="100_000_000" [step]="1_000_000" [value]="50_000_000" [showStepper]="false" />
        </kbq-form-field>
        <kbq-form-field class="example-price-range">
            <kbq-label class="example-heading">
                <span>{{ t().range }}</span>
                <output aria-hidden="true">{{ rangeCaption() }}</output>
            </kbq-label>
            <kbq-input-slider [max]="100_000_000" [step]="1_000_000" [thumbLabels]="t().bounds" [(value)]="range" />
        </kbq-form-field>
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
        .example-heading {
            display: flex;
            flex-wrap: wrap;
            align-items: baseline;
            column-gap: 8px;
            width: 100%;
        }
        .example-heading output {
            margin-inline-start: auto;
        }
        .example-volume {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 88px;
            gap: 16px;
            align-items: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderInputExample {
    protected readonly range = signal<KbqSliderValue>([20_000_000, 75_000_000]);
    protected readonly rangeCaption = computed(() => {
        const range = this.range();

        if (typeof range === 'number') return '';
        const { locale, currency } = this.t();
        const format = new Intl.NumberFormat(locale);
        const [min, max] = range.map((value) => format.format(value));

        if (currency === '₽') return `${min}—${max}\u00a0${currency}`;

        return `${currency}${min}–${currency}${max}`;
    });
    protected readonly volume = signal(70);
    protected draft: number | null = 70;
    protected normalizeVolume(): void {
        this.draft = this.volume();
    }
    protected setVolume(value: KbqSliderValue | null): void {
        if (typeof value === 'number') {
            this.volume.set(Math.max(0, Math.min(100, Math.round(value))));
            this.draft = value;
        }
    }
    protected readonly t = injectTranslation(TRANSLATIONS);
}
