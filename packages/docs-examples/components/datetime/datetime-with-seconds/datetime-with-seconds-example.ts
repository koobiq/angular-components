import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
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
    protected readonly format = TimeFormats.HHmmss;
    protected readonly value = model<DateTime | null>(DateTime.fromISO('2026-11-11T20:20:35'));
}
