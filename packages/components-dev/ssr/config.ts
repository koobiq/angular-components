import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';

export default {
    providers: [
        { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
        provideRouter([]),
        provideHttpClient(withFetch()),
        provideClientHydration(withEventReplay()),
        provideAnimations()
    ]
} satisfies ApplicationConfig;
