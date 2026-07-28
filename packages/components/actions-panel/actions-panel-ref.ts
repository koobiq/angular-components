import { DialogRef } from '@angular/cdk/dialog';
import { OverlayRef } from '@angular/cdk/overlay';
import { filter, Observable, ReplaySubject, Subject, take } from 'rxjs';
import { KbqActionsPanelContainer } from './actions-panel-container';

/**
 * Reference to actions panel opened by `KbqActionsPanel` service.
 */
export class KbqActionsPanelRef<I = unknown, R = unknown> {
    /**
     * Instance of the component into which the actions panel content is projected.
     *
     * @docs-private
     */
    containerInstance: KbqActionsPanelContainer;

    private readonly afterOpenedSubject = new Subject<void>();
    private readonly beforeOpenedSubject = new ReplaySubject<void>(1);
    private readonly beforeClosedSubject = new Subject<R | undefined>();

    /** Emits when keydown events are targeted on the overlay. */
    readonly keydownEvents: Observable<KeyboardEvent> = this.dialogRef.keydownEvents;

    /** Emits when the actions panel starts opening, before its entrance animation plays. */
    readonly beforeOpened: Observable<void> = this.beforeOpenedSubject;

    /** Emits when the actions panel has opened and appeared. */
    readonly afterOpened: Observable<void> = this.afterOpenedSubject;

    /** Emits when the actions panel starts closing, before its exit animation plays. */
    readonly beforeClosed: Observable<R | undefined> = this.beforeClosedSubject;

    /** Emits when the actions panel is finished closing. */
    readonly afterClosed: Observable<R | undefined> = this.dialogRef.closed;

    /**
     * Overlay reference for the actions panel.
     *
     * @docs-private
     */
    readonly overlayRef: OverlayRef = this.dialogRef.overlayRef;

    /**
     * ID of the actions panel.
     *
     * @docs-private
     */
    readonly id: string = this.dialogRef.id;

    /** Result to be passed down to the `afterClosed` stream. */
    private result: R | undefined;

    /** Handle to the timeout that's running as a fallback in case the close animation doesn't fire. */
    private closeAnimationFallbackTimeout?: ReturnType<typeof setTimeout>;

    constructor(
        private readonly dialogRef: DialogRef<R, I>,
        containerInstance: KbqActionsPanelContainer
    ) {
        this.containerInstance = containerInstance;
        this.handleAnimation();
        this.handleOverlayDetachments();
    }

    /**
     * Opens the actions panel, playing its entrance animation.
     *
     * @docs-private
     */
    open(): void {
        if (!this.containerInstance) {
            return;
        }

        this.beforeOpenedSubject.next();
        this.beforeOpenedSubject.complete();
        this.containerInstance.startOpenAnimation();
    }

    /** Closes the actions panel. */
    close(result?: R): void {
        if (!this.containerInstance) {
            return;
        }

        this.containerInstance.animationStateChanged
            .pipe(
                filter((event) => event.phaseName === 'start'),
                take(1)
            )
            .subscribe(({ totalTime }) => {
                this.closeAnimationFallbackTimeout = setTimeout(
                    () => this.dialogRef.close(this.result),
                    totalTime + 100
                );
            });

        this.result = result;
        this.beforeClosedSubject.next(result);
        this.beforeClosedSubject.complete();
        this.containerInstance.startCloseAnimation();
        this.containerInstance = null!;
    }

    private handleAnimation(): void {
        this.containerInstance.animationStateChanged
            .pipe(
                filter((event) => event.phaseName === 'done' && event.toState === 'visible'),
                take(1)
            )
            .subscribe(() => {
                this.afterOpenedSubject.next();
                this.afterOpenedSubject.complete();
            });

        this.containerInstance.animationStateChanged
            .pipe(
                filter((event) => event.phaseName === 'done' && event.toState === 'hidden'),
                take(1)
            )
            .subscribe(() => {
                clearTimeout(this.closeAnimationFallbackTimeout);
                this.dialogRef.close(this.result);
            });
    }

    private handleOverlayDetachments(): void {
        this.dialogRef.overlayRef
            .detachments()
            .pipe(take(1))
            .subscribe(() => {
                this.dialogRef.close(this.result);
            });
    }
}
