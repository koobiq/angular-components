import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SelectDev } from './module';

bootstrapApplication(SelectDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
