import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { kbqLocaleServiceProvider } from '@koobiq/components/core';
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
        // TODO: Examples import `KbqSidepanelModule`, but its providers don't reach their standalone
        // injectors once several examples are prerendered in the same worker: rendering breaks with
        // "NG0201: No provider found for KbqSidepanelService. Source: Standalone[…]", while
        // prerendering any one of them alone succeeds. (#DS-5467)
        KbqSidepanelService
    ]
} satisfies ApplicationConfig;
