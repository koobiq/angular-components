import { DOCUMENT } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { createComponent, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { kbqLocaleServiceProvider } from '@koobiq/components/core';
import { KoobiqDocsExample } from './example/koobiq-docs-example';
import { DocsLanguageSwitcher } from './language-switcher';

bootstrapApplication(KoobiqDocsExample, {
    providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter([]),
        kbqLocaleServiceProvider()
    ]
})
    .then((appRef) => {
        // The header lives outside the example component, so the switcher is mounted into it by hand.
        const switcher = createComponent(DocsLanguageSwitcher, { environmentInjector: appRef.injector });

        appRef.attachView(switcher.hostView);
        const host = appRef.injector.get(DOCUMENT).getElementById('docs-language-switcher');

        host?.appendChild(switcher.location.nativeElement);
    })
    .catch((err) => console.error(err));
