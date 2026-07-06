import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

/**
 * SSR-safe wrapper for DOM geometry APIs.
 * Returns `null` in non-browser environments instead of throwing.
 * @docs-private
 */
@Injectable({ providedIn: 'root' })
export class KbqGeometryService {
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    kbqGetBoundingClientRect(element: Element | null | undefined): DOMRect | null {
        if (!this.isBrowser || !element) return null;

        // eslint-disable-next-line no-restricted-properties
        return element.getBoundingClientRect();
    }

    kbqGetClientRects(element: Element | null | undefined): DOMRectList | null {
        if (!this.isBrowser || !element) return null;

        // eslint-disable-next-line no-restricted-properties
        return element.getClientRects();
    }
}
