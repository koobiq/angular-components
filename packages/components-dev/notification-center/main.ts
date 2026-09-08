import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations(),
        // `KbqNotificationCenterService` is `providedIn: 'root'` and injects `DateAdapter` and
        // `DateFormatter`, so both have to reach the root injector. Importing these modules into
        // `DevApp` served only its own injections and left the root-provided singleton without an
        // adapter, which threw NG0201 on load.
        importProvidersFrom(KbqLuxonDateModule, KbqFormattersModule)
    ]
}).catch((error) => console.error(error));
