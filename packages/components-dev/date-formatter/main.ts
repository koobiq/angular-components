import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
    KBQ_LUXON_DATE_ADAPTER_OPTIONS,
    KBQ_LUXON_DATE_FORMATS,
    LuxonDateAdapter
} from '@koobiq/angular-luxon-adapter/adapter';
import {
    DateAdapter,
    KBQ_DATE_FORMATS,
    KBQ_DATE_LOCALE,
    KBQ_LOCALE_SERVICE,
    KbqLocaleService
} from '@koobiq/components/core';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations(),
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
        { provide: KBQ_DATE_FORMATS, useValue: KBQ_LUXON_DATE_FORMATS },
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
            deps: [KBQ_DATE_LOCALE, KBQ_LUXON_DATE_ADAPTER_OPTIONS, KBQ_LOCALE_SERVICE]
        }
    ]
}).catch((error) => console.error(error));
