import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqAutoColor } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { DateTime } from 'luxon';

/**
 * @title Datepicker required
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'datepicker-required-example',
    imports: [
        FormsModule,
        LuxonDateModule,
        KbqDatepickerModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqAutoColor
    ],
    template: `
        <div class="docs-example__datepicker-required">
            <kbq-form-field (click)="datepicker.toggle()" style="width: 136px">
                <input [(ngModel)]="date" [kbqDatepicker]="datepicker" [required]="true" />
                <i
                    [tabindex]="-1"
                    [class.kbq-active]="datepicker.opened"
                    kbqAutoColor
                    kbq-icon-button="kbq-calendar-o_16"
                    color="contrast-fade"
                    kbqSuffix
                ></i>
                <kbq-datepicker #datepicker />
            </kbq-form-field>
        </div>
    `
})
export class DatepickerRequiredExample {
    date: DateTime | null = null;
}
