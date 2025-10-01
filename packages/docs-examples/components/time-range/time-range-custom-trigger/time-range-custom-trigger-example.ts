import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqButtonModule } from '@koobiq/components/button';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqFormField, KbqSuffix } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTimeRange, KbqTimeRangeRange, KbqTimeRangeTitleAsControl } from '@koobiq/components/time-range';

/**
 * @title Time range custom trigger
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'time-range-custom-trigger-example',
    imports: [
        ReactiveFormsModule,
        KbqTimeRange,
        KbqIconModule,
        KbqButtonModule,
        LuxonDateModule,
        KbqFormField,
        KbqSuffix,
        KbqTimeRangeTitleAsControl,
        TitleCasePipe
    ],
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }],
    template: `
        <ng-template #titleTemplate let-context>
            <button kbq-button aria-label="time range trigger" [class.kbq-active]="context.popover.isOpen">
                <i kbq-icon="kbq-calendar-o_16"></i>
            </button>
        </ng-template>

        <kbq-time-range [titleTemplate]="titleTemplate" [formControl]="control" [arrow]="false" />

        <ng-template #titleAsFormField let-context>
            <kbq-form-field>
                <kbq-time-range-title-as-control>
                    {{ context.formattedDate[0] | titlecase }}{{ context.formattedDate.slice(1) }}
                </kbq-time-range-title-as-control>
                <i kbq-icon="kbq-chevron-down-s_16" kbqSuffix [color]="'contrast-fade'"></i>
            </kbq-form-field>
        </ng-template>

        <kbq-time-range [titleTemplate]="titleAsFormField" [arrow]="false" [formControl]="control" />
    `,
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-xl'
    }
})
export class TimeRangeCustomTriggerExample {
    protected readonly control = new FormControl<KbqTimeRangeRange | null>(
        {
            type: 'last5Minutes'
        },
        { nonNullable: true }
    );
}
