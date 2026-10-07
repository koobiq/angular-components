import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { DevApp } from './module';

bootstrapApplication(DevAllApp, {
    providers: [
        provideZonelessChangeDetection()
    ]
}).catch((error) => console.error(error));
