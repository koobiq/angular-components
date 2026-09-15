import { OverlayContainer } from '@angular/cdk/overlay';
import { ElementRef, inject, Injectable, InjectionToken } from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';

/**
 * Element that {@link KbqActionsPanelScopedOverlayContainer} renders overlays into.
 *
 * @docs-private
 */
export const KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_HOST = new InjectionToken<ElementRef<HTMLElement>>(
    'KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_HOST'
);

/**
 * Class of the wrapper that {@link KbqActionsPanelScopedOverlayContainer} adds to the host.
 *
 * @docs-private
 */
export const KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_CONTAINER_SELECTOR = 'kbq-actions-panel-scoped-overlay-container';

/**
 * Hosts currently promoted to a containing block, with the inline `position` to put back and the number of containers
 * relying on the promotion.
 *
 * The promotion belongs to the host rather than to a container: several containers share one host whenever panels
 * overlap — replacing an open panel creates the new overlay before the old one finishes closing — and the first
 * to be destroyed must not restore a `position` the others still need.
 */
const promotedHosts = new WeakMap<HTMLElement, { inlinePosition: string; containers: number }>();

/**
 * `OverlayContainer` that renders overlays inside {@link KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_HOST} instead of
 * `document.body`.
 *
 * CDK resolves the overlay host from the `OverlayContainer` available in DI, and there is exactly one of those per
 * application. Providing this container in a child injector — together with a `Dialog` of its own — is what makes a
 * single overlay render inside a specific element while the rest of the application keeps using the global container.
 *
 * The container is scoped to one host and is not reusable: it is expected to be created and destroyed alongside the
 * overlay it hosts.
 *
 * @docs-private
 */
@Injectable()
export class KbqActionsPanelScopedOverlayContainer extends OverlayContainer {
    private readonly host = inject(KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_HOST).nativeElement;
    private readonly window = inject(KBQ_WINDOW);

    /** Wrapper that isolates the container from the host's own content. */
    private wrapperElement: HTMLElement | null = null;

    /** Whether this container holds a share of the host's promotion to a containing block. */
    private holdsHostPromotion = false;

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.wrapperElement?.remove();
        this.wrapperElement = null;

        this.releaseHostPromotion();
    }

    /**
     * Deliberately does not call `super`: CDK's implementation marks the container with a `platform` attribute and
     * removes every other container carrying one, which is bookkeeping for the single application-wide container. A
     * scoped container is not that container, and joining the scheme would make it delete — and be deleted by — the
     * global one as soon as both exist.
     */
    protected override _createContainer(): void {
        const wrapper = this._document.createElement('div');

        wrapper.classList.add(KBQ_ACTIONS_PANEL_SCOPED_OVERLAY_CONTAINER_SELECTOR);
        wrapper.style.position = 'absolute';
        wrapper.style.inset = '0';
        wrapper.style.pointerEvents = 'none';

        const container = this._document.createElement('div');

        container.classList.add('cdk-overlay-container');
        // CDK styles `.cdk-overlay-container` as a viewport-sized `position: fixed` layer. A scoped container has to
        // cover the host instead; the remaining CDK rules (`top`/`left`/`width`/`height`) already do the right thing
        // once the element is out of the fixed positioning context.
        container.style.position = 'absolute';

        // The container gets a wrapper of its own rather than being appended to the host directly, because CDK's
        // `Dialog` marks every sibling of the overlay container with `aria-hidden` while a dialog is open. Inside the
        // host those siblings are the very content the actions panel acts on, so the container is kept as an only
        // child and there is nothing left for CDK to hide.
        wrapper.appendChild(container);

        this.promoteHostToContainingBlock();
        this.host.appendChild(wrapper);

        this.wrapperElement = wrapper;
        this._containerElement = container;
    }

    /**
     * The wrapper is absolutely positioned, so it resolves against the nearest positioned ancestor. A `static` host
     * would let the overlay land on some outer element instead, so it is promoted to `relative`; a host that is
     * already positioned is left untouched.
     */
    private promoteHostToContainingBlock(): void {
        if (!this._platform.isBrowser) {
            return;
        }

        const promotion = promotedHosts.get(this.host);

        if (promotion) {
            promotion.containers++;
            this.holdsHostPromotion = true;

            return;
        }

        // A host that is not in the document yet reports no position at all (`getComputedStyle` returns an empty
        // declaration), and is treated as `static`: promoting one that turns out to be positioned is harmless,
        // leaving a `static` one alone is not.
        const { position } = this.window.getComputedStyle(this.host);

        if (position && position !== 'static') {
            return;
        }

        promotedHosts.set(this.host, { inlinePosition: this.host.style.position, containers: 1 });
        this.host.style.position = 'relative';
        this.holdsHostPromotion = true;
    }

    /** Gives the host its own `position` back once no scoped container depends on the promotion any more. */
    private releaseHostPromotion(): void {
        if (!this.holdsHostPromotion) {
            return;
        }

        this.holdsHostPromotion = false;

        const promotion = promotedHosts.get(this.host)!;

        if (--promotion.containers > 0) {
            return;
        }

        promotedHosts.delete(this.host);
        this.host.style.position = promotion.inlinePosition;
    }
}
