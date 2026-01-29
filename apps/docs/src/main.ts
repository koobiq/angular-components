import { bootstrapApplication } from '@angular/platform-browser';
import { DocsAppComponent } from './app/app.component';
import { appConfig } from './app/config';

bootstrapApplication(DocsAppComponent, appConfig).catch((err) => console.error(err));
