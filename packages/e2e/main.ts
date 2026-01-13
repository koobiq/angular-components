import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { e2eEnvironment } from './environments/environment';
import { E2eApp } from './module';
import { e2eRoutes } from './routes';

if (e2eEnvironment.production) enableProdMode();

bootstrapApplication(E2eApp, {
    providers: [
        provideNoopAnimations(),
        provideRouter(e2eRoutes)
    ]
    // eslint-disable-next-line no-console
}).catch((error) => console.error(error));
