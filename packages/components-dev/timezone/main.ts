import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TimezoneDev } from './module';

bootstrapApplication(TimezoneDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
