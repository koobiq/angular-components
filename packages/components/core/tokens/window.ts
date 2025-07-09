import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';

/**
 * An abstraction over the global `window` object.
 */
export const KBQ_WINDOW = new InjectionToken<Window>('[KBQ_WINDOW]', {
    factory: (): Window => {
        const _window =
            inject(DOCUMENT).defaultView ||
            // Backward compatibility for older Angular versions
            // https://github.com/angular/universal/blob/main/docs/gotchas.md#strategy-3-shims
            // eslint-disable-next-line no-restricted-globals
            window;

        if (!_window) {
            throw new Error('[KBQ_WINDOW] window is not available.');
        }

        return _window;
    }
});
