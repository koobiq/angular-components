import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ExperimentalInput } from './module';

bootstrapApplication(ExperimentalInput, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
