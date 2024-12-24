import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ExperimentalFormFieldDev } from './module';

bootstrapApplication(ExperimentalFormFieldDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
