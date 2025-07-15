import { bootstrapApplication, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router';
import { DevApp } from './module';

export default () =>
    bootstrapApplication(DevApp, {
        providers: [
            provideClientHydration(withEventReplay()),
            provideRouter([]),
            provideServerRendering()
        ]
    });
