import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DemoComponent } from './module';

bootstrapApplication(DemoComponent, {
    providers: [provideAnimations()]
}).catch((error) => console.error(error));
