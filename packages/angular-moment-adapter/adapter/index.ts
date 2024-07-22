import { NgModule } from '@angular/core';
import {
    DateAdapter,
    KBQ_DATE_FORMATS,
    KBQ_DATE_LOCALE,
    KBQ_LOCALE_SERVICE,
    KbqLocaleServiceModule
} from '@koobiq/components/core';
import { KBQ_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from './moment-date-adapter';

export * from './moment-date-adapter';
export * from './moment-date-formats';

@NgModule({
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [KBQ_DATE_LOCALE, KBQ_MOMENT_DATE_ADAPTER_OPTIONS, KBQ_LOCALE_SERVICE]
        }
    ]
})
export class MomentDateModule {}

@NgModule({
    imports: [MomentDateModule, KbqLocaleServiceModule],
    providers: [
        {
            // todo после добавления McLocaleServiceModule возможно уже неактуально
            provide: KBQ_DATE_FORMATS,
            useValue: null
        }
    ]
})
export class KbqMomentDateModule {}
