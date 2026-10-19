import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { kbqIconsDictProvider, kbqIconsResolverProvider } from '@koobiq/components/icon';
import { DevApp } from './module';

bootstrapApplication(DevApp, {
    providers: [
        provideHttpClient(),
        // Registered before the catch-all resolver below, which answers to every name.
        kbqIconsDictProvider({
            'dict-chevron-down-s_16': '/assets/svg-icons/chevron-down-s_16.svg',
            'dict-plus_16': '/assets/svg-icons/plus_16.svg'
        }),
        kbqIconsResolverProvider((name) => `/assets/svg-icons/${name}.svg`)
    ]
}).catch((error) => console.error(error));
