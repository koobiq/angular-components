import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { KoobiqDocsExample } from './example/koobiq-docs-example';

bootstrapApplication(KoobiqDocsExample, {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideRouter([]),
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
}).catch((err) => console.error(err));
