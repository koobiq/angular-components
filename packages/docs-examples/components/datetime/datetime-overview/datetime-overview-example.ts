import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { DateTime } from 'luxon';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqDatetime } from '@koobiq/components/datetime';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Datetime
 */
@Component({
    selector: 'datetime-overview-example',
    imports: [FormsModule, LuxonDateModule, KbqFormFieldModule, KbqDatepickerModule, KbqDatetime],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().label }}</kbq-label>
            <kbq-datetime #datetime [(ngModel)]="value" />
            <kbq-datepicker-toggle-icon kbqSuffix [for]="datetime.datepicker()" />
            <kbq-hint>{{ t().hint }}</kbq-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class DatetimeOverviewExample {
    protected readonly value = model<DateTime | null>(null);

    protected readonly t = injectTranslation(TRANSLATIONS);
}
