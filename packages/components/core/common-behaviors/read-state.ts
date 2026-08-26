import { ChangeDetectorRef, Directive, ElementRef, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Marks its host as read once the user has dwelled on it long enough, or has clicked it.
 *
 * Dwelling is tracked for pointer (`mouseenter`/`mouseleave`) and keyboard (`focusin`/`focusout`)
 * interaction alike, so the host becomes readable without a mouse. The two channels run
 * independently — the pointer can still rest on the host after focus has left, and the other way
 * round — so the dwell ends only once both of them have. `focusin`/`focusout` bubble, so focusing any
 * control inside the host counts as dwelling on the host itself, and moving focus between two of them
 * keeps the dwell running.
 */
@Directive({
    host: {
        '(mouseenter)': 'startDwell()',
        '(mouseleave)': 'endDwell()',
        '(focusin)': 'startDwell("focus")',
        '(focusout)': 'endDwell("focus", $event)',
        '(click)': 'read.next(true)'
    }
})
export class KbqReadStateDirective {
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /** Start of the earliest dwell still in progress, or `undefined` while the host is neither hovered nor focused. */
    get timestamp(): number | undefined {
        if (this.pointerStartedAt === undefined) return this.focusStartedAt;
        if (this.focusStartedAt === undefined) return this.pointerStartedAt;

        return Math.min(this.pointerStartedAt, this.focusStartedAt);
    }

    /** How long (ms) the user has to dwell on the host before it counts as read. */
    timeToRead: number = 500;

    readonly read = new BehaviorSubject<boolean>(false);

    private pointerStartedAt: number | undefined;
    private focusStartedAt: number | undefined;

    /** Starts measuring a dwell on one channel. Re-entering the same one keeps its earliest start. */
    startDwell(channel: 'pointer' | 'focus' = 'pointer') {
        if (channel === 'pointer') {
            this.pointerStartedAt ??= Date.now();
        } else {
            this.focusStartedAt ??= Date.now();
        }
    }

    /**
     * Ends the dwell on one channel and, once no channel is left dwelling, marks the host as read when
     * the whole dwell lasted longer than `timeToRead`.
     *
     * @param event the `focusout` that ended a focus dwell. Its `relatedTarget` is the element about to
     * receive focus: focus landing inside the host again is a move between the host's own controls, not
     * the user leaving.
     */
    endDwell(channel: 'pointer' | 'focus' = 'pointer', event?: FocusEvent) {
        if (channel === 'focus' && this.containsTarget(event?.relatedTarget)) {
            return;
        }

        const startedAt = this.timestamp;

        if (channel === 'pointer') {
            this.pointerStartedAt = undefined;
        } else {
            this.focusStartedAt = undefined;
        }

        // The other channel is still dwelling, so the user has not left the host yet.
        if (this.timestamp !== undefined) {
            return;
        }

        if (startedAt !== undefined && Date.now() - startedAt > this.timeToRead) {
            this.read.next(true);
        }

        this.changeDetectorRef.markForCheck();
    }

    private containsTarget(target: EventTarget | null | undefined): boolean {
        return !!target && this.elementRef.nativeElement.contains(target as Node);
    }
}
