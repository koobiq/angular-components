import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule, kbqLocaleServiceProvider } from '@koobiq/components/core';
import { DevAllApp } from './module';
import { devAllRoutes } from './routes';

bootstrapApplication(DevAllApp, {
    providers: [
        provideZonelessChangeDetection(),
        provideAnimations()
    ]
}).catch((error) => console.error(error));
