import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

export default <ApplicationConfig>{
    providers: [
        provideRouter([]),
        provideHttpClient(withFetch()),
        provideClientHydration(),
        provideAnimations()
    ]
};
