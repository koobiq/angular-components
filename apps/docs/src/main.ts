import { bootstrapApplication } from '@angular/platform-browser';
import { DocsAppComponent } from './app/app.component';
import config from './config';

bootstrapApplication(DocsAppComponent, config).catch((err) => console.error(err));
