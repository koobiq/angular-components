import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RadioDev } from './module';

bootstrapApplication(RadioDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
