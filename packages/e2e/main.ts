import { bootstrapApplication } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideNoopAnimations(),
        provideRouter([])]
    // eslint-disable-next-line no-console
}).catch((error) => console.error(error));
