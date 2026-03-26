import { ChangeDetectionStrategy, Component, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    DateAdapter,
    DateFormatter,
    KBQ_DATE_LOCALE,
    kbqDisableLegacyValidationDirectiveProvider
} from '@koobiq/components/core';
import { KbqDatepicker, KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormField, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInlineEdit, KbqInlineEditMode, KbqInlineEditPlaceholder } from '@koobiq/components/inline-edit';
import { KbqTimepicker } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

/**
 * @title Inline edit date time
 */
@Component({
    selector: 'inline-edit-date-time-example',
    imports: [
        ReactiveFormsModule,
        LuxonDateModule,
        KbqInlineEdit,
        KbqInlineEditPlaceholder,
        KbqIcon,
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqTimepicker
    ],
    template: `
        <kbq-inline-edit showActions (saved)="update()" (modeChange)="onModeChange($event)">
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
                    <kbq-form-field #datepickerFormField kbqFieldsetItem (click)="datepicker.toggle()">
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
            width: 284px;
        }

        ::ng-deep .kbq-inline-edit__panel .kbq-form-field-type-datepicker {
            width: 50%;
        }

        ::ng-deep .kbq-inline-edit__panel .kbq-form-field-type-timepicker {
            width: unset;
            flex-grow: 1;
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
    protected readonly datepickerFormField = viewChild<KbqFormField>('datepickerFormField');
    protected readonly datepicker = viewChild<KbqDatepicker<DateTime>>('datepicker');

    protected readonly form: FormGroup<{
        date: FormControl<DateTime | null>;
        time: FormControl<DateTime | null>;
    }>;

    constructor() {
        const today = this.adapter.today();

        this.form = new FormGroup({
            date: new FormControl(today, Validators.required),
            time: new FormControl(today, Validators.required)
        });

        this.displayValue = signal<string>(this.format(this.form.value.date));

        this.form.valueChanges.subscribe((value) => console.log(value));
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

    protected onModeChange(currentMode: KbqInlineEditMode): void {
        setTimeout(() => {
            if (currentMode === 'edit' && this.datepickerFormField()?.focusOrigin === 'keyboard') {
                this.datepicker()?.open();
            }
        });
    }

    private format(date?: DateTime | null) {
        return date ? this.formatter.absoluteLongDateTime(date) : '';
    }
}
