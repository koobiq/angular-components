import { bootstrapApplication } from '@angular/platform-browser';
import { DevApp } from './module';

bootstrapApplication(DevApp).catch((error) => console.error(error));
