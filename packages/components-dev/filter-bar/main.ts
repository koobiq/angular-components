import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { kbqLocaleServiceProvider } from '@koobiq/components/core';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations(),
        kbqLocaleServiceProvider()
    ]
}).catch((error) => console.error(error));
