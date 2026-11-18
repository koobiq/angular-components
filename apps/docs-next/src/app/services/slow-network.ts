import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, Injectable, isDevMode } from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { map, mergeMap, of, timer } from 'rxjs';

interface DocsNextSlowProfile {
    label: string;
    /** Wait before the first byte, in milliseconds. */
    latency: number;
    bytesPerSecond: number;
}

/**
 * `3g` is the "Regular 3G" of the developer tools of Chrome (750 kbit/s), `fast3g` and `slow3g` are their "Fast 3G" and
 * "Slow 3G"; `2g` is slower than any of them.
 */
const PROFILES: Record<string, DocsNextSlowProfile> = {
    fast3g: { label: 'Fast 3G', latency: 150, bytesPerSecond: 200_000 },
    '3g': { label: '3G', latency: 100, bytesPerSecond: 94_000 },
    slow3g: { label: 'Slow 3G', latency: 400, bytesPerSecond: 50_000 },
    '2g': { label: '2G', latency: 2000, bytesPerSecond: 12_000 }
};

/** What a lazy chunk of a page weighs, since the size of a dynamic import is not known in the browser. */
const CHUNK_BYTES = 30_000;

const STORAGE_KEY = 'docs-next-slow';

/**
 * Slows the data of the site down to try the loading states: `?slow=` with `fast3g`, `3g`, `slow3g` or `2g` in the
 * address the site opens with, and `?slow=off` to turn it off (a development build only). The choice is kept for the
 * tab, so a reload does not lose it, and a badge on the page says that it is on. It delays the content of the pages and
 * the lazy chunks of the routes; the first bundle, the fonts and the images stay as they are, for those use "Slow 3G"
 * in the browser's developer tools.
 */
@Injectable({ providedIn: 'root' })
export class DocsNextSlowNetwork {
    private readonly window = inject(KBQ_WINDOW);
    private readonly profile: DocsNextSlowProfile | null = isDevMode() ? this.readProfile() : null;

    /** The name of the profile in use, such as "Slow 3G", or `null` when the network is not slowed down. */
    readonly label = this.profile?.label ?? null;

    /** The time a download of `bytes` takes, or 0 when the network is not slowed down. */
    delayFor(bytes: number): number {
        return this.profile ? this.profile.latency + (bytes / this.profile.bytesPerSecond) * 1000 : 0;
    }

    /** Turns the slowing down off and reloads the page without it. */
    turnOff(): void {
        this.write(null);
        this.window.location.reload();
    }

    // Read once: the parameter is gone from the address after the first navigation.
    private readProfile(): DocsNextSlowProfile | null {
        const requested = new URLSearchParams(this.window.location.search).get('slow');

        if (requested === 'off') {
            this.write(null);

            return null;
        }

        if (requested && PROFILES[requested]) {
            this.write(requested);

            return PROFILES[requested];
        }

        try {
            return PROFILES[this.window.sessionStorage.getItem(STORAGE_KEY) ?? ''] ?? null;
        } catch {
            return null;
        }
    }

    private write(name: string | null): void {
        try {
            if (name) {
                this.window.sessionStorage.setItem(STORAGE_KEY, name);
            } else {
                this.window.sessionStorage.removeItem(STORAGE_KEY);
            }
        } catch {
            // The storage may be blocked; the profile then lasts until the page is reloaded.
        }
    }
}

/** `loadComponent` of a route that takes the time of a lazy chunk on a slowed down network. */
export const docsNextLazy =
    <T>(load: () => Promise<T>): (() => Promise<T>) =>
    () => {
        const delay = inject(DocsNextSlowNetwork).delayFor(CHUNK_BYTES);

        return delay ? new Promise<void>((resolve) => setTimeout(resolve, delay)).then(load) : load();
    };

export const docsNextSlowNetworkInterceptor: HttpInterceptorFn = (request, next) => {
    const slow = inject(DocsNextSlowNetwork);

    return next(request).pipe(
        mergeMap((event) => {
            if (!(event instanceof HttpResponse) || !request.url.startsWith('/content/')) return of(event);

            const delay = slow.delayFor(JSON.stringify(event.body ?? '').length);

            return delay ? timer(delay).pipe(map(() => event)) : of(event);
        })
    );
};
