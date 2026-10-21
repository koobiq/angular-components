import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkSuffix } from '@koobiq/components/link';
import { KbqTimeRange, KbqTimeRangeType } from '@koobiq/components/time-range';

/**
 * @title Time range empty type list
 */
@Component({
    selector: 'time-range-empty-type-list-example',
    imports: [
        ReactiveFormsModule,
        KbqTimeRange,
        LuxonDateModule,
        KbqLink,
        KbqLinkSuffix,
        KbqIconModule
    ],
    template: `
        <ng-template #titleTemplate let-context>
            <a kbqLink pseudo>
                @if (context.startDateTime && context.endDateTime) {
                    {{
                        dateFormatter.rangeLongDate(
                            dateAdapter.deserialize(context.startDateTime),
                            dateAdapter.deserialize(context.endDateTime)
                        )
                    }}
                } @else {
                    {{ context.formattedDate }}
                }

                <i kbqLinkSuffix kbq-icon="kbq-calendar-o_16"></i>
            </a>
        </ng-template>

        <kbq-time-range [titleTemplate]="titleTemplate" [availableTimeRangeTypes]="availableTimeRangeTypes" />
    `,
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-3xl'
    }
})
export class TimeRangeEmptyTypeListExample {
    protected readonly dateAdapter = inject(DateAdapter);
    protected readonly dateFormatter = inject(DateFormatter);

    protected readonly availableTimeRangeTypes: KbqTimeRangeType[] = [];
}
