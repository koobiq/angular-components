import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { kbqToastConfigurationProvider, KbqToastPosition } from '@koobiq/components/toast';
import { ToastDev } from './module';

bootstrapApplication(ToastDev, {
    providers: [
        provideAnimations(),
        kbqToastConfigurationProvider({
            position: KbqToastPosition.BOTTOM_RIGHT
        })

    ]
}).catch((error) => console.error(error));
