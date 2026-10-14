import { ApplicationConfig } from '@angular/core';
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

bootstrapApplication(DevApp, devAppConfig).catch((error) => console.error(error));
