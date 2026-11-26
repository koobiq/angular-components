import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Scan settings */
@Component({
    selector: 'slider-settings-example',
    imports: [FormsModule, KbqButtonModule, KbqButtonToggleModule, KbqFormFieldModule, KbqPopoverModule, KbqSlider],
    template: `
        <button kbq-button kbqPopover type="button" [kbqPopoverContent]="settings">{{ t().settings }}</button>
        <ng-template #settings>
            <div class="example-settings">
                <kbq-button-toggle-group [attr.aria-label]="t().period" [(ngModel)]="period">
                    @for (item of t().periods; track $index) {
                        <kbq-button-toggle [value]="$index">{{ item }}</kbq-button-toggle>
                    }
                </kbq-button-toggle-group>
                <kbq-form-field>
                    <kbq-label>{{ t().workers }}</kbq-label>
                    <kbq-slider
                        #workers
                        [min]="1"
                        [max]="16"
                        [ngModel]="limits[period] ?? 1"
                        (ngModelChange)="setLimit($event)"
                    />
                </kbq-form-field>
                <output>{{ workers.value() }}</output>
            </div>
        </ng-template>
    `,
    styles: `
        :host {
            display: grid;
            min-height: 96px;
            place-items: center;
        }
        .example-settings {
            display: grid;
            position: relative;
            gap: 16px;
        }
        output {
            position: absolute;
            inset-inline-end: 0;
            bottom: 36px;
            font-variant-numeric: tabular-nums;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderSettingsExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly limits = [4, 8, 12];
    protected period = 0;

    protected setLimit(value: number | readonly [number, number]): void {
        if (typeof value === 'number') this.limits[this.period] = value;
    }
}
