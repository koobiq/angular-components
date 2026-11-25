import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { kbqLocaleIDProvider, kbqLocaleServiceProvider, kbqThemeProvider } from '@koobiq/components/core';
import { docsMountHeader } from './docs-header/mount';
import { KoobiqDocsExample } from './example/koobiq-docs-example';

bootstrapApplication(KoobiqDocsExample, {
    providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter([]),
        kbqLocaleIDProvider('${exampleLocale}'),
        kbqLocaleServiceProvider(),
        kbqThemeProvider({ storageKey: 'docs_theme' })
    ]
})
    // The header is outside the example component, so it is mounted into `index.html` by hand.
    .then((appRef) => docsMountHeader(appRef))
    .catch((err) => console.error(err));
