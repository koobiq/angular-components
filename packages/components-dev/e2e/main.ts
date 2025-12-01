import { bootstrapApplication } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { E2eApp } from './module';

bootstrapApplication(E2eApp, {
    providers: [
        provideNoopAnimations()
    ]
}).catch((error) => console.error(error));
