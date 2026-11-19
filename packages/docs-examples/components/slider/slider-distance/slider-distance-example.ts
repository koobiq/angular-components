import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Minimum distance between thumbs */
@Component({
    selector: 'slider-distance-example',
    imports: [KbqFormFieldModule, KbqSlider],
    template: `
        @for (mode of modes; track mode.value) {
            <kbq-form-field>
                <kbq-label>{{ mode.label }}</kbq-label>
                <kbq-slider
                    showTooltip
                    [max]="60"
                    [value]="[25, 35]"
                    [minDistance]="10"
                    [collision]="mode.value"
                    [thumbLabels]="t().bounds"
                />
            </kbq-form-field>
        }
    `,
    styles: `
        :host {
            display: grid;
            gap: 10px;
            width: min(100%, 320px);
            margin: auto;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderDistanceExample {
    protected readonly modes = [
        { value: 'none', label: 'None' },
        { value: 'swap', label: 'Swap' },
        { value: 'push', label: 'Push' }
    ] as const;
    protected readonly t = injectTranslation(TRANSLATIONS);
}
