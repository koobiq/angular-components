import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideClientHydration } from '@angular/platform-browser';
import { KBQ_LOCALE_SERVICE, KbqLocaleService, kbqLocaleServiceLangAttrNameProvider } from '@koobiq/components/core';
import { DOCS_ROUTES } from './routes';

export const docsAppConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(),
        provideRouter(DOCS_ROUTES),
        kbqLocaleServiceLangAttrNameProvider('examples-lang'),
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
        provideClientHydration()
    ]
};
