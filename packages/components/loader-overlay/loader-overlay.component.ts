import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
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

    private readonly externalIndicator = contentChild(KbqLoaderOverlayIndicator);
    private readonly externalText = contentChild(KbqLoaderOverlayText);
    private readonly externalCaption = contentChild(KbqLoaderOverlayCaption);

    private parent: HTMLElement | null = null;

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
     * @deprecated Use `surface="bg"` for a transparent overlay or `surface="solid"` for an opaque overlay.
     */
    readonly transparent = input(true, { transform: booleanAttribute });

    /**
     * Uses a semi-transparent card background and overrides `transparent` when `surface` is not set.
     *
     * @deprecated Use `surface="card"` instead.
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
            this.renderer.addClass(this.parent, kbqLoaderOverlayParent);
        }
    }

    ngOnDestroy(): void {
        if (this.parent) {
            this.renderer.removeClass(this.parent, kbqLoaderOverlayParent);
        }
    }
}
