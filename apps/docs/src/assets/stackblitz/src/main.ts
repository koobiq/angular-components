import 'zone.js';

import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { kbqIconsResolverProvider } from '@koobiq/components/icon';
import { KoobiqDocsExample } from './example/koobiq-docs-example';

bootstrapApplication(KoobiqDocsExample, {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideRouter([]),
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
        kbqIconsResolverProvider((name: string) => `/assets/SVGIcons/${name.replace(/^kbq-/, '')}.svg`)
    ]
}).catch((err) => console.error(err));
