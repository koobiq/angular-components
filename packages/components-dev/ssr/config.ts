import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { kbqLocaleServiceProvider } from '@koobiq/components/core';
import { devTimezoneBrowserProviders } from './timezone';
import { devSsrRoutes } from './routes';

export default {
    providers: [
        kbqLocaleServiceProvider(),
        devTimezoneBrowserProviders(),
        provideRouter([]),
        provideRouter(devSsrRoutes),
        provideHttpClient(withFetch()),
        provideClientHydration(withEventReplay()),
        provideAnimations()
    ]
} satisfies ApplicationConfig;
