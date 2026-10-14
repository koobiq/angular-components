import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DevApp, devProviders } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations(),
        devProviders
    ]
}).catch((error) => console.error(error));
