import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { DateTime } from 'luxon';

/**
 * @title Datepicker required
 */
@Component({
    selector: 'datepicker-required-example',
    imports: [
        FormsModule,
        LuxonDateModule,
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqIconModule
    ],
    template: `
        <div class="docs-example__datepicker-required">
            <kbq-form-field (click)="datepicker.toggle()">
                <input [kbqDatepicker]="datepicker" [required]="true" [(ngModel)]="date" />
                <kbq-datepicker-toggle-icon kbqSuffix [for]="datepicker" />
                <kbq-datepicker #datepicker />
            </kbq-form-field>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatepickerRequiredExample {
    date: DateTime | null = null;
}
