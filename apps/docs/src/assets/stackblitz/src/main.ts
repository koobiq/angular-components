import 'zone.js';

import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@koobiq/components/tooltip';
import { KoobiqDocsExample } from './example/koobiq-docs-example';

bootstrapApplication(KoobiqDocsExample, {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideRouter([]),
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
        KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER
    ]
}).catch((err) => console.error(err));
