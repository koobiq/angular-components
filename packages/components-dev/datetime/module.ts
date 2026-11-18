import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqDatetime } from '@koobiq/components/datetime';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { TimeFormats } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';
import { DatetimeExamplesModule } from 'packages/docs-examples/components/datetime';
import { DevLocaleSelector } from '../locale-selector';

@Component({
    selector: 'dev-examples',
    imports: [DatetimeExamplesModule],
    template: `
        <datetime-overview-example />
        <datetime-with-seconds-example />
        <datetime-validation-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqDatepickerModule,
        KbqDatetime,
        KbqLuxonDateModule,
        JsonPipe,
        DevLocaleSelector,
        DevExamples
    ],
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    protected readonly timeFormats = TimeFormats;
    protected readonly min = DateTime.fromISO('2026-11-10T09:00');
    protected readonly max = DateTime.fromISO('2026-11-20T18:00');

    protected readonly control = new FormControl<DateTime | null>(null, [Validators.required]);
    protected readonly disabledControl = new FormControl<DateTime | null>({
        value: DateTime.fromISO('2026-11-11T20:20:35'),
        disabled: true
    });
}
