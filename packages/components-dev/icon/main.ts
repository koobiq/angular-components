import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { kbqIconsResolverProvider } from '@koobiq/components/icon';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideHttpClient(),
        kbqIconsResolverProvider((name) => `/assets/svg-icons/${name}.svg`)
    ]
}).catch((error) => console.error(error));
