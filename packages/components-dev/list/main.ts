import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ListDev } from './module';

bootstrapApplication(ListDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
