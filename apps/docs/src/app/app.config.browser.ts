import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';

import { provideAnimations } from '@angular/platform-browser/animations';
import { kbqLocalStorageBrowserProvider, kbqMatchMediaBrowserProvider } from '@koobiq/components/core';
import { docsAppConfig } from './app.config';

const browserConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        kbqLocalStorageBrowserProvider,
        kbqMatchMediaBrowserProvider
    ]
};

export const docsConfig = mergeApplicationConfig(docsAppConfig, browserConfig);
