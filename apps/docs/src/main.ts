import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { DocsAppComponent } from './app/app.component';
import { docsConfig } from './app/app.config.browser';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(DocsAppComponent, docsConfig).catch((error) => console.error(error));
