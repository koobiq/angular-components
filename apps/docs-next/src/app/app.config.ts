import { OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import {
    PreloadAllModules,
    provideRouter,
    withInMemoryScrolling,
    withPreloading,
    withRouterConfig
} from '@angular/router';
import { kbqThemeProvider } from '@koobiq/components/core';
import { DOCS_NEXT_ROUTES } from './routes';
import { DocsNextOverlayContainer } from './services/overlay-container';
import { docsNextSlowNetworkInterceptor } from './services/slow-network';

export const docsNextAppConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        kbqThemeProvider({ storageKey: 'docs-next-theme' }),
        provideHttpClient(withFetch(), withInterceptors([docsNextSlowNetworkInterceptor])),
        { provide: OverlayContainer, useClass: DocsNextOverlayContainer },
        provideRouter(
            DOCS_NEXT_ROUTES,
            withRouterConfig({ paramsInheritanceStrategy: 'always' }),
            // The chunks of the pages come in the background once the first one is shown.
            withPreloading(PreloadAllModules),
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
        )
    ]
};
