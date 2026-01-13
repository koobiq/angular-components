import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTimepickerModule, TimeFormats } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

@Component({
    selector: 'e2e-timepicker-states',
    imports: [
        KbqFormFieldModule,
        KbqTimepickerModule,
        KbqIconModule,
        FormsModule,
        ReactiveFormsModule,
        KbqLuxonDateModule
    ],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <!-- empty state -->
        <kbq-form-field>
            <i kbq-icon="kbq-clock_16" kbqPrefix></i>
            <input kbqTimepicker [format]="timeFormats.HHmm" />
            <kbq-hint>HH:mm</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <i kbq-icon="kbq-clock_16" kbqPrefix></i>
            <input kbqTimepicker [format]="timeFormats.HHmm" [(ngModel)]="value" />
            <kbq-hint>HH:mm</kbq-hint>
        </kbq-form-field>
        <kbq-form-field>
            <i kbq-icon="kbq-clock_16" kbqPrefix></i>
            <input kbqTimepicker [format]="timeFormats.HHmmss" [(ngModel)]="value" />
            <kbq-hint>HH:mm:ss</kbq-hint>
        </kbq-form-field>

        <!-- disabled state -->
        <kbq-form-field>
            <i kbq-icon="kbq-clock_16" kbqPrefix></i>
            <input kbqTimepicker [disabled]="true" [format]="timeFormats.HHmmss" />
            <kbq-hint>HH:mm:ss</kbq-hint>
        </kbq-form-field>
        <kbq-form-field>
            <i kbq-icon="kbq-clock_16" kbqPrefix></i>
            <input kbqTimepicker [disabled]="true" [format]="timeFormats.HHmmss" [(ngModel)]="value" />
            <kbq-hint>HH:mm:ss</kbq-hint>
        </kbq-form-field>

        <!-- fake invalid state -->
        <kbq-form-field class="kbq-form-field_invalid">
            <i kbq-icon="kbq-clock_16" kbqPrefix></i>
            <input kbqTimepicker [format]="timeFormats.HHmmss" [(ngModel)]="value" />
            <kbq-hint>HH:mm:ss</kbq-hint>
        </kbq-form-field>
        <kbq-form-field>
            <i kbq-icon="kbq-clock_16" kbqPrefix></i>
            <input kbqTimepicker [format]="timeFormats.HHmmss" [formControl]="invalidControl" />
            <kbq-hint>HH:mm:ss</kbq-hint>
            <kbq-error>Error message</kbq-error>
        </kbq-form-field>

        <!-- fake focused state -->
        <kbq-form-field class="cdk-keyboard-focused cdk-focused">
            <i kbq-icon="kbq-clock_16" kbqPrefix></i>
            <input kbqTimepicker [format]="timeFormats.HHmmss" [formControl]="invalidControl" />
            <kbq-hint>HH:mm:ss</kbq-hint>
            <kbq-error>Error message</kbq-error>
        </kbq-form-field>
        <kbq-form-field class="cdk-keyboard-focused cdk-focused">
            <i kbq-icon="kbq-clock_16" kbqPrefix></i>
            <input kbqTimepicker [format]="timeFormats.HHmmss" [(ngModel)]="value" />
            <kbq-hint>HH:mm:ss</kbq-hint>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTimepickerStates'
    }
})
export class E2eTimepickerStates {
    private readonly adapter = inject(DateAdapter<DateTime>);
    protected readonly timeFormats = TimeFormats;
    protected readonly value = model(this.adapter.createDateTime(2022, 6, 7, 14, 30, 25, 15));
    protected readonly invalidControl = new FormControl(null, [Validators.required]);

    constructor() {
        this.invalidControl.markAsTouched();
        this.invalidControl.updateValueAndValidity();
    }
}
