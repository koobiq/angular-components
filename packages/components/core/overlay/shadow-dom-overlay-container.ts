import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, ElementRef, Injectable, InjectionToken, Provider, inject } from '@angular/core';

/**
 * Reference to the element used to locate the shadow root that should host the CDK overlay container.
 *
 * It can be the shadow host element itself (the common case — the MFE root element) or any element that already
 * lives inside the shadow tree. Provide it directly, as an `ElementRef`, or as a getter (useful when the element is
 * created after the providers are declared, e.g. resolved lazily at bootstrap).
 */
export type KbqShadowDomOverlayHost = HTMLElement | ElementRef<HTMLElement> | (() => Node | null | undefined);

/**
 * Element used by {@link KbqShadowDomOverlayContainer} to locate the shadow root that should host overlays.
 *
 * When not provided, the container falls back to the application root component element.
 */
export const KBQ_SHADOW_DOM_OVERLAY_HOST = new InjectionToken<KbqShadowDomOverlayHost>('KBQ_SHADOW_DOM_OVERLAY_HOST');

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
 * the token is absent) and relocates the overlay container into it. If no shadow root is found — the common case for
 * an app rendered directly in the light DOM — the container is left on `document.body`, so it is safe to provide
 * unconditionally.
 *
 * Note: this only fixes the overlay container *placement*. The host application is still responsible for delivering
 * the required CSS into the shadow root — both Koobiq component/theme styles and the structural overlay styles from
 * `@angular/cdk` (`@angular/cdk/overlay-prebuilt.css`), since global `document.head` stylesheets do not cascade across
 * a shadow boundary.
 *
 * @see provideKbqShadowDomOverlay
 */
@Injectable()
export class KbqShadowDomOverlayContainer extends OverlayContainer {
    private readonly host = inject(KBQ_SHADOW_DOM_OVERLAY_HOST, { optional: true });
    private readonly applicationRef = inject(ApplicationRef);

    protected override _createContainer(): void {
        // Let CDK create the container (and run its test-environment cleanup). It is appended to `document.body`.
        super._createContainer();

        const shadowRoot = this.resolveShadowRoot();

        // Relocate the container into the shadow root when the host actually lives in one.
        if (shadowRoot) {
            shadowRoot.appendChild(this._containerElement);
        }
    }

    private resolveShadowRoot(): ShadowRoot | null {
        const element = this.resolveHostElement();

        if (!element) {
            return null;
        }

        // The host can be the shadow host itself (the common case — the MFE root element)...
        const ownShadowRoot = (element as Element).shadowRoot;

        if (ownShadowRoot) {
            return ownShadowRoot;
        }

        // ...or an element that already lives inside the shadow tree.
        const rootNode = element.getRootNode();

        return typeof ShadowRoot !== 'undefined' && rootNode instanceof ShadowRoot ? rootNode : null;
    }

    private resolveHostElement(): Node | null {
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
 *     providers: [provideKbqShadowDomOverlay(() => document.querySelector('my-mfe-root')!)]
 * });
 * ```
 *
 * @param host element (or getter / `ElementRef`) inside the target shadow tree. When omitted, the application root
 * component element is used to resolve the shadow root.
 */
export const provideKbqShadowDomOverlay = (host?: KbqShadowDomOverlayHost): Provider[] => {
    const providers: Provider[] = [{ provide: OverlayContainer, useClass: KbqShadowDomOverlayContainer }];

    if (host !== undefined) {
        providers.push({ provide: KBQ_SHADOW_DOM_OVERLAY_HOST, useValue: host });
    }

    return providers;
};
