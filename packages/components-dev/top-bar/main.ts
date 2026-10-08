import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { kbqLocaleServiceProvider } from '@koobiq/components/core';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideZonelessChangeDetection(),
        kbqLocaleServiceProvider(),
        provideRouter([])
    ]
}).catch((error) => console.error(error));
