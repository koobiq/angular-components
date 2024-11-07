import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { KoobiqDocsExample } from './example/koobiq-docs-example';

bootstrapApplication(KoobiqDocsExample, {
    providers: [
        provideAnimations(),
        provideHttpClient()
    ]
}).catch((err) => console.error(err));
