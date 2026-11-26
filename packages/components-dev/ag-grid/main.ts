import { bootstrapApplication } from '@angular/platform-browser';
import { kbqLocaleIDProvider, kbqLocaleServiceProvider } from '@koobiq/components/core';
import { DevApp } from './module';

bootstrapApplication(DevApp, { providers: [kbqLocaleIDProvider('en-US'), kbqLocaleServiceProvider()] }).catch((error) =>
    console.error(error)
);
