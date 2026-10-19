import { bootstrapApplication } from '@angular/platform-browser';
import { DevApp, devProviders } from './module';

bootstrapApplication(DevApp, {
    providers: [
        devProviders
    ]
}).catch((error) => console.error(error));
