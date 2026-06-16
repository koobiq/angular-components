import { NgModule } from '@angular/core';
import { DateAdapter, KBQ_DATE_FORMATS, KbqLocaleServiceModule } from '@koobiq/components/core';
import { LuxonDateAdapter } from './date-adapter';

export * from './date-adapter';
export * from './date-formats';

@NgModule({
    providers: [
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter
        }
    ]
})
export class LuxonDateModule {}

@NgModule({
    imports: [LuxonDateModule, KbqLocaleServiceModule],
    providers: [
        {
            // todo после добавления KbqLocaleServiceModule возможно уже неактуально
            provide: KBQ_DATE_FORMATS,
            useValue: null
        }
    ]
})
export class KbqLuxonDateModule {}
