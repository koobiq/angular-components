import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqButtonModule } from '@koobiq/components/button';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTimeRange, KbqTimeRangeRange } from '@koobiq/components/time-range';

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
        LuxonDateModule
    ],
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }],
    template: `
        <ng-template #titleTemplate>
            <button kbq-button aria-label="time range trigger">
                <i kbq-icon="kbq-calendar-o_16"></i>
            </button>
        </ng-template>

        <kbq-time-range [titleTemplate]="titleTemplate" [formControl]="control" [arrow]="false" />

        <kbq-time-range [formControl]="control" />
    `,
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-3xl'
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
