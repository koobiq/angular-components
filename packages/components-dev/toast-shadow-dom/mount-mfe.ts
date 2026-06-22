import { ApplicationRef, EnvironmentProviders, InjectionToken, Provider, Type, createComponent } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideKbqShadowDomOverlay } from '@koobiq/components/core';
import { KbqToastPosition, kbqToastConfigurationProvider } from '@koobiq/components/toast';

/** Per-MFE configuration propagated through DI. */
export interface DevMfeConfig {
    /** 1-based nesting level. */
    level: number;
    /** Deepest level to mount. */
    maxLevel: number;
    /** When true, overlays are routed into this MFE's shadow root; otherwise they escape to `document.body`. */
    useShadow: boolean;
}

export const DEV_MFE_CONFIG = new InjectionToken<DevMfeConfig>('DEV_MFE_CONFIG');

export interface DevMountedMfe {
    appRef: ApplicationRef;
}

/**
 * Bootstraps an independent Angular application for `rootComponent` into `host`, emulating a Module Federation
 * micro-frontend. Each MFE gets its own root injector — so its own `OverlayContainer` (via
 * `provideKbqShadowDomOverlay`), its own toast/modal/sidepanel services, and its own theme.
 *
 * `rootComponent` is passed in (rather than imported) to avoid a circular import with `module.ts`.
 */
export async function devMountMfe(
    host: HTMLElement,
    config: DevMfeConfig,
    rootComponent: Type<unknown>
): Promise<DevMountedMfe> {
    const providers: (Provider | EnvironmentProviders)[] = [
        provideAnimations(),
        kbqToastConfigurationProvider({ position: KbqToastPosition.TOP_RIGHT }),
        { provide: DEV_MFE_CONFIG, useValue: config }
    ];

    if (config.useShadow) {
        // `host` is the MFE root element; the container resolves its shadow root (even when `host` is itself
        // nested inside another shadow root).
        providers.push(...provideKbqShadowDomOverlay(() => host));
    }

    const appRef = await createApplication({ providers });

    const componentRef = createComponent(rootComponent, {
        environmentInjector: appRef.injector,
        hostElement: host
    });

    appRef.attachView(componentRef.hostView);
    // The component was created outside this app's NgZone, so render its initial view explicitly.
    appRef.tick();

    return { appRef };
}

/**
 * Emulates an MFE delivering its CSS into its shadow root: clones every global stylesheet from `document.head`
 * into `shadowRoot`, and keeps mirroring stylesheets injected later (Koobiq components use
 * `ViewEncapsulation.None`, so their styles land in `document.head` on first use — e.g. the modal/sidepanel/toast
 * styles added when they first open). Returns the observer so the caller can disconnect it on destroy.
 */
export function devMirrorGlobalStyles(shadowRoot: ShadowRoot, document: Document): MutationObserver {
    const isStyleNode = (node: Node): node is HTMLStyleElement | HTMLLinkElement =>
        node instanceof HTMLStyleElement || (node instanceof HTMLLinkElement && node.rel === 'stylesheet');

    document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
        shadowRoot.appendChild(node.cloneNode(true));
    });

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
                if (isStyleNode(node)) {
                    shadowRoot.appendChild(node.cloneNode(true));
                }
            });
        }
    });

    observer.observe(document.head, { childList: true });

    return observer;
}
