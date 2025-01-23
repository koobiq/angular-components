import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject, Subscription } from 'rxjs';

/**
 * Reference to a actions panel opened via the KbqActionsPanel service.
 *
 * @see `KbqActionsPanel`
 */
export class KbqActionsPanelRef<I = unknown, R = unknown> {
    /** The instance of the component making up the content of the actions panel. */
    instance: I;

    /** Emits when the actions panel has been closed. */
    get closed(): Observable<R | undefined> {
        return this._closed.asObservable();
    }

    private readonly _closed = new Subject<R | undefined>();

    private readonly overlayRefDetachmentsSubscription: Subscription;

    constructor(private readonly overlayRef: OverlayRef) {
        this.overlayRef.addPanelClass('kbq-actions-panel-overlay');
        this.overlayRefDetachmentsSubscription = this.overlayRef.detachments().subscribe(() => this.close());
    }

    /** Closes the actions panel. */
    close(result?: R): void {
        this.overlayRefDetachmentsSubscription.unsubscribe();
        this.overlayRef.dispose();
        this._closed.next(result);
        this._closed.complete();
    }
}
