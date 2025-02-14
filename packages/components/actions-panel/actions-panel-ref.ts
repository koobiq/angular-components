import { DialogRef } from '@angular/cdk/dialog';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { filter, Observable, Subject, take } from 'rxjs';
import { KbqActionsPanelConfig } from './actions-panel-config';
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

    /** Gets an observable that is notified when the actions panel is finished closing. */
    get afterClosed(): Observable<R | undefined> {
        return this.dialogRef.closed;
    }

    /** Gets an observable that emits when keydown events are targeted on the overlay. */
    get keydownEvents(): Observable<KeyboardEvent> {
        return this.dialogRef.keydownEvents;
    }

    /** Gets an observable that is notified when the actions panel has opened and appeared. */
    get afterOpened(): Observable<void> {
        return this._afterOpened;
    }

    readonly disableClose: boolean | undefined;

    private readonly _afterOpened = new Subject<void>();

    /** Result to be passed down to the `afterClosed` stream. */
    private result: R | undefined;

    /** Handle to the timeout that's running as a fallback in case the close animation doesn't fire. */
    private closeAnimationFallbackTimeout: ReturnType<typeof setTimeout>;

    constructor(
        private readonly dialogRef: DialogRef<R, I>,
        private readonly config: KbqActionsPanelConfig,
        containerInstance: KbqActionsPanelContainer
    ) {
        this.containerInstance = containerInstance;
        this.disableClose = this.config.disableClose;
        this.handleAnimation();
        this.handleOverlayDetachments();
        this.handleKeydown();
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
                this._afterOpened.next();
                this._afterOpened.complete();
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

    private handleKeydown(): void {
        this.keydownEvents
            .pipe(
                filter((event) => event.keyCode === ESCAPE),
                take(1)
            )
            .subscribe((event) => {
                if (!this.disableClose && (event.type !== 'keydown' || !hasModifierKey(event))) {
                    event.preventDefault();
                    this.close();
                }
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
