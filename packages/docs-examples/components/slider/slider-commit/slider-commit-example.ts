import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KbqSlider, type KbqSliderValue } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Preview a map zoom and redraw its tiles on commit */
@Component({
    selector: 'slider-commit-example',
    imports: [KbqSlider],
    template: `
        <div class="example-map" aria-hidden="true" [style.--example-map-hue]="140 + zoom() * 25">
            <div
                class="example-tiles"
                [style.scale]="zoom() / renderedZoom()"
                [style.--example-rendered-zoom]="renderedZoom()"
            >
                @for (tile of tiles; track tile) {
                    <span></span>
                }
            </div>
        </div>
        <div class="example-caption">
            {{ zoomCaption() }}
            <output>{{ formatZoom(zoom()) }}</output>
        </div>
        <kbq-slider
            showTooltip
            [displayWith]="formatZoom"
            [aria-label]="t().zoom"
            [min]="1"
            [max]="4"
            [step]="0.25"
            [value]="zoom()"
            (valueChange)="preview($event)"
            (valueCommit)="renderedZoom.set(zoom())"
        />
        <div class="kbq-text-compact">{{ t().tiles }} {{ formatZoom(renderedZoom()) }}</div>
    `,
    styles: `
        :host {
            display: grid;
            width: min(100%, 320px);
            margin: auto;
            gap: var(--kbq-size-xxs);
            font-variant-numeric: tabular-nums;
        }
        .example-caption {
            display: flex;
            justify-content: space-between;
        }
        .example-map {
            height: 128px;
            overflow: hidden;
            position: relative;
            border-radius: var(--kbq-size-border-radius);
            background: var(--kbq-background-bg);
        }
        .example-tiles {
            --example-tile-size: calc(var(--kbq-size-3xl) * var(--example-rendered-zoom));

            position: absolute;
            inset: -200%;
            display: grid;
            grid-template-columns: repeat(auto-fill, var(--example-tile-size));
            grid-auto-rows: var(--example-tile-size);
            align-content: center;
            justify-content: center;
        }
        .example-tiles span {
            background: var(--kbq-background-contrast-fade);
            margin: var(--kbq-size-3xs);
            border: 3px solid var(--kbq-background-bg);
            border-radius: var(--kbq-size-xs);
        }
        .example-tiles span:nth-child(7n) {
            background: hsl(var(--example-map-hue) 58% 55% / 0.4);
        }
        .example-tiles {
            background: repeating-linear-gradient(
                28deg,
                transparent 0 65px,
                hsl(var(--example-map-hue) 65% 45% / 0.25) 65px 80px
            );
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderCommitExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    private readonly numberFormat = computed(() => new Intl.NumberFormat(this.t().locale));

    protected readonly zoom = signal(2.5);
    protected readonly renderedZoom = signal(2.5);
    protected readonly zoomCaption = computed(() => {
        const { overview, streets, blocks } = this.t();
        const zoom = this.zoom();

        return zoom < 2 ? overview : zoom < 3 ? streets : blocks;
    });
    protected readonly tiles = Array.from({ length: 256 }, (_, index) => index);

    protected readonly formatZoom = (value: number): string => `×\u00a0${this.numberFormat().format(value)}`;

    protected preview(value: KbqSliderValue): void {
        if (typeof value === 'number') this.zoom.set(value);
    }
}
