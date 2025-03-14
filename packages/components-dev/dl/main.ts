import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DlDev } from './module';

bootstrapApplication(DlDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
