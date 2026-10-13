import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { DevApp, devPageRoutes } from './module';

export const devAppConfig: ApplicationConfig = {
    providers: [
        provideRouter(devPageRoutes)
    ]
};

bootstrapApplication(DevApp, {
    ...devAppConfig,
    providers: [provideZonelessChangeDetection(), ...devAppConfig.providers]
}).catch((error) => console.error(error));
