import { bootstrapApplication } from '@angular/platform-browser';
import config from './config';
import { DevApp } from './module';

bootstrapApplication(DevApp, config).catch((err) => console.error(err));
