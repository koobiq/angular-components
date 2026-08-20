import { ChangeDetectorRef, Directive, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Marks its host as read once the user has dwelled on it long enough, or has clicked it.
 *
 * Dwelling is tracked for pointer (`mouseenter`/`mouseleave`) and keyboard (`focusin`/`focusout`)
 * interaction alike, so the host becomes readable without a mouse. Both events bubble, so focusing any
 * control inside the host counts as dwelling on the host itself. Leaving through either channel ends
 * the dwell.
 */
@Directive({
    host: {
        '(mouseenter)': 'startDwell()',
        '(mouseleave)': 'endDwell()',
        '(focusin)': 'startDwell()',
        '(focusout)': 'endDwell()',
        '(click)': 'read.next(true)'
    }
})
export class KbqReadStateDirective {
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    /** Start of the current dwell, or `undefined` while the host is neither hovered nor focused. */
    timestamp: number | undefined;

    /** How long (ms) the user has to dwell on the host before it counts as read. */
    timeToRead: number = 500;

    readonly read = new BehaviorSubject<boolean>(false);

    /** Starts measuring a dwell. Re-entering while already dwelling keeps the earliest start. */
    startDwell() {
        this.timestamp ??= Date.now();
    }

    /** Ends the current dwell and marks the host as read when it lasted longer than `timeToRead`. */
    endDwell() {
        const startedAt = this.timestamp;

        this.timestamp = undefined;

        if (startedAt !== undefined && Date.now() - startedAt > this.timeToRead) {
            this.read.next(true);
        }

        this.changeDetectorRef.markForCheck();
    }
}
