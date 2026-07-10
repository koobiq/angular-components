import { ChangeDetectionStrategy, Component, computed, inject, InjectionToken } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KBQ_DATE_LOCALE, KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTimeRange } from '@koobiq/components/time-range';
import { DateTime } from 'luxon';
import { of } from 'rxjs';

const ExampleLocalizedData = new InjectionToken<Record<string | 'default', string>>('ExampleLocalizedData', {
    factory: () => ({
        'ru-RU': 'Выбрать период',
        default: 'Select period'
    })
});

/**
 * @title Time range min max
 */
@Component({
    selector: 'time-range-min-max-example',
    imports: [
        ReactiveFormsModule,
        KbqTimeRange,
        LuxonDateModule,
        KbqLinkModule,
        KbqIconModule
    ],
    template: `
        <ng-template #titleTemplate let-context>
            <a kbq-link pseudo>
                <span class="kbq-link__text">
                    @if (!context.type) {
                        {{ placeholder() }}
                    } @else if (context.type === 'range') {
                        {{
                            dateFormatter.rangeLongDate(
                                dateAdapter.deserialize(context.startDateTime),
                                dateAdapter.deserialize(context.endDateTime)
                            )
                        }}
                    } @else {
                        {{ capitalize(context.formattedDate) }}
                    }
                </span>

                <i kbq-icon="kbq-calendar-o_16"></i>
            </a>
        </ng-template>

        <kbq-time-range [titleTemplate]="titleTemplate" [minDate]="minDate" [maxDate]="maxDate" [nonNullable]="false" />
    `,
    providers: [
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-flex layout-column layout-align-center-center layout-gap-xs'
    }
})
export class TimeRangeMinMaxExample {
    protected readonly dateAdapter = inject<DateAdapter<DateTime>>(DateAdapter);
    protected readonly dateFormatter = inject(DateFormatter);

    protected readonly minDate = this.dateAdapter.createDate(2015, 0, 1);
    protected readonly maxDate = this.dateAdapter.createDate(2017, 11, 31);

    private readonly data = inject(ExampleLocalizedData);
    private readonly localeId = toSignal(inject(KBQ_LOCALE_SERVICE, { optional: true })?.changes || of(''));

    protected readonly placeholder = computed(() => this.data[this.localeId() || 'default'] ?? this.data.default);

    protected capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
}
