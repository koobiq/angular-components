import { bootstrapApplication } from '@angular/platform-browser';
import { devAppConfig } from '../breadcrumbs/main';
import { DevApp } from '../breadcrumbs/module';

bootstrapApplication(DevApp, devAppConfig).catch((error) => console.error(error));
