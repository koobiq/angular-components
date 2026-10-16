import { bootstrapApplication } from '@angular/platform-browser';
import { kbqLocaleServiceProvider } from '@koobiq/components/core';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        kbqLocaleServiceProvider()
    ]
}).catch((error) => console.error(error));
