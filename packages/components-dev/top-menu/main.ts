import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TopMenuDev } from './module';

bootstrapApplication(TopMenuDev, {
    providers: [
        provideAnimations(),
        provideRouter([])]
}).catch((error) => console.error(error));
