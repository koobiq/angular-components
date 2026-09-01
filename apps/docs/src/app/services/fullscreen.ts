import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, inject, Injectable, NgZone, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

/**
 * Single source of truth for the Fullscreen API in the docs app.
 *
 * An examples page renders one live-example viewer per `<!-- example(...) -->` marker (~29 of them on
 * `/components/select/examples`), so probing the capability and subscribing to `fullscreenchange` per
 * viewer would multiply an app-global fact by the number of viewers. Consumers derive their own state
 * from `element` with a `computed()`.
 */
@Injectable({ providedIn: 'root' })
export class DocsFullscreenService {
    private readonly document = inject(DOCUMENT);
    private readonly ngZone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);

    private readonly availableState = signal(false);
    private readonly elementState = signal<Element | null>(null);

    /** Whether an element is allowed to request fullscreen. Stays `false` on the server. */
    readonly available = this.availableState.asReadonly();

    /** Element currently displayed fullscreen, or `null` when the document is not in fullscreen. */
    readonly element = this.elementState.asReadonly();

    constructor() {
        // Deferred to the first client render: resolving the capability during SSR would put controls
        // into markup the server cannot produce, and hydration would then fail on the extra nodes.
        afterNextRender(() => {
            this.availableState.set(
                Boolean(this.document.fullscreenEnabled && this.document.documentElement.requestFullscreen)
            );
            this.elementState.set(this.document.fullscreenElement);

            this.ngZone.runOutsideAngular(() => {
                fromEvent(this.document, 'fullscreenchange')
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe(() => this.elementState.set(this.document.fullscreenElement));
            });
        });
    }

    /** Puts `element` into fullscreen, or leaves fullscreen when it already is the fullscreen element. */
    async toggle(element: HTMLElement): Promise<void> {
        try {
            if (this.document.fullscreenElement === element) {
                await this.document.exitFullscreen();
            } else {
                await element.requestFullscreen();
            }
        } catch (error) {
            console.error('Could not toggle fullscreen mode', error);
        }
    }
}
