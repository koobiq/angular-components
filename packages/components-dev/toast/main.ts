import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToastDev } from './module';

bootstrapApplication(ToastDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
