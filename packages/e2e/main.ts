import { provideHttpClient } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import { e2eEnvironment } from './environments/environment';
import { E2eApp } from './module';
import { e2eRoutes } from './routes';

if (e2eEnvironment.production) enableProdMode();

bootstrapApplication(E2eApp, {
    providers: [
        provideNoopAnimations(),
        provideRouter(e2eRoutes),
        provideHttpClient(),
        // `KbqNotificationCenterService` is `providedIn: 'root'` and injects `DateAdapter` and
        // `DateFormatter`, so both have to reach the root injector — a fixture importing these modules into
        // its own component only serves that component's own injections, not a root-provided singleton's.
        //
        // `LuxonDateModule` rather than `KbqLuxonDateModule`: the latter also imports `KbqLocaleServiceModule`,
        // and binding `KBQ_LOCALE_SERVICE` app-wide switches every other fixture off its built-in defaults —
        // `KbqDataSizePipe` alone starts rendering "4 Б" where the file-upload baseline holds "4 B".
        importProvidersFrom(LuxonDateModule, KbqFormattersModule)
    ]
    // eslint-disable-next-line no-console
}).catch((error) => console.error(error));
