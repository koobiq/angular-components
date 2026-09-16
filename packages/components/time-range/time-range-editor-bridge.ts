import { Injectable } from '@angular/core';

/**
 * Channel between the popover footer, which `KbqTimeRange` owns, and the editor rendered inside the
 * popover. Provided by `KbqTimeRange`, so there is exactly one instance per component.
 *
 * @docs-private
 */
@Injectable()
export class KbqTimeRangeEditorBridge {
    /**
     * Raised while a pointer is held down on the footer. `focusout` on its own cannot tell "the user is
     * pressing apply" apart from "the user clicked a blank spot": Safari does not move focus onto a
     * `<button>` when it is clicked, so both arrive with a `null` `relatedTarget`.
     */
    applyGestureInProgress = false;

    /**
     * Registered by the editor. Reveals the errors of both borders and moves focus to the first field
     * carrying one; returns whether the editor is free of errors.
     */
    revealErrors: () => boolean = () => true;
}
