import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { KBQ_LOCALE_SERVICE, KbqLocaleService, kbqLocaleServiceLangAttrNameProvider } from '@koobiq/components/core';
import { DOCS_ROUTES } from './routes';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const appConfig: ApplicationConfig = {
    providers: [
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
        kbqLocaleServiceLangAttrNameProvider('examples-lang'),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(DOCS_ROUTES),
        provideHttpClient(withFetch()),
        provideClientHydration(withEventReplay()),
        provideAnimations()
    ]
};
