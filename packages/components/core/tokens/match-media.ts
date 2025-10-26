import { FactoryProvider, InjectionToken, ValueProvider } from '@angular/core';

/**
 * An abstraction over the `matchMedia` function.
 */
export const KBQ_MATCH_MEDIA = new InjectionToken<(query: string) => MediaQueryList>('[KBQ_MATCH_MEDIA]');

function matchMediaMock(query: string): MediaQueryList {
    return {
        matches: false,
        media: query,
        onchange: null,
        dispatchEvent: () => true,
        addListener: () => {},
        removeListener: () => {},
        removeEventListener: () => {},
        addEventListener: () => {}
    };
}

/**
 * KBQ_MATCH_MEDIA provider for browser.
 */
export const kbqMatchMediaBrowserProvider: FactoryProvider = {
    provide: KBQ_MATCH_MEDIA,
    // eslint-disable-next-line no-restricted-globals
    useFactory: () => matchMedia.bind(window)
};

/**
 * KBQ_MATCH_MEDIA provider for server.
 */
export const kbqMatchMediaServerProvider: ValueProvider = {
    provide: KBQ_MATCH_MEDIA,
    useValue: matchMediaMock
};
