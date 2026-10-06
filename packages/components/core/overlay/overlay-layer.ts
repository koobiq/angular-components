import { OverlayContainer, OverlayRef } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { Directive, inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { kbqInjectNativeElement } from '../utils';

const overlayLayerClass = 'kbq-overlay-layer';

/** Element an overlay is anchored to, or a getter read again on every attach of the overlay. */
export type KbqOverlayLayerOrigin = Element | (() => Element | null | undefined);

/** Places overlays into the layer of the {@link KbqOverlayLayer} element their origin is in. */
export interface KbqOverlayLayers {
    /**
     * Moves the overlay into the layer of the innermost `kbqOverlayLayer` element that contains `origin` and keeps it
     * there on every attach. An overlay whose origin is outside every such element stays in the application-wide
     * overlay container.
     */
    adopt(overlayRef: OverlayRef, origin: KbqOverlayLayerOrigin): void;
}

@Injectable({ providedIn: 'root' })
class KbqOverlayLayerRegistry implements KbqOverlayLayers {
    private readonly overlayContainer = inject(OverlayContainer);
    private readonly document = inject(DOCUMENT);
    private readonly isBrowser = inject(Platform).isBrowser;
    private readonly layers = new Set<KbqOverlayLayer>();
    private readonly adopted = new WeakSet<OverlayRef>();

    adopt(overlayRef: OverlayRef, origin: KbqOverlayLayerOrigin): void {
        if (!this.isBrowser || this.adopted.has(overlayRef)) {
            return;
        }

        this.adopted.add(overlayRef);

        const resolveOrigin = typeof origin === 'function' ? origin : () => origin;

        this.place(overlayRef, resolveOrigin());
        // Completes when the overlay is disposed.
        overlayRef.attachments().subscribe(() => this.place(overlayRef, resolveOrigin()));
    }

    register(layer: KbqOverlayLayer): void {
        this.layers.add(layer);
    }

    unregister(layer: KbqOverlayLayer): void {
        this.layers.delete(layer);
    }

    private place(overlayRef: OverlayRef, origin: Element | null | undefined): void {
        const host = overlayRef.hostElement;
        const parent = host?.parentElement;

        if (!parent) {
            return;
        }

        const isInLayer = parent.classList.contains(overlayLayerClass);

        if (!isInLayer && !this.layers.size) {
            return;
        }

        const root = this.overlayContainer.getContainerElement();

        // A host that another `OverlayContainer` resolved through a node injector is not ours to move.
        if (!isInLayer && parent !== root) {
            return;
        }

        const target = this.findLayer(origin)?.getContainerElement() ?? root;

        if (target === parent) {
            return;
        }

        const backdrop = overlayRef.backdropElement;

        // CDK keeps the backdrop right before its host.
        if (backdrop?.parentElement === parent) {
            target.appendChild(backdrop);
        }

        target.appendChild(host);
    }

    private findLayer(origin: Element | null | undefined): KbqOverlayLayer | null {
        if (!origin) {
            return null;
        }

        const overlayAncestor = origin.closest('.cdk-overlay-container');
        const fullscreenElement = this.document.fullscreenElement;
        let match: KbqOverlayLayer | null = null;

        for (const layer of this.layers) {
            const { host } = layer;

            if (!host.contains(origin)) {
                continue;
            }

            // Opened from an overlay that a scoped container renders inside the host: stays above that overlay.
            if (
                overlayAncestor &&
                !overlayAncestor.classList.contains(overlayLayerClass) &&
                host.contains(overlayAncestor)
            ) {
                continue;
            }

            // The layer would render outside the fullscreen element, so the panel would not be visible.
            if (fullscreenElement && !fullscreenElement.contains(host)) {
                continue;
            }

            if (!match || match.host.contains(host)) {
                match = layer;
            }
        }

        return match;
    }
}

/** Places overlays into the layer of the {@link KbqOverlayLayer} element their origin is in. */
export const KBQ_OVERLAY_LAYERS = new InjectionToken<KbqOverlayLayers>('KBQ_OVERLAY_LAYERS', {
    providedIn: 'root',
    factory: () => inject(KbqOverlayLayerRegistry)
});

/**
 * Renders the panels opened from inside the element into an overlay layer of its own, beneath a sticky `kbq-top-bar`
 * or `kbq-navbar`, so they slide under the bar while the content scrolls.
 *
 * Covers the panels of select, tree-select, timezone select, dropdown, popover, autocomplete, datepicker and inline
 * edit. Modals, sidepanels, toasts, tooltips and the panels opened from outside the element stay in the
 * application-wide overlay container above the bars. The layer's `z-index` is `--kbq-overlay-layer-z-index` (`980`).
 */
@Directive({
    selector: '[kbqOverlayLayer]'
})
export class KbqOverlayLayer implements OnDestroy {
    private readonly registry = inject(KbqOverlayLayerRegistry);
    private readonly document = inject(DOCUMENT);
    private container: HTMLElement | null = null;

    /** @internal */
    readonly host = kbqInjectNativeElement();

    constructor() {
        this.registry.register(this);
    }

    ngOnDestroy(): void {
        this.registry.unregister(this);
        this.container?.remove();
        this.container = null;
    }

    /**
     * @internal Created with the first panel, so an element that never opens one is left untouched. Lives inside the
     * host to share its stacking context with a bar rendered in the same scrolling viewport.
     */
    getContainerElement(): HTMLElement {
        if (!this.container) {
            this.container = this.document.createElement('div');
            this.container.classList.add('cdk-overlay-container', overlayLayerClass);
            this.host.appendChild(this.container);
        }

        return this.container;
    }
}
