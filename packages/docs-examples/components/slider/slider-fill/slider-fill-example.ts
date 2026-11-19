import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { DateTime } from 'luxon';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqSlider, type KbqSliderValue } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Slider fill */
@Component({
    selector: 'slider-fill-example',
    imports: [KbqSlider, LuxonDateModule],
    template: `
        <div>
            <span>{{ t().threshold }}</span>
            <output>{{ salary.value() }}</output>
        </div>
        <kbq-slider #salary fill="end" [max]="200000" [step]="5000" [value]="75000" [aria-label]="t().threshold" />
        <div>
            <span>{{ t().quietHours }}</span>
            <output>{{ time(quietEnd(quiet.value())) }}–{{ time(quietStart(quiet.value())) }}</output>
        </div>
        <kbq-slider
            #quiet
            fill="outside"
            [max]="24"
            [value]="[7, 18]"
            [marks]="hours"
            [displayWith]="time"
            [thumbLabels]="t().bounds"
        />
        <span>{{ t().balance }}</span>
        <kbq-slider
            #balance
            fill="origin"
            [min]="-1"
            [max]="1"
            [step]="0.01"
            [value]="0.33"
            [aria-label]="t().balance"
        />
        <div>
            <span>{{ t().left }}</span>
            <output>{{ signed(balance.value()) }}</output>
            <span>{{ t().right }}</span>
        </div>
        <div>
            <span>{{ t().thermal }}</span>
            <output>{{ temperature.value() }} °C</output>
        </div>
        <kbq-slider
            #temperature
            fill="origin"
            [min]="-20"
            [max]="80"
            [fillOrigin]="20"
            [value]="35"
            [aria-label]="t().thermal"
        />
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
        output {
            white-space: nowrap;
        }
        div {
            display: flex;
            justify-content: space-between;
            gap: 8px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderFillExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    private readonly adapter = inject<DateAdapter<DateTime>>(DateAdapter);
    protected readonly time = (hour: number): string =>
        this.adapter.format(this.adapter.createDateTime(2020, 0, 1, hour % 24, 0, 0, 0), 'HH:mm');
    protected readonly quietStart = (value: KbqSliderValue) => (typeof value === 'number' ? value : value[0]);
    protected readonly quietEnd = (value: KbqSliderValue) => (typeof value === 'number' ? value : value[1]);
    protected readonly signed = (value: KbqSliderValue) =>
        typeof value === 'number' && value > 0 ? `+${value}` : String(value);
    protected readonly hours = [0, 6, 12, 18, 24].map((value) => ({ value, label: String(value) }));
}
