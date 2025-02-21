import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TopBarDev } from './module';

bootstrapApplication(TopBarDev, {
    providers: [
        provideAnimations(),
        provideRouter([])]
}).catch((error) => console.error(error));
