import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideZonelessChangeDetection()
    ]
}).catch((error) => console.error(error));
