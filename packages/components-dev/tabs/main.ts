import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Tabs } from './module';

bootstrapApplication(Tabs, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
