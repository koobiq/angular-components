import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Scrollbar } from './module';

bootstrapApplication(Scrollbar, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
