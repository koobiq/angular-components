import { ApplicationConfig, mergeApplicationConfig, Provider } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { appConfig } from './app/config';

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
                }),
                localStorage: {
                    length: 0,
                    getItem: () => null,
                    setItem: () => {},
                    removeItem: () => {},
                    clear: () => {},
                    key: () => null
                },
                location: {
                    host: '',
                    protocol: '',
                    ancestorOrigins: {} as DOMStringList,
                    hash: '',
                    hostname: '',
                    href: '',
                    origin: '',
                    pathname: '/',
                    port: '',
                    search: '',
                    assign: () => {},
                    reload: () => {},
                    replace: () => {}
                }
            } satisfies Partial<Window>;
        }
    };
};

const serverConfig: ApplicationConfig = {
    providers: [
        provideServerRendering(),
        provideServerWindow()
    ]
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const config = mergeApplicationConfig(appConfig, serverConfig);
