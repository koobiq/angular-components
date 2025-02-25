import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { ActionsPanelDev, Page1, Page2 } from './module';

bootstrapApplication(ActionsPanelDev, {
    providers: [
        provideAnimations(),
        provideRouter([
            { path: '', redirectTo: 'page-1', pathMatch: 'full' },
            { path: 'page-1', component: Page1 },
            { path: 'page-2', component: Page2 }
        ]),
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
    ]
}).catch((error) => console.error(error));
