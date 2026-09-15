import { DOCUMENT } from '@angular/common';
import { ApplicationConfig, ErrorHandler, inject, mergeApplicationConfig, Provider } from '@angular/core';
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
                },
                // The server document: the live examples render on the server, and some reach it through the
                // window, such as the file upload dropzone for its drag listeners.
                document: inject(DOCUMENT),
                // No-op / passthrough stubs for members a `KBQ_WINDOW` consumer might touch during
                // server render. Without these, reaching one would hit `undefined` and crash SSR.
                addEventListener: () => {},
                removeEventListener: () => {},
                getComputedStyle: () => ({ getPropertyValue: () => '' }) as unknown as CSSStyleDeclaration,
                setTimeout: ((handler: TimerHandler, timeout?: number) =>
                    globalThis.setTimeout(handler, timeout)) as unknown as Window['setTimeout']
            } satisfies Partial<Window>;
        }
    };
};

/**
 * Fails the prerender, and with it `docs:build`, on an error that Angular's default handler only logs: the page would
 * be published without the part that failed. The development server renders on the server as well and stops on such
 * an error too, which is intended: the bug shows up at once instead of hiding in the log.
 */
class SsrErrorHandler extends ErrorHandler {
    handleError(error: unknown): never {
        // Preserve default logging behavior, but fail the build.
        console.error(error);
        throw error instanceof Error ? error : new Error(String(error));
    }
}

const serverConfig: ApplicationConfig = {
    providers: [
        provideServerRendering(),
        provideServerWindow(),
        { provide: ErrorHandler, useClass: SsrErrorHandler }
    ]
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const config = mergeApplicationConfig(appConfig, serverConfig);
