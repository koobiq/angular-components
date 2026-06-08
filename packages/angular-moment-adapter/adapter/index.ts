import { NgModule } from '@angular/core';
import { DateAdapter, KBQ_DATE_FORMATS, KbqLocaleServiceModule } from '@koobiq/components/core';
import { MomentDateAdapter } from './moment-date-adapter';

export * from './moment-date-adapter';
export * from './moment-date-formats';

@NgModule({
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter
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
