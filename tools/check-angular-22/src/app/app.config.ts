import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // The library awaits `zone.onStable` in several components, so it is not zoneless-ready.
    provideZoneChangeDetection(),
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
