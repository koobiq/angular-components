import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { kbqIconsResolverProvider } from '@koobiq/components/icon';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        // kbqIconsProvider({ spriteUrl: '/assets/svg-icons/sprite/sprite.symbol.svg', namespace: 'kbq' }),
        kbqIconsResolverProvider((name) => `/assets/svg-icons/${name}.svg`)
    ]
}).catch((error) => console.error(error));
