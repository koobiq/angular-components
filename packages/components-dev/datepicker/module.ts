import { AfterViewInit, ChangeDetectionStrategy, Component, ViewEncapsulation, inject, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqDatepicker, KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DateTime } from 'luxon';
import { DatepickerExamplesModule } from '../../docs-examples/components/datepicker';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [DatepickerExamplesModule],
    template: `
        <datepicker-and-timepicker-example />
        <hr />
        <datepicker-inactive-example />
        <hr />
        <datepicker-minimax-example />
        <hr />
        <datepicker-overview-example />
        <hr />
        <datepicker-range-example />
        <hr />
        <datepicker-required-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column'
    }
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        KbqToolTipModule,
        KbqDatepickerModule,
        KbqTimepickerModule,
        KbqLuxonDateModule,
        KbqInputModule,
        KbqIconModule,
        KbqRadioModule,
        DevLocaleSelector,
        DevThemeToggle,
        DevDocsExamples
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp implements AfterViewInit {
    private adapter = inject<DateAdapter<DateTime>>(DateAdapter);

    date = this.adapter.today();
    formControlValue: UntypedFormControl;
    minDate;
    maxDate;
    startAt;

    readonly datepicker = viewChild.required(KbqDatepicker);

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {
        this.formControlValue = new UntypedFormControl(this.adapter.createDateTime(2021, 8, 11, 12, 0, 0, 0));
        this.formControlValue.valueChanges.subscribe((value) => {
            console.log('this.formControlValue.valueChanges: ', value?.toString());
        });

        this.startAt = this.adapter.today();
        this.minDate = this.adapter.createDate(2024, 5, 5);
        this.maxDate = this.adapter.createDate(2024, 7, 20);
    }

    myFilter(date: DateTime): boolean {
        return date.day !== 0 && date.day !== 6;
    }

    ngAfterViewInit(): void {
        this.datepicker().selectedChanged.subscribe(() => {
            console.log('this.datepicker.selectedChanged');
        });
    }

    onDateChange() {
        console.log('onDateChange: ');
    }

    onDateInput() {
        console.log('onDateInput: ');
    }
}
