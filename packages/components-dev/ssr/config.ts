import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule, kbqLocaleServiceProvider } from '@koobiq/components/core';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { devSsrRoutes } from './routes';
import { devTimezoneBrowserProviders } from './timezone';

export default {
    providers: [
        kbqLocaleServiceProvider(),
        devTimezoneBrowserProviders(),
        provideRouter(devSsrRoutes),
        provideHttpClient(withFetch()),
        provideClientHydration(withEventReplay()),
        provideAnimations(),
        // `KbqNotificationCenterService` is `providedIn: 'root'` and injects `DateAdapter` and
        // `DateFormatter`, so both have to reach the root injector — an example importing these modules
        // into its own component only serves that component's own injections, not a root-provided
        // singleton's. Without them the first prerendered notification-center example throws NG0201 and
        // takes its whole worker down, failing every route batched into it.
        //
        // `LuxonDateModule` rather than `KbqLuxonDateModule`: the latter also imports
        // `KbqLocaleServiceModule`, and this config already binds the locale service above.
        importProvidersFrom(LuxonDateModule, KbqFormattersModule),
        // TODO: Examples import `KbqSidepanelModule`, but its providers don't reach their standalone
        // injectors once several examples are prerendered in the same worker: rendering breaks with
        // "NG0201: No provider found for KbqSidepanelService. Source: Standalone[…]", while
        // prerendering any one of them alone succeeds. (#DS-5467)
        KbqSidepanelService
    ]
} satisfies ApplicationConfig;
