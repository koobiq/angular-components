import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

export default {
    providers: [
        provideRouter([]),
        provideHttpClient(withFetch()),
        provideClientHydration(withEventReplay()),
        provideAnimations()
    ]
} satisfies ApplicationConfig;
