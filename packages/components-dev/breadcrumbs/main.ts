import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Breadcrumbs } from './module';

bootstrapApplication(Breadcrumbs, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
