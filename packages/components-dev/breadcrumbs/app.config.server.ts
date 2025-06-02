import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router';

const appConfig: ApplicationConfig = {
    providers: []
};

const serverConfig: ApplicationConfig = {
    providers: [
        provideClientHydration(withEventReplay()),
        provideServerRendering(),
        provideRouter([])]
};

export const devConfig = mergeApplicationConfig(appConfig, serverConfig);
