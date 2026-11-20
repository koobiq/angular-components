import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSlider, type KbqSliderValue } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Invalid slider value */
@Component({
    selector: 'slider-invalid-example',
    imports: [KbqFormFieldModule, KbqSlider],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().label }}</kbq-label>
            <kbq-slider #timeout showTooltip [max]="60" [value]="50" [invalid]="exceedsLimit(timeout.value())" />
            <kbq-error>{{ t().error(limit) }}</kbq-error>
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
export class SliderInvalidExample {
    protected readonly limit = 45;
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected exceedsLimit(value: KbqSliderValue): boolean {
        return typeof value === 'number' && value > this.limit;
    }
}
