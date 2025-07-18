import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
