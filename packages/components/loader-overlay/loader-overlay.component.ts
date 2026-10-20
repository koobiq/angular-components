import { FocusMonitor, FocusOrigin, InputModalityDetector } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    EnvironmentInjector,
    inject,
    input,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';
import { KbqDefaultSizes, kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqProgressSpinner, ProgressSpinnerSize } from '@koobiq/components/progress-spinner';

const kbqLoaderOverlayParent = 'kbq-loader-overlay_parent';

/** Semantic background variants for `KbqLoaderOverlay`. */
export type KbqLoaderOverlaySurface = 'solid' | 'bg' | 'bg-secondary' | 'bg-tertiary' | 'card';

/** Directive that marks a custom loading indicator projected into the overlay. */
@Directive({
    selector: '[kbq-loader-overlay-indicator]',
    host: {
        class: 'kbq-loader-overlay-indicator'
    }
})
export class KbqLoaderOverlayIndicator {}

/** Directive that marks custom text projected into the overlay. */
@Directive({
    selector: '[kbq-loader-overlay-text]',
    host: {
        class: 'kbq-loader-overlay-text'
    }
})
export class KbqLoaderOverlayText {}

/** Directive that marks a custom caption projected into the overlay. */
@Directive({
    selector: '[kbq-loader-overlay-caption]',
    host: {
        class: 'kbq-loader-overlay-caption'
    }
})
export class KbqLoaderOverlayCaption {}

/** Component that covers its parent element while an operation is in progress. */
@Component({
    selector: 'kbq-loader-overlay',
    imports: [KbqProgressSpinner],
    templateUrl: './loader-overlay.component.html',
    styleUrls: ['./loader-overlay.scss', 'loader-overlay-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-loader-overlay',
        '[class]': 'loaderSizeClass()',
        '[class.kbq-loader-overlay_empty]': 'isEmpty()',
        '[class.kbq-loader-overlay_transparent]': 'resolvedSurface() !== "solid"',
        '[class.kbq-loader-overlay_filled]': 'resolvedSurface() === "solid"',
        '[class.kbq-loader-overlay_card]': 'resolvedSurface() === "card"',
        '[class.kbq-loader-overlay_surface_bg]': 'resolvedSurface() === "bg"',
        '[class.kbq-loader-overlay_surface_bg-secondary]': 'resolvedSurface() === "bg-secondary"',
        '[class.kbq-loader-overlay_surface_bg-tertiary]': 'resolvedSurface() === "bg-tertiary"'
    }
})
export class KbqLoaderOverlay implements OnInit, OnDestroy {
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly inputModalityDetector = inject(InputModalityDetector);
    private readonly environmentInjector = inject(EnvironmentInjector);

    private readonly externalIndicator = contentChild(KbqLoaderOverlayIndicator);
    private readonly externalText = contentChild(KbqLoaderOverlayText);
    private readonly externalCaption = contentChild(KbqLoaderOverlayCaption);

    private parent: HTMLElement | null = null;
    private parentWasInert = false;
    private previouslyFocused: HTMLElement | null = null;
    private previousFocusOrigin: FocusOrigin = null;

    /** Text shown under the indicator. Ignored when a `[kbq-loader-overlay-text]` is projected. */
    readonly text = input<string>();

    /** Caption shown under the text. Ignored when a `[kbq-loader-overlay-caption]` is projected. */
    readonly caption = input<string>();

    /** Size of the overlay and of its default indicator. */
    readonly size = input<KbqDefaultSizes>('big');

    /**
     * Sets the surface and opacity mode used by the overlay.
     *
     * `solid` is an opaque overlay. Other values select a transparent overlay that matches the corresponding surface.
     */
    readonly surface = input<KbqLoaderOverlaySurface | null | undefined>();

    /**
     * Controls the legacy overlay opacity when `surface` is not set and `card` is disabled.
     *
     * @deprecated Use `surface="bg"` for a transparent overlay or `surface="solid"` for an opaque overlay. Will
     * be removed in 22.0.0.
     */
    readonly transparent = input(true, { transform: booleanAttribute });

