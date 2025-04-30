import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { KBQ_TOAST_CONFIG, KbqToastConfig, KbqToastPosition } from '@koobiq/components/toast';
import { ToastDev } from './module';

bootstrapApplication(ToastDev, {
    providers: [
        provideAnimations(),
        {
            provide: KBQ_TOAST_CONFIG,
            useValue: {
                position: KbqToastPosition.TOP_RIGHT,
                duration: 5000,
                delay: 2000,
                onTop: false
            } satisfies KbqToastConfig
        }
    ]
}).catch((error) => console.error(error));
