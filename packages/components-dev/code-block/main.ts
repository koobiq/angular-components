import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CodeBlockDev } from './module';

bootstrapApplication(CodeBlockDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
