import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { DevApp, devPageRoutes } from './module';

export const devAppConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideRouter(devPageRoutes)
    ]
};

bootstrapApplication(DevApp, {
    ...devAppConfig,
    providers: [provideZoneChangeDetection(), ...devAppConfig.providers]
}).catch((error) => console.error(error));
