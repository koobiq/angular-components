import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';

/**
 * An abstraction over the global `window` object.
 */
export const KBQ_WINDOW = new InjectionToken<Window>('[KBQ_WINDOW]', {
    factory: (): Window => {
        const _window =
            inject(DOCUMENT).defaultView ||
            // A detached document (built by `DOMImplementation` or parsed by `DOMParser`) has no view of its own.
            // eslint-disable-next-line no-restricted-globals
            window;

        if (!_window) {
            throw new Error('[KBQ_WINDOW] window is not available.');
        }

        return _window;
    }
});
