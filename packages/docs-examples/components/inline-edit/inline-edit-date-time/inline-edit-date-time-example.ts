import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqBadgeModule } from '@koobiq/components/badge';
import {
    DateAdapter,
    DateFormatter,
    KBQ_DATE_LOCALE,
    kbqDisableLegacyValidationDirectiveProvider
} from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFieldset, KbqFieldsetItem, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

/**
 * @title Inline edit date time
 */
@Component({
    selector: 'inline-edit-date-time-example',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        LuxonDateModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqBadgeModule,
        KbqIconModule,
        KbqDatepickerModule,
        KbqTimepickerModule,
        KbqFieldset,
        KbqFieldsetItem,
        JsonPipe
    ],
    template: `
        <kbq-inline-edit showActions (saved)="update()">
            <kbq-label>Label</kbq-label>

            <div class="layout-row layout-gap-xxs" style="flex-wrap: wrap;" kbqInlineEditViewMode>
                @if (displayValue()) {
                    {{ displayValue() }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <form novalidate kbqInlineEditEditMode [formGroup]="form">
                <kbq-fieldset>
                    <kbq-form-field kbqFieldsetItem (click)="datepicker.toggle()">
                        <input formControlName="date" [kbqDatepicker]="datepicker" />
                        <kbq-datepicker-toggle-icon kbqSuffix [for]="datepicker" />
                        <kbq-datepicker #datepicker />
                    </kbq-form-field>

                    <kbq-form-field kbqFieldsetItem>
                        <i kbq-icon="kbq-clock_16" kbqPrefix></i>
                        <input kbqTimepicker formControlName="time" />
                    </kbq-form-field>
                </kbq-fieldset>
            </form>
        </kbq-inline-edit>
    `,
    styles: `
        :host {
            display: block;
            width: 300px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }]
})
export class InlineEditDateTimeExample {
    private readonly adapter = inject<DateAdapter<DateTime>>(DateAdapter);
    private readonly formatter = inject<DateFormatter<DateTime>>(DateFormatter);

    protected readonly placeholder = 'Placeholder';
    protected readonly displayValue: WritableSignal<string>;

    protected readonly form: FormGroup<{
        date: FormControl<DateTime<boolean> | null>;
        time: FormControl<DateTime<boolean> | null>;
    }>;

    constructor() {
        const today = this.adapter.today();

        this.form = new FormGroup({
            date: new FormControl(today, Validators.required),
            time: new FormControl(today, Validators.required)
        });

        this.displayValue = signal<string>(this.format(this.form.value.date));
    }

    protected update(): void {
        const { date, time } = this.form.value;

        if (date && time) {
            const createdTime = this.adapter.createDateTime(
                this.adapter.getYear(date),
                this.adapter.getMonth(date),
                this.adapter.getDate(date),

                this.adapter.getHours(time),
                this.adapter.getMinutes(time),
                this.adapter.getSeconds(time),
                this.adapter.getMilliseconds(time)
            );

            this.displayValue.set(this.format(createdTime));
        } else {
            this.displayValue.set('');
        }
    }

    private format(date?: DateTime | null) {
        return date ? this.formatter.absoluteLongDateTime(date) : '';
    }
}
