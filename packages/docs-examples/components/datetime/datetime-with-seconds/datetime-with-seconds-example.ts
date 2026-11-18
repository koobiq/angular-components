import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqDatetime } from '@koobiq/components/datetime';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { TimeFormats } from '@koobiq/components/timepicker';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { DateTime } from 'luxon';
import { TRANSLATIONS } from './l10n';

/**
 * @title Datetime with seconds
 */
@Component({
    selector: 'datetime-with-seconds-example',
    imports: [FormsModule, LuxonDateModule, KbqFormFieldModule, KbqDatepickerModule, KbqDatetime],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().label }}</kbq-label>
            <kbq-datetime #datetime [format]="format" [(ngModel)]="value" />
            <kbq-datepicker-toggle-icon kbqSuffix [for]="datetime.datepicker()" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class DatetimeWithSecondsExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    private readonly adapter = inject<DateAdapter<DateTime>>(DateAdapter);
    protected readonly format = TimeFormats.HHmmss;
    protected readonly value = model<DateTime | null>(this.adapter.createDateTime(2026, 10, 11, 20, 20, 35, 0));
}
