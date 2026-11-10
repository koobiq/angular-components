import { ChangeDetectionStrategy, Component, Signal, signal, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqHint } from './hint';

/** Error text to be shown below the form field control. It keeps the error color under a disabled control too. */
@Component({
    selector: 'kbq-error',
    templateUrl: './hint.html',
    styleUrls: [
        './hint.scss',
        './hint-tokens.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-error',
        // The form field mounts the error only while the control is invalid, so the element itself has to be
        // the live region: screen readers announce a node inserted with `role="alert"`, while an `aria-live`
        // wrapper has to be in the accessibility tree before its content changes.
        role: 'alert',
        'aria-atomic': 'true'
    },
    exportAs: 'kbqError'
})
export class KbqError extends KbqHint {
    /**
     * An error is never shown as disabled, even under a disabled control: it is the one text under a control that the
     * user has to read.
     *
     * @docs-private
     */
    protected override readonly isDisabled: Signal<boolean> = signal(false);

    constructor() {
        super();

        this.setDefaultColor(KbqComponentColors.Error);
    }
}
