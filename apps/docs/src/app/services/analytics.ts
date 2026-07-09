import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
    EnvironmentProviders,
    inject,
    makeEnvironmentProviders,
    PLATFORM_ID,
    provideAppInitializer
} from '@angular/core';

const YANDEX_METRIKA_ID = 106476768;
const YANDEX_METRIKA_SRC = 'https://mc.yandex.ru/metrika/tag.js';

type YandexMetrikaFn = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };

declare global {
    interface Window {
        ym?: YandexMetrikaFn;
    }
}

/**
 * Loads the Yandex.Metrika counter from Angular instead of an inline `<script>` in `index.html`.
 * Keeping it out of the markup makes a strict `script-src` CSP feasible and lets the tracker be
 * loaded conditionally: it runs in the browser only and honors the Do Not Track signal.
 */
export function docsProvideAnalytics(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideAppInitializer(() => {
            const platformId = inject(PLATFORM_ID);
            const document = inject(DOCUMENT);

            if (!isPlatformBrowser(platformId)) {
                return;
            }

            const window = document.defaultView as (Window & typeof globalThis) | null;

            if (!window || isDoNotTrackEnabled(window)) {
                return;
            }

            initYandexMetrika(window, document);
        })
    ]);
}

function isDoNotTrackEnabled(window: Window): boolean {
    return window.navigator?.doNotTrack === '1';
}

function initYandexMetrika(window: Window, document: Document): void {
    window.ym =
        window.ym ||
        function (this: YandexMetrikaFn, ...args: unknown[]) {
            (window.ym!.a = window.ym!.a || []).push(args);
        };

    window.ym.l = Date.now();

    const alreadyInjected = Array.from(document.scripts).some((script) => script.src === YANDEX_METRIKA_SRC);

    if (!alreadyInjected) {
        const script = document.createElement('script');

        script.async = true;
        script.src = YANDEX_METRIKA_SRC;
        document.head.appendChild(script);
    }

    window.ym(YANDEX_METRIKA_ID, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
    });
}
