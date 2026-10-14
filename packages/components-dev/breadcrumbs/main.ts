import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { DevApp, devPageRoutes } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideRouter(devPageRoutes)
    ]
}).catch((error) => console.error(error));
