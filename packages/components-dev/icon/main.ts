import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideKoobiqIconsResolver } from '@koobiq/components/icon';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        // provideKoobiqIcons({ spriteUrl: '/assets/svg-icons/sprite/sprite.symbol.svg', namespace: 'kbq' }),
        provideKoobiqIconsResolver((name) => `/assets/svg-icons/${name}.svg`)
    ]
}).catch((error) => console.error(error));
