import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';
import { DocsAppComponent } from './app/app.component';
import { docsConfigBrowser } from './config.browser';

Sentry.init({
    dsn: 'https://0df1a826e548070a1d125e041280042e@o4511661289635840.ingest.de.sentry.io/4511858149621840',
    enabled: !isDevMode(),
    dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: {
            request: false,
            response: false
        },
        httpBodies: [],
        urlQueryParams: false,
        stackFrameVariables: false
    },
    integrations: [
        Sentry.httpClientIntegration()
    ]
});

bootstrapApplication(DocsAppComponent, docsConfigBrowser).catch((error) => {
    Sentry.captureException(error);
    console.error(error);
});
