import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, KbqFormsModule } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { DateTime } from 'luxon';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Datepicker minimax
 */
@Component({
    selector: 'datepicker-minimax-example',
    imports: [
        FormsModule,
        LuxonDateModule,
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqFormsModule
    ],
    template: `
        <div class="docs-example__datepicker-minimax">
            <div class="kbq-form-vertical">
                <div class="kbq-form__row">
                    <label class="kbq-form__label">{{ t().minimaxHint }}</label>
                    <kbq-form-field
                        #tooltip="kbqTooltip"
                        kbqTooltipModifier="warning"
                        [kbqTooltip]="t().onlyNumbers"
                        (click)="datepicker.toggle()"
                    >
                        <input
                            [kbqDatepicker]="datepicker"
                            [kbqValidationTooltip]="tooltip"
                            [max]="maxDate"
                            [min]="minDate"
                            [(ngModel)]="date"
                        />
                        <kbq-datepicker-toggle-icon kbqSuffix [for]="datepicker" />
                        <kbq-datepicker #datepicker [maxDate]="maxDate" [minDate]="minDate" />
                    </kbq-form-field>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatepickerMinimaxExample extends BaseLocalizedExample<ExampleTranslation> {
    private adapter = inject<DateAdapter<DateTime>>(DateAdapter);

    readonly minDate = this.adapter.createDate(2023, 11, 14);
    // The bounds are compared as instants and the input keeps the time part of what it parses, so
    // the upper bound has to be the end of the last allowed day for that day to stay valid.
    readonly maxDate = this.adapter.createDate(2024, 7, 25).endOf('day');

    date: DateTime | null = null;

    constructor() {
        super(TRANSLATIONS);
    }
}
