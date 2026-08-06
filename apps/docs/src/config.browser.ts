import { ApplicationConfig, ErrorHandler, mergeApplicationConfig } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { appConfig } from './app/config';

const browserConfig: ApplicationConfig = {
    providers: [
        {
            provide: ErrorHandler,
            useValue: Sentry.createErrorHandler()
        }
    ]
};

export const docsConfigBrowser = mergeApplicationConfig(appConfig, browserConfig);
