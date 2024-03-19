import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';

import { KbqCalendarBody } from './calendar-body.component';
import { KbqCalendarHeader } from './calendar-header.component';
import { KbqCalendar } from './calendar.component';
import { KbqDatepickerInput } from './datepicker-input.directive';
import { KbqDatepickerIntl } from './datepicker-intl';
import { KbqDatepickerToggle, KbqDatepickerToggleIcon } from './datepicker-toggle.component';
import {
    KbqDatepicker,
    KbqDatepickerContent,
    KBQ_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER
} from './datepicker.component';
import { KbqMonthView } from './month-view.component';


@NgModule({
    imports: [
        CommonModule,
        KbqButtonModule,
        OverlayModule,
        A11yModule,
        PortalModule,
        KbqButtonModule,
        KbqSelectModule,
        KbqIconModule
    ],
    exports: [
        KbqCalendar,
        KbqCalendarBody,
        KbqDatepicker,
        KbqDatepickerContent,
        KbqDatepickerInput,
        KbqDatepickerToggle,
        KbqDatepickerToggleIcon,
        KbqMonthView,
        KbqCalendarHeader
    ],
    declarations: [
        KbqCalendar,
        KbqCalendarBody,
        KbqDatepicker,
        KbqDatepickerContent,
        KbqDatepickerInput,
        KbqDatepickerToggle,
        KbqDatepickerToggleIcon,
        KbqMonthView,
        KbqCalendarHeader
    ],
    providers: [
        KbqDatepickerIntl,
        KBQ_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER
    ]
})
export class KbqDatepickerModule {}
