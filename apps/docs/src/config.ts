import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { KBQ_LOCALE_SERVICE, KbqLocaleService, kbqLocaleServiceLangAttrNameProvider } from '@koobiq/components/core';
import { DOCS_ROUTES } from './app/routes';

export default {
    providers: [
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
        kbqLocaleServiceLangAttrNameProvider('examples-lang'),
        provideRouter(DOCS_ROUTES),
        provideHttpClient(withFetch()),
        provideAnimations()
    ]
} satisfies ApplicationConfig;
