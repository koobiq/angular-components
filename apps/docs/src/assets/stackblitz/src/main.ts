import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { kbqLocaleServiceProvider } from '@koobiq/components/core';
import { KoobiqDocsExample } from './example/koobiq-docs-example';

bootstrapApplication(KoobiqDocsExample, {
    providers: [
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(),
        provideRouter([]),
        kbqLocaleServiceProvider()
    ]
}).catch((err) => console.error(err));
