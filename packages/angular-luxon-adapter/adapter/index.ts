import { NgModule } from '@angular/core';
import {
    DateAdapter,
    KbqLocaleServiceModule,
    KBQ_DATE_FORMATS,
    KBQ_DATE_LOCALE,
    KBQ_LOCALE_SERVICE
} from '@koobiq/components/core';

import { KBQ_LUXON_DATE_ADAPTER_OPTIONS, LuxonDateAdapter } from './date-adapter';


export * from './date-adapter';
export * from './date-formats';

@NgModule({
    providers: [{
        provide: DateAdapter,
        useClass: LuxonDateAdapter,
        deps: [KBQ_DATE_LOCALE, KBQ_LUXON_DATE_ADAPTER_OPTIONS, KBQ_LOCALE_SERVICE]
    }]
})
export class LuxonDateModule {}

@NgModule({
    imports: [LuxonDateModule, KbqLocaleServiceModule],
    providers: [{
        // todo после добавления KbqLocaleServiceModule возможно уже неактуально
        provide: KBQ_DATE_FORMATS, useValue: null
    }]
})
export class KbqLuxonDateModule {}
