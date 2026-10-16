import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule, kbqLocaleServiceProvider } from '@koobiq/components/core';
import { DevAllApp } from './module';
import { devAllRoutes } from './routes';

bootstrapApplication(DevAllApp, {
    providers: [
        provideRouter(devAllRoutes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
        // `KbqIconRegistry` optionally injects `HttpClient` and throws a descriptive error without it.
        provideHttpClient(),
        // Required by the sidebar's locale selector, and covers the routes that expect a locale service.
        kbqLocaleServiceProvider(),
        // `KbqNotificationCenterService` is `providedIn: 'root'` and injects `DateAdapter` and `DateFormatter`,
        // which route-level providers cannot reach.
        importProvidersFrom(KbqLuxonDateModule, KbqFormattersModule)
    ]
}).catch((error) => console.error(error));
