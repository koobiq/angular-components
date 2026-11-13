import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { TimeFormats } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';
import { KbqDatetime } from './datetime';

const imports = [KbqFormFieldModule, KbqDatepickerModule, KbqDatetime, ReactiveFormsModule, KbqLuxonDateModule];

const template = `
        <div class="layout-row layout-gap-xl" data-testid="e2eScreenshotTarget" style="width: 560px; padding: 8px;">
            <div class="layout-column layout-gap-l flex">
                <kbq-form-field data-testid="e2eDatetimeEmpty" [class.cdk-focused]="focused">
                    <kbq-label>Empty</kbq-label>
                    <kbq-datetime #empty [formControl]="emptyControl" />
                    <kbq-datepicker-toggle-icon kbqSuffix [for]="empty.datepicker()" />
                </kbq-form-field>

                <kbq-form-field [class.cdk-focused]="focused">
                    <kbq-label>Filled</kbq-label>
                    <kbq-datetime #filled [formControl]="filledControl" />
                    <kbq-datepicker-toggle-icon kbqSuffix [for]="filled.datepicker()" />
                </kbq-form-field>

                <kbq-form-field [class.cdk-focused]="focused">
                    <kbq-label>Cleaner</kbq-label>
                    <kbq-datetime #cleaner [formControl]="filledControl" />
                    <kbq-cleaner />
                    <kbq-datepicker-toggle-icon kbqSuffix [for]="cleaner.datepicker()" />
                </kbq-form-field>

                <kbq-form-field>
                    <kbq-label>Disabled</kbq-label>
                    <kbq-datetime #disabled [formControl]="disabledControl" />
                    <kbq-datepicker-toggle-icon kbqSuffix [for]="disabled.datepicker()" />
                </kbq-form-field>

                <kbq-form-field [class.cdk-focused]="focused">
                    <kbq-label>Invalid</kbq-label>
                    <kbq-datetime #invalid [min]="min" [formControl]="invalidControl" />
                    <kbq-datepicker-toggle-icon kbqSuffix [for]="invalid.datepicker()" />
                    <kbq-error>Not earlier than 12.11.2025 09:00</kbq-error>
                </kbq-form-field>
            </div>

            <div class="layout-column layout-gap-l flex">
                <kbq-form-field [class.cdk-focused]="focused">
                    <kbq-label>Seconds, empty</kbq-label>
                    <kbq-datetime #secondsEmpty [format]="timeFormats.HHmmss" [formControl]="emptyControl" />
                    <kbq-datepicker-toggle-icon kbqSuffix [for]="secondsEmpty.datepicker()" />
                </kbq-form-field>

                <kbq-form-field [class.cdk-focused]="focused">
                    <kbq-label>Seconds, filled</kbq-label>
                    <kbq-datetime #seconds [format]="timeFormats.HHmmss" [formControl]="filledControl" />
                    <kbq-datepicker-toggle-icon kbqSuffix [for]="seconds.datepicker()" />
                </kbq-form-field>

                <kbq-form-field [class.cdk-focused]="focused">
                    <kbq-label>Seconds, cleaner</kbq-label>
                    <kbq-datetime #secondsCleaner [format]="timeFormats.HHmmss" [formControl]="filledControl" />
                    <kbq-cleaner />
                    <kbq-datepicker-toggle-icon kbqSuffix [for]="secondsCleaner.datepicker()" />
                </kbq-form-field>

                <kbq-form-field [class.cdk-focused]="focused">
                    <kbq-label>Hint</kbq-label>
                    <kbq-datetime #hint [formControl]="filledControl" />
                    <kbq-datepicker-toggle-icon kbqSuffix [for]="hint.datepicker()" />
                    <kbq-hint>In your local time zone</kbq-hint>
                </kbq-form-field>
            </div>
        </div>
`;

class DatetimeStates {
    protected readonly timeFormats = TimeFormats;
    protected readonly min = DateTime.fromISO('2025-11-12T09:00');

    protected readonly emptyControl = new FormControl<DateTime | null>(null);
    protected readonly filledControl = new FormControl(DateTime.fromISO('2025-11-09T20:20:35'));
    protected readonly disabledControl = new FormControl({
        value: DateTime.fromISO('2025-11-09T20:20:35'),
        disabled: true
    });
    protected readonly invalidControl = new FormControl(DateTime.fromISO('2025-11-09T20:20:35'));

    constructor() {
        this.invalidControl.markAsTouched();
    }
}

@Component({
    selector: 'e2e-datetime-states',
    imports,
    template,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eDatetimeStates'
    }
})
export class E2eDatetimeStates extends DatetimeStates {
    protected readonly focused = false;
}

/** Every field painted focused: the class the form field takes from its focus monitor, as only one can hold the focus. */
@Component({
    selector: 'e2e-datetime-focused',
    imports,
    template,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eDatetimeFocused'
    }
})
export class E2eDatetimeFocused extends DatetimeStates {
    protected readonly focused = true;
}
