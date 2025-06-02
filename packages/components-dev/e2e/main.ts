import { bootstrapApplication } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideNoopAnimations()
    ]
}).catch((error) => console.error(error));
