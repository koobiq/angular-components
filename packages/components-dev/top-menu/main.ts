import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TopMenuDev } from './module';

bootstrapApplication(TopMenuDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
