import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToggleDev } from './module';

bootstrapApplication(ToggleDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
