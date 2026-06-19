import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    ViewEncapsulation,
    inject,
    signal
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

/**
 * Dev app that emulates a Module Federation micro-frontend mounted inside a Shadow DOM.
 *
 * `ViewEncapsulation.ShadowDom` renders this component (and the Koobiq content inside it) into a shadow root, and the
 * `kbq-light` host class scopes the theme tokens to that shadow tree — exactly like a real MFE that isolates its
 * styles. A real MFE delivers its CSS into the shadow root; here we emulate that by mirroring the global stylesheets
 * (Koobiq tokens/components + CDK overlay structural styles) into the shadow root and keeping lazily-injected
 * component styles (e.g. the toast styles added on first show) in sync.
 *
 * Open with `?container=default` (the toast escapes to `document.body` → unthemed) vs `?container=shadow`
 * (`provideKbqShadowDomOverlay` keeps the toast inside the shadow root → fully themed). See `main.ts`.
 */
@Component({
    selector: 'dev-app',
    imports: [KbqButtonModule],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.ShadowDom,
    host: {
        class: 'kbq-light'
    }
})
export class DevApp implements AfterViewInit, OnDestroy {
    private readonly document = inject(DOCUMENT);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly toastService = inject(KbqToastService);

    protected readonly toastStyle = KbqToastStyle;

    /** Human-readable location of the `.cdk-overlay-container`, updated after a toast is shown. */
    protected readonly containerLocation = signal<string>('— (show a toast)');

    private observer?: MutationObserver;

    ngAfterViewInit(): void {
        const shadowRoot = this.elementRef.nativeElement.shadowRoot;

        if (!shadowRoot) {
            return;
        }

        this.mirrorGlobalStyles(shadowRoot);

        // Keep mirroring stylesheets injected after init (the toast component styles land in `document.head` on
        // first show because Koobiq components use `ViewEncapsulation.None`).
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach((node) => {
                    if (this.isStyleNode(node)) {
                        shadowRoot.appendChild(node.cloneNode(true));
                    }
                });
            }
        });

        this.observer.observe(this.document.head, { childList: true });
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
    }

    protected showToast(style: KbqToastStyle): void {
        this.toastService.show({
            style,
            title: `${style} toast`,
            caption: 'Rendered from inside an emulated MFE shadow root'
        });

        this.updateContainerLocation();
    }

    private updateContainerLocation(): void {
        const inShadow = this.elementRef.nativeElement.shadowRoot?.querySelector('.cdk-overlay-container');
        const inBody = this.document.body.querySelector('.cdk-overlay-container');

        this.containerLocation.set(
            inShadow
                ? 'shadow root ✅ (themed — fixed)'
                : inBody
                  ? 'document.body ❌ (unthemed — bug)'
                  : '— (show a toast)'
        );
    }

    /** Emulates an MFE delivering its CSS into the shadow root. */
    private mirrorGlobalStyles(shadowRoot: ShadowRoot): void {
        this.document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
            shadowRoot.appendChild(node.cloneNode(true));
        });
    }

    private isStyleNode(node: Node): node is HTMLStyleElement | HTMLLinkElement {
        return node instanceof HTMLStyleElement || (node instanceof HTMLLinkElement && node.rel === 'stylesheet');
    }
}
