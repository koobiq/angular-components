import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Markdown } from './module';

bootstrapApplication(Markdown, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
