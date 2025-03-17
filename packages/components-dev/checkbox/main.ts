import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CheckboxDev } from './module';

bootstrapApplication(CheckboxDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
