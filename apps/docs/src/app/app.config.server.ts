import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { kbqLocalStorageServerProvider, kbqMatchMediaServerProvider } from '@koobiq/components/core';
import { docsAppConfig } from './app.config';

const serverConfig: ApplicationConfig = {
    providers: [
        provideServerRendering(),
        kbqLocalStorageServerProvider,
        kbqMatchMediaServerProvider
    ]
};

export const docsConfig = mergeApplicationConfig(docsAppConfig, serverConfig);
