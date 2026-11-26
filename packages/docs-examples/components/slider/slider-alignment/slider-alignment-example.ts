import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Thumb alignment */
@Component({
    selector: 'slider-alignment-example',
    imports: [KbqFormFieldModule, KbqSlider],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().contain }}</kbq-label>
            <kbq-slider showTooltip [value]="[0, 100]" [marks]="marks" />
        </kbq-form-field>
        <kbq-form-field>
            <kbq-label>{{ t().center }}</kbq-label>
            <kbq-slider showTooltip thumbAlignment="center" [value]="[0, 100]" [marks]="marks" />
        </kbq-form-field>
    `,
    styles: `
        :host {
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
            padding-inline: 14px;
            min-height: 96px;
            font-variant-numeric: tabular-nums;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'layout-column layout-align-center-stretch layout-gap-s' }
})
export class SliderAlignmentExample {
    protected readonly marks = [
        { value: 0, label: '0' },
        { value: 100, label: '100' }
    ];
    protected readonly t = injectTranslation(TRANSLATIONS);
}
