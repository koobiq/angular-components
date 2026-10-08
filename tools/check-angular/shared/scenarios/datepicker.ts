import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateAdapter } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqDatepickerInputEvent, KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { DateTime } from 'luxon';

/** A delivery date limited to 2026: a reactive form control behind a datepicker with its toggle. */
@Component({
    selector: 'check-datepicker',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqDatepickerModule],
    // What `LuxonDateModule` provides, scoped to this component instead of the application.
    providers: [{ provide: DateAdapter, useClass: LuxonDateAdapter }],
    template: `
        <kbq-form-field>
            <kbq-label>Delivery date</kbq-label>
            <input
                [formControl]="date"
                [kbqDatepicker]="picker"
                [max]="max()"
                [min]="min()"
                (dateChange)="onDateChange($event)"
            />
            <kbq-datepicker-toggle-icon kbqSuffix [for]="picker" />
            <kbq-datepicker
                #picker
                [maxDate]="max()"
                [minDate]="min()"
                (closed)="log('closed')"
                (opened)="log('opened')"
            />
            <kbq-error>Pick a date in 2026</kbq-error>
        </kbq-form-field>

        <p class="check-datepicker__value">{{ value()?.toISODate() ?? 'none' }}</p>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatepickerScenario {
    readonly min = signal(DateTime.fromObject({ year: 2026, month: 1, day: 1 }));
    readonly max = signal(DateTime.fromObject({ year: 2026, month: 12, day: 31 }).endOf('day'));

    readonly date = new FormControl<DateTime | null>(DateTime.fromObject({ year: 2026, month: 3, day: 5 }));
    readonly value = toSignal(this.date.valueChanges, { initialValue: this.date.value });

    /** The outputs in the order they fired. */
    readonly events = signal<string[]>([]);

    protected onDateChange(event: KbqDatepickerInputEvent<DateTime>): void {
        this.log(`dateChange ${event.value?.toISODate()}`);
    }

    protected log(event: string): void {
        this.events.update((events) => [...events, event]);
    }
}
