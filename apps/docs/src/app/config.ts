import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, TitleStrategy } from '@angular/router';
import {
    kbqLocaleServiceLangAttrNameProvider,
    kbqLocaleServiceProvider,
    kbqThemeProvider
} from '@koobiq/components/core';
import { kbqIconsResolverProvider } from '@koobiq/components/icon';
import { DOCS_ROUTES } from './routes';
import { docsProvideAnalytics } from './services/analytics';
import { DocsTitleStrategy } from './services/title-strategy';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const appConfig: ApplicationConfig = {
    providers: [
        kbqLocaleServiceProvider(),
        kbqLocaleServiceLangAttrNameProvider('examples-lang'),
        // keeps the pre-existing localStorage key so users who already picked a theme don't lose it
        kbqThemeProvider({ storageKey: 'docs_theme' }),
        kbqIconsResolverProvider((name) => `/assets/SVGIcons/${name.replace(/^kbq-/, '')}.svg`),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(DOCS_ROUTES),
        provideHttpClient(withFetch()),
        provideClientHydration(withEventReplay()),
        provideAnimations(),
        { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
        { provide: TitleStrategy, useClass: DocsTitleStrategy },
        docsProvideAnalytics()
    ]
};
