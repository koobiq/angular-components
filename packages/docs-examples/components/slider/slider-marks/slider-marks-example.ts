import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Steps and marks */
@Component({
    selector: 'slider-marks-example',
    imports: [KbqFormFieldModule, KbqSlider],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().value }}</kbq-label>
            <kbq-slider showTooltip [value]="50" [step]="25" [marks]="percentMarks" />
        </kbq-form-field>
        <kbq-form-field>
            <kbq-label>{{ t().interval }}</kbq-label>
            <kbq-slider
                showTooltip
                [value]="2"
                [max]="5"
                [step]="null"
                [marks]="timeMarks()"
                [displayWith]="formatTime"
            />
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: 24px;
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
            justify-content: center;
            min-height: 96px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderMarksExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly percentMarks = [0, 25, 50, 75, 100].map((value) => ({ value, label: `${value}%` }));
    protected readonly timeMarks = computed(() => this.t().times.map((label, value) => ({ value, label })));
    protected readonly formatTime = (value: number): string => this.t().times[value] ?? '';
}
