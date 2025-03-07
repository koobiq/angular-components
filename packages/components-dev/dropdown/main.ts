import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DropdownDev } from './module';

bootstrapApplication(DropdownDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
