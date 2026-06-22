import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, ElementRef, Injectable, InjectionToken, Provider, inject } from '@angular/core';

/**
 * Reference to the element used to locate the shadow root that should host the CDK overlay container.
 *
 * It can be the shadow host element itself (the common case — the MFE root element) or any element that already
 * lives inside the shadow tree. Provide it directly, as an `ElementRef`, or as a getter (useful when the element is
 * created after the providers are declared, e.g. resolved lazily at bootstrap).
 */
export type KbqShadowDomOverlayHost = HTMLElement | ElementRef<HTMLElement> | (() => Element | null | undefined);

/**
 * Element used by {@link KbqShadowDomOverlayContainer} to locate the shadow root that should host overlays.
 *
 * When not provided, the container falls back to the application root component element.
 */
export const KBQ_SHADOW_DOM_OVERLAY_HOST = new InjectionToken<KbqShadowDomOverlayHost>('KBQ_SHADOW_DOM_OVERLAY_HOST');

/** Marks the structural overlay stylesheet that {@link KbqShadowDomOverlayContainer} clones into a shadow root. */
const overlayStructuralStylesAttribute = 'data-kbq-overlay-structural-styles';

/**
 * `OverlayContainer` that places the `.cdk-overlay-container` inside a shadow root instead of `document.body`.
 *
 * The default CDK `OverlayContainer` always appends its container to `document.body`. When the application is
 * rendered inside a shadow root (e.g. a Module Federation micro-frontend), overlays — toasts, modals, dropdowns,
 * tooltips, etc. — escape the shadow tree into the light DOM. There they lose access to the styles and theme tokens
 * scoped to the shadow root (Koobiq theme tokens are defined on the `.kbq-light` / `.kbq-dark` ancestor), which
 * results in unstyled overlays.
 *
 * This container resolves the target shadow root from {@link KBQ_SHADOW_DOM_OVERLAY_HOST} (or the root component when
 * the token is absent) and relocates the overlay container into it. After relocating, it also clones CDK's own
 * structural overlay stylesheet (`position`/`z-index`/backdrop, `.cdk-overlay-container:empty`) into the shadow root,
 * since those `document.head` styles do not cross the shadow boundary. If no shadow root is found — the common case
 * for an app rendered directly in the light DOM — the container is left on `document.body`, so it is safe to provide
 * unconditionally.
 *
 * Only **open** shadow roots can be resolved: a closed shadow root exposes neither `Element.shadowRoot` nor a
 * `ShadowRoot` from `getRootNode()`, so pass an element that already lives inside the closed tree if you must use one.
 *
 * Note: this fixes the overlay container *placement* and delivers the CDK structural overlay styles. The host
 * application is still responsible for delivering the **Koobiq component/theme styles** (the `.kbq-light` / `.kbq-dark`
 * tokens and component CSS) into the shadow root, since global `document.head` stylesheets do not cascade across a
 * shadow boundary.
 *
 * @see kbqShadowDomOverlayProvider
 */
@Injectable()
export class KbqShadowDomOverlayContainer extends OverlayContainer {
    private readonly host = inject(KBQ_SHADOW_DOM_OVERLAY_HOST, { optional: true });
    private readonly applicationRef = inject(ApplicationRef);

    /** @internal CDK lifecycle hook — overridden to relocate the container into a shadow root. */
    protected override _createContainer(): void {
        // Let CDK create the container (and run its test-environment cleanup). It is appended to `document.body`.
        super._createContainer();

        const shadowRoot = this.resolveShadowRoot();

        if (shadowRoot) {
            // Relocate the container into the shadow root and deliver the structural overlay styles alongside it.
            shadowRoot.appendChild(this._containerElement);
            this.deliverStructuralStyles(shadowRoot);
        } else if (this.host != null) {
            // An explicit host was provided but did not resolve to an open shadow root (wrong element, a closed
            // shadow root, or an element not yet inside a shadow tree). The container stays on `document.body`, so
            // overlays would render unstyled — warn instead of failing silently.
            // eslint-disable-next-line no-console
            console.warn(
                '[KbqShadowDomOverlayContainer] The provided host did not resolve to an open shadow root; the ' +
                    'overlay container stays on document.body. Ensure the host element (or an element inside its ' +
                    'shadow tree) uses an open shadow root.'
            );
        }
    }

    /**
     * Clones CDK's structural overlay stylesheet into the shadow root.
     *
     * CDK ships the overlay's structural CSS as a `ViewEncapsulation.None` component, so Angular injects it as a
     * `<style>` in `document.head` synchronously — `OverlayContainer.getContainerElement()` loads it before
     * `_createContainer()` runs. Those rules do not cross the shadow boundary, so a relocated container would
     * otherwise be unpositioned. Cloning the already-injected stylesheet keeps it version-matched to the installed
     * `@angular/cdk` and is idempotent.
     */
    private deliverStructuralStyles(shadowRoot: ShadowRoot): void {
        if (shadowRoot.querySelector(`style[${overlayStructuralStylesAttribute}]`)) {
            return;
        }

        const sourceStyle = Array.from(this._document.head.querySelectorAll('style')).find((style) =>
            style.textContent?.includes('.cdk-overlay-pane')
        );

        if (sourceStyle) {
            const clone = sourceStyle.cloneNode(true) as HTMLStyleElement;

            clone.setAttribute(overlayStructuralStylesAttribute, '');
            shadowRoot.appendChild(clone);
        }
    }

    private resolveShadowRoot(): ShadowRoot | null {
        const element = this.resolveHostElement();

        if (!element) {
            return null;
        }

        // The host can be the shadow host itself (the common case — the MFE root element)...
        const ownShadowRoot = element.shadowRoot;

        if (ownShadowRoot) {
            return ownShadowRoot;
        }

        // ...or an element that already lives inside the shadow tree.
        const rootNode = element.getRootNode();

        return typeof ShadowRoot !== 'undefined' && rootNode instanceof ShadowRoot ? rootNode : null;
    }

    private resolveHostElement(): Element | null {
        if (this.host) {
            const resolved = typeof this.host === 'function' ? this.host() : this.host;

            if (resolved instanceof ElementRef) {
                return resolved.nativeElement;
            }

            return resolved ?? null;
        }

        // No explicit host provided — fall back to the application root component element.
        return this.applicationRef.components[0]?.location.nativeElement ?? null;
    }
}

/**
 * Providers that route all CDK overlays into a shadow root via {@link KbqShadowDomOverlayContainer}.
 *
 * Add it to the bootstrap providers of an application rendered inside a shadow root:
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *     providers: [kbqShadowDomOverlayProvider(() => document.querySelector('my-mfe-root')!)]
 * });
 * ```
 *
 * The provider replaces the global `OverlayContainer` token, so it cannot be combined with another custom
 * `OverlayContainer` (e.g. CDK's `FullscreenOverlayContainer`) — the last provider wins. Apps that need both must
 * subclass `KbqShadowDomOverlayContainer`.
 *
 * @param host element (or getter / `ElementRef`) inside the target shadow tree. When omitted, the application root
 * component element is used to resolve the shadow root.
 */
export const kbqShadowDomOverlayProvider = (host?: KbqShadowDomOverlayHost): Provider[] => {
    const providers: Provider[] = [{ provide: OverlayContainer, useClass: KbqShadowDomOverlayContainer }];

    if (host !== undefined) {
        providers.push({ provide: KBQ_SHADOW_DOM_OVERLAY_HOST, useValue: host });
    }

    return providers;
};
