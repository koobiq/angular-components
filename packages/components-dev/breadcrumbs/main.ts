import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { Breadcrumbs } from './module';

bootstrapApplication(Breadcrumbs, {
    providers: [
        provideAnimations(),
        provideRouter([])]
}).catch((error) => console.error(error));
