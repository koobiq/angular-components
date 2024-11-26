import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TreeSelectDev } from './module';

bootstrapApplication(TreeSelectDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
