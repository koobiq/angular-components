import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideZoneChangeDetection(),
        provideAnimations()
    ]
}).catch((error) => console.error(error));
