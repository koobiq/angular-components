import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
    EnvironmentProviders,
    inject,
    makeStateKey,
    PLATFORM_ID,
    provideAppInitializer,
    Provider,
    REQUEST,
    TransferState
} from '@angular/core';
import { KBQ_DATE_TIMEZONE, KbqTimezoneLike } from '@koobiq/components/core';

const TIMEZONE_COOKIE = 'kbq-dev-timezone';
const TIMEZONE_KEY = makeStateKey<KbqTimezoneLike>('kbqDevTimezone');

/** Used until the browser has reported its own zone, and whenever the cookie is missing. */
const FALLBACK_TIMEZONE = 'utc';

const readCookie = (cookies: string | null | undefined, name: string): string | undefined =>
    cookies
        ?.split(';')
        .map((cookie) => cookie.trim().split('='))
        .find(([key]) => key === name)?.[1];

/**
 * Resolves the time zone once, on the server, and hands the very same value to the browser through
 * `TransferState`: both render identical dates, so hydration changes nothing on screen.
 */
export const devTimezoneServerProvider = (): Provider => ({
    provide: KBQ_DATE_TIMEZONE,
    useFactory: () => {
        const cookies = inject(REQUEST, { optional: true })?.headers.get('cookie');
        const timezone = readCookie(cookies, TIMEZONE_COOKIE) ?? FALLBACK_TIMEZONE;

        inject(TransferState).set(TIMEZONE_KEY, timezone);

        return timezone;
    }
});

export const devTimezoneBrowserProviders = (): (Provider | EnvironmentProviders)[] => [
    {
        provide: KBQ_DATE_TIMEZONE,
        useFactory: () => inject(TransferState).get(TIMEZONE_KEY, FALLBACK_TIMEZONE)
    },
    // Records the real zone of the browser for the next request. It is deliberately not applied to this
    // render: doing so would re-render every date on the page, which is the flicker this setup avoids.
    provideAppInitializer(() => {
        // `mergeApplicationConfig` carries these providers into the server config too, where `document.cookie`
        // is not implemented.
        if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

        const document = inject(DOCUMENT);
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (readCookie(document.cookie, TIMEZONE_COOKIE) !== browserTimezone) {
            document.cookie = `${TIMEZONE_COOKIE}=${browserTimezone};path=/;max-age=31536000`;
        }
    })
];
