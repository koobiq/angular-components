import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideKoobiqIcons } from '@koobiq/components/icon';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideKoobiqIcons({ spriteUrl: '/assets/svg-icons/sprite.symbol.svg', namespace: '' })
    ]
}).catch((error) => console.error(error));
