import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ExperimentalFormField } from './module';

bootstrapApplication(ExperimentalFormField, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
