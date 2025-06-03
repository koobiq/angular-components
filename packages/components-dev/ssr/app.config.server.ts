import { ApplicationConfig } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router';

export const devConfig: ApplicationConfig = {
    providers: [
        provideClientHydration(withEventReplay()),
        provideServerRendering(),
        provideRouter([])]
};
