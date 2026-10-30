import { bootstrapApplication } from '@angular/platform-browser';
import { DocsNextApp } from './app/app';
import { docsNextAppConfig } from './app/app.config';

bootstrapApplication(DocsNextApp, docsNextAppConfig).catch((err) => console.error(err));
