import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';

import { provideAnimations } from '@angular/platform-browser/animations';
import { docsAppConfig } from './app.config';

const browserConfig: ApplicationConfig = {
    providers: [
        provideAnimations()
    ]
};

export const docsConfig = mergeApplicationConfig(docsAppConfig, browserConfig);
