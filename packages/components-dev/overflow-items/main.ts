import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OverflowItemsDev } from './module';

bootstrapApplication(OverflowItemsDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