    /**
     * Uses a semi-transparent card background and overrides `transparent` when `surface` is not set.
     *
     * @deprecated Use `surface="card"` instead. Will be removed in 22.0.0.
     */
    readonly card = input(false, { transform: booleanAttribute });

    /** @docs-private */
    protected readonly isExternalIndicator = computed(() => !!this.externalIndicator());

    /** @docs-private */
    protected readonly isExternalText = computed(() => !!this.externalText());

    /** @docs-private */
    protected readonly isExternalCaption = computed(() => !!this.externalCaption());

    /** @docs-private */
    protected readonly isEmpty = computed(
        () => !(!!this.text() || this.isExternalText() || !!this.caption() || this.isExternalCaption())
    );

    /** @docs-private */
    protected readonly spinnerSize = computed<ProgressSpinnerSize>(() =>
        this.size() === 'compact' ? 'compact' : 'big'
    );

    /** @docs-private */
    protected readonly loaderSizeClass = computed(() => `kbq-loader-overlay_${this.size()}`);

    /** @docs-private */
    protected readonly resolvedSurface = computed<KbqLoaderOverlaySurface>(() => {
        const surface = this.surface();

        if (surface !== null && surface !== undefined) {
            return surface;
        }

        if (this.card()) {
            return 'card';
        }

        return this.transparent() ? 'bg' : 'solid';
    });

    ngOnInit(): void {
        this.parent = this.nativeElement.parentElement;

        if (this.parent) {
            // Covering the parent only blocks the pointer: `inert` also takes the content behind the overlay out of
            // the tab order, text selection and the accessibility tree. The overlay itself is inert too, which is
            // harmless because it has nothing to interact with.
            // An `inert` that comes with the class was set by an overlay (on the server, before hydration, or by
            // another overlay in this parent), so only one without it is the consumer's to keep.
            this.parentWasInert =
                this.parent.hasAttribute('inert') && !this.parent.classList.contains(kbqLoaderOverlayParent);
            this.saveFocus(this.parent);
            this.renderer.addClass(this.parent, kbqLoaderOverlayParent);
            this.renderer.setAttribute(this.parent, 'inert', '');
        }
    }

    ngOnDestroy(): void {
        if (this.parent) {
            this.renderer.removeClass(this.parent, kbqLoaderOverlayParent);

            if (!this.parentWasInert) {
                this.renderer.removeAttribute(this.parent, 'inert');
            }

            this.restoreFocus();
        }
    }

    // Remembers the element `inert` is about to take the focus from.
    private saveFocus(parent: HTMLElement): void {
        const focused = this.document.activeElement as HTMLElement | null;

        if (focused && parent.contains(focused)) {
            this.previouslyFocused = focused;
            // Read now: by the time the overlay goes away, the modality is long gone from the focus origin.
            this.previousFocusOrigin = this.inputModalityDetector.mostRecentModality;
        }
    }

    // Hands the focus back to the element the overlay took it from, unless the user has moved it since.
    private restoreFocus(): void {
        const element = this.previouslyFocused;

        // The environment injector is already destroyed when the overlay goes away with the whole application.
        if (!element || this.environmentInjector.destroyed) return;

        // After the render, not now: the element can still be disabled by a binding that is updated later in the
        // same pass. The environment injector, not the overlay's, because the overlay's view is already destroyed.
        afterNextRender(
            () => {
                const focused = this.document.activeElement;

                if (!element.isConnected || (focused && focused !== this.document.body)) return;

                // `focusVia` keeps the focus ring of a keyboard user, which a native `focus()` would drop. No scroll:
                // the user may have scrolled away while waiting.
                this.focusMonitor.focusVia(element, this.previousFocusOrigin ?? 'program', { preventScroll: true });
            },
            { injector: this.environmentInjector }
        );
    }
}
