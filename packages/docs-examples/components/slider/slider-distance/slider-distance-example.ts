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
        <kbq-form-field>
            <kbq-label>{{ t().label }}</kbq-label>
            <kbq-slider showTooltip [max]="60" [value]="[25, 35]" [minDistance]="10" [thumbLabels]="t().bounds" />
            <kbq-hint>{{ t().hint }}</kbq-hint>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: block;
            width: min(100%, 320px);
            margin: auto;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderDistanceExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
