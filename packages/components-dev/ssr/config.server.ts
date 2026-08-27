import { mergeApplicationConfig, Provider } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { KBQ_WINDOW } from '@koobiq/components/core';
import config from './config';
import { devTimezoneServerProvider } from './timezone';

// TODO: Temporary workaround for an SSR issue in theme.service.ts. Remove it once the issue is fixed. (#DS-5064)
const provideServerWindow = (): Provider => {
    return {
        provide: KBQ_WINDOW,
        useFactory: () => {
            return {
                matchMedia: () => ({
                    addEventListener: () => {},
                    dispatchEvent: () => false,
                    removeEventListener: () => {},
                    matches: false,
                    media: '',
                    onchange: null,
                    addListener: () => {},
                    removeListener: () => {}
                })
            };
        }
    };
};

export default mergeApplicationConfig(config, {
    providers: [
        provideServerRendering(),
        devTimezoneServerProvider(),
        provideServerWindow()
    ]
});
