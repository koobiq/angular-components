import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { kbqToastConfigurationProvider, KbqToastPosition } from '@koobiq/components/toast';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations(),
        kbqToastConfigurationProvider({
            position: KbqToastPosition.BOTTOM_RIGHT
        })
    ]
}).catch((error) => console.error(error));
