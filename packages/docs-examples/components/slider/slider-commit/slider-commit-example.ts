import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqSlider, type KbqSliderValue } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Preview a map zoom and redraw its tiles on commit */
@Component({
    selector: 'slider-commit-example',
    imports: [KbqSlider],
    template: `
        <div class="example-map" aria-hidden="true">
            <div
                class="example-tiles"
                [style.scale]="zoom() / renderedZoom()"
                [style.--tile-size.px]="32 * renderedZoom()"
            >
                @for (tile of tiles; track tile) {
                    <span></span>
                }
            </div>
        </div>
        <div class="example-caption">
            {{ t().zoom }}
            <output>{{ zoom() }}×</output>
        </div>
        <kbq-slider
            [aria-label]="t().zoom"
            [min]="1"
            [max]="4"
            [step]="0.25"
            [value]="zoom()"
            (valueChange)="preview($event)"
            (valueCommit)="renderedZoom.set(zoom())"
        />
        <div class="kbq-text-compact">{{ t().tiles }} {{ renderedZoom() }}×</div>
    `,
    styles: `
        :host {
            display: grid;
            width: min(100%, 320px);
            margin: auto;
            gap: 4px;
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
            position: absolute;
            inset: -200%;
            display: grid;
            grid-template-columns: repeat(auto-fill, var(--tile-size));
            grid-auto-rows: var(--tile-size);
            align-content: center;
            justify-content: center;
        }
        .example-tiles span {
            background: var(--kbq-background-contrast-fade);
            margin: 2px;
            border: 3px solid var(--kbq-background-bg);
            border-radius: 6px;
        }
        .example-tiles span:nth-child(7n) {
            background: var(--kbq-background-success-fade);
        }
        .example-tiles {
            background: repeating-linear-gradient(
                28deg,
                transparent 0 65px,
                var(--kbq-background-theme-fade) 65px 80px
            );
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderCommitExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly zoom = signal(2);
    protected readonly renderedZoom = signal(2);
    protected readonly tiles = Array.from({ length: 256 }, (_, index) => index);

    protected preview(value: KbqSliderValue): void {
        if (typeof value === 'number') this.zoom.set(value);
    }
}
