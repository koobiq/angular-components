import { NgModule } from '@angular/core';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from './locale-service';

@NgModule({
    providers: [
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
    ],
})
export class KbqLocaleServiceModule {}
