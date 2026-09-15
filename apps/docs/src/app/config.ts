import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, TitleStrategy } from '@angular/router';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    KbqFormattersModule,
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
        // `KbqNotificationCenterService` is `providedIn: 'root'` and injects `DateAdapter` and
        // `DateFormatter`, so both have to reach the root injector — an example importing these modules
        // into its own component only serves that component's own injections, not a root-provided
        // singleton's. Without them the notification-center pages throw NG0201 on load.
        //
        // `LuxonDateModule` rather than `KbqLuxonDateModule`: the latter also imports
        // `KbqLocaleServiceModule`, and this config already binds the locale service above.
        importProvidersFrom(LuxonDateModule, KbqFormattersModule),
        provideRouter(DOCS_ROUTES),
        provideHttpClient(withFetch()),
        provideClientHydration(withEventReplay()),
        provideAnimations(),
        // Keeps overlays (select panels, modals, sidepanels, toasts — everything routed through
        // `overlay.create()`) visible while a `docs-live-example-viewer` is the fullscreen element:
        // the default container lives in `body` and would be hidden by the fullscreen element.
        { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
        { provide: TitleStrategy, useClass: DocsTitleStrategy },
        docsProvideAnalytics()
    ]
};
