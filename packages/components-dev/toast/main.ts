import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { kbqToastConfigurationProvider, KbqToastPosition } from '@koobiq/components/toast';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideZonelessChangeDetection(),
        kbqToastConfigurationProvider({
            position: KbqToastPosition.BOTTOM_RIGHT
        })
    ]
}).catch((error) => console.error(error));
