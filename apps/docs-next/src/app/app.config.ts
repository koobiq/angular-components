import { OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { kbqThemeProvider } from '@koobiq/components/core';
import { DOCS_NEXT_ROUTES } from './routes';
import { DocsNextOverlayContainer } from './services/overlay-container';

export const docsNextAppConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        kbqThemeProvider({ storageKey: 'docs-next-theme' }),
        provideHttpClient(withFetch()),
        { provide: OverlayContainer, useClass: DocsNextOverlayContainer },
        provideRouter(
            DOCS_NEXT_ROUTES,
            withRouterConfig({ paramsInheritanceStrategy: 'always' }),
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
        )
    ]
};
