import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { DevApp, DevPage1, DevPage2 } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations(),
        provideRouter([
            { path: '', redirectTo: 'page-1', pathMatch: 'full' },
            { path: 'page-1', component: DevPage1 },
            { path: 'page-2', component: DevPage2 }
        ]),
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
    ]
}).catch((error) => console.error(error));
