import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqInputSlider, KbqSlider } from '@koobiq/components/slider';
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
                    #editor="ngModel"
                    kbqNumberInput
                    integer
                    [min]="0"
                    [max]="100"
                    [attr.aria-label]="t().volume"
                    [(ngModel)]="draft"
                    (ngModelChange)="setVolume($event)"
                    (blur)="editor.control.setValue(volume())"
                />
            </kbq-form-field>
        </div>
        <kbq-form-field>
            <kbq-label>{{ t().price }}</kbq-label>
            <kbq-input-slider [max]="100_000_000" [step]="1_000_000" [value]="50_000_000" [showStepper]="false" />
        </kbq-form-field>
        <kbq-form-field>
            <kbq-label>{{ t().range }}</kbq-label>
            <kbq-input-slider
                [max]="100_000_000"
                [step]="1_000_000"
                [value]="[20_000_000, 75_000_000]"
                [thumbAriaLabels]="t().bounds"
            />
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
        .example-volume {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 88px;
            gap: var(--kbq-size-l);
            align-items: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderInputExample {
    protected readonly volume = signal(70);
    protected draft: number | null = 70;
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected setVolume(value: number | null): void {
        if (value !== null) {
            this.volume.set(Math.max(0, Math.min(100, Math.round(value))));
            this.draft = value;
        }
    }
}
