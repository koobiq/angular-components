import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ModalDev } from './module';

bootstrapApplication(ModalDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
