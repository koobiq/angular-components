import { provideHttpClient } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { KBQ_LOCALE_SERVICE, KbqLocaleService, kbqLocaleServiceLangAttrNameProvider } from '@koobiq/components/core';
import { DocsAppComponent } from './app/app.component';
import { DOCS_ROUTES } from './app/routes';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(DocsAppComponent, {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideRouter(DOCS_ROUTES),
        kbqLocaleServiceLangAttrNameProvider('examples-lang'),
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
}).catch((error) => console.error(error));
