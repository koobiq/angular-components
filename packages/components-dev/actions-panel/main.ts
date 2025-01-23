import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ActionsPanelDev } from './module';

bootstrapApplication(ActionsPanelDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
