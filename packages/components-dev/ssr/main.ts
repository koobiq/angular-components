import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideRouter([]),
        provideAnimations()
    ]
}).catch((error) => console.error(error));
