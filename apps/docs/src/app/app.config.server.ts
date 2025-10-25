import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { docsAppConfig } from './app.config';

const serverConfig: ApplicationConfig = {
    providers: [
        provideServerRendering()
    ]
};

export const docsConfig = mergeApplicationConfig(docsAppConfig, serverConfig);
