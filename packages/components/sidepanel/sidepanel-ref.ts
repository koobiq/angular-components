import { OverlayRef } from '@angular/cdk/overlay';
import { signal } from '@angular/core';
import { ESCAPE } from '@koobiq/cdk/keycodes';
import { isHtmlElement } from '@koobiq/components/core';
import { merge, Observable, Subject } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { KbqSidepanelAnimationState } from './sidepanel-animations';
import { KbqSidepanelConfig } from './sidepanel-config';
import { KbqSidepanelContainerComponent } from './sidepanel-container.component';

// Counter for unique sidepanel ids.
let uniqueId = 0;

export class KbqSidepanelRef<T = any, R = any> {
    readonly id: string;

    /**
     * Vertical scroll overflow state of the sidepanel body.
     * Updated on scroll and used for visual adjustments.
     */
    bodyOverflow = signal({ top: false, bottom: false });

    /** Instance of the component making up the content of the sidepanel. */
    instance: T;

    /** Subject for notifying the user that the sidepanel has been closed and dismissed. */
    private readonly afterClosed$ = new Subject<R | undefined>();

    /** Subject for notifying the user that the sidepanel starting closing. */
    private readonly beforeClosed$ = new Subject<void>();

    /** Subject for notifying the user that the sidepanel has opened and appeared. */
    private readonly afterOpened$ = new Subject<void>();

    /** Result to be passed down to the `afterDismissed` stream. */
    private result: R | undefined;

    constructor(
        public readonly containerInstance: KbqSidepanelContainerComponent,
        public readonly overlayRef: OverlayRef,
        public readonly config: KbqSidepanelConfig
    ) {
        this.id = this.config.id || `kbq-sidepanel-${uniqueId++}`;
        this.containerInstance.id = this.id;
        overlayRef.backdropElement?.classList?.add(config.backdropClass ?? 'kbq-overlay-dark-backdrop');

        const slideBelowStart = containerInstance.animationStateChanged.pipe(
            filter(
                (event) =>
                    event.phaseName === 'start' &&
                    [KbqSidepanelAnimationState.Lower, KbqSidepanelAnimationState.BottomPanel].includes(
                        event.toState as any
                    )
            )
        );

        // Act on close
        const beforeClosed = containerInstance.animationStateChanged.pipe(
            filter(({ phaseName, toState }) => phaseName === 'start' && toState === KbqSidepanelAnimationState.Hidden),
            take(1),
            tap(() => {
                this.beforeClosed$.next();
                this.beforeClosed$.complete();
            })
        );

        // Emit when opening animation completes
        containerInstance.animationStateChanged
            .pipe(
                filter((event) => event.phaseName === 'done' && event.toState === KbqSidepanelAnimationState.Visible),
                take(1)
            )
            .subscribe(() => {
                this.afterOpened$.next();
                this.afterOpened$.complete();
            });

        containerInstance.animationStateChanged
            .pipe(
                filter(
                    (event) =>
                        event.phaseName === 'start' && event.toState === KbqSidepanelAnimationState.BecomingNormal
                )
            )
            .subscribe(() => {
                if (overlayRef.backdropElement?.style) {
                    overlayRef.backdropElement.style.opacity = '1';
                }
            });

        merge(slideBelowStart, beforeClosed).subscribe(() => {
            if (overlayRef.backdropElement?.style) {
                overlayRef.backdropElement.style.opacity = '0';
            }
        });

        // Dispose overlay when closing animation is complete
        containerInstance.animationStateChanged
            .pipe(
                filter((event) => event.phaseName === 'done' && event.toState === KbqSidepanelAnimationState.Hidden),
                take(1)
            )
            .subscribe(() => {
                overlayRef.dispose();
                this.afterClosed$.next(this.result);
                this.afterClosed$.complete();
            });

        merge(
            overlayRef.backdropClick(),
            overlayRef.keydownEvents().pipe(
                // keyCode is deprecated, but IE11 and Edge don't support code property, which we need use instead
                filter((event) => event.keyCode === ESCAPE)
            ),
            this.containerInstance.indentClick(),
            overlayRef
                .outsidePointerEvents()
                .pipe(
                    filter((event) => isHtmlElement(event.target) && !!event.target.closest('.kbq-sidepanel-container'))
                )
        ).subscribe(() => {
            if (this.config.disableClose) return;

            this.close();
        });
    }

    close(result?: R): void {
        if (!this.afterClosed$.closed) {
            // Transition the backdrop in parallel to the sidepanel.
            this.containerInstance.animationStateChanged
                .pipe(
                    filter((event) => event.phaseName === 'done'),
                    take(1)
                )
                .subscribe(() => this.overlayRef.detachBackdrop());

            this.result = result;
            this.containerInstance.exit();
        }
    }

    /** Gets an observable that is notified when the sidepanel is started closing. */
    beforeClosed(): Observable<void> {
        return this.beforeClosed$.asObservable();
    }

    /** Gets an observable that is notified when the sidepanel is finished closing. */
    afterClosed(): Observable<R | undefined> {
        return this.afterClosed$.asObservable();
    }

    /** Gets an observable that is notified when the sidepanel has opened and appeared. */
    afterOpened(): Observable<void> {
        return this.afterOpened$.asObservable();
    }
}
