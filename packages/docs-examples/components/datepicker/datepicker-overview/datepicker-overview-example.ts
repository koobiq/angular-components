import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { DateTime } from 'luxon';

/**
 * @title Datepicker
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'datepicker-overview-example',
    imports: [
        FormsModule,
        LuxonDateModule,
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqIconModule
    ],
    template: `
        <div class="docs-example__datepicker-overview">
            <kbq-form-field (click)="datepicker.toggle()">
                <input [(ngModel)]="date" [kbqDatepicker]="datepicker" />
                <kbq-datepicker-toggle-icon [for]="datepicker" kbqSuffix />
                <kbq-datepicker #datepicker />
            </kbq-form-field>
        </div>
    `
})
export class DatepickerOverviewExample {
    date: DateTime | null = null;
}
