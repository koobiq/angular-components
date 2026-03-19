import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations(),
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
}).catch((error) => console.error(error));
