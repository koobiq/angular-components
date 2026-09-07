import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ContentChild,
    Directive,
    ElementRef,
    inject,
    Input,
    input,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';
import { KbqDefaultSizes } from '@koobiq/components/core';
import { KbqProgressSpinner } from '@koobiq/components/progress-spinner';

const kbqLoaderOverlayParent = 'kbq-loader-overlay_parent';

export type KbqLoaderOverlaySurface = 'solid' | 'bg' | 'bg-secondary' | 'bg-tertiary' | 'card';

@Directive({
    selector: '[kbq-loader-overlay-indicator]',
    host: {
        class: 'kbq-loader-overlay-indicator'
    }
})
export class KbqLoaderOverlayIndicator {}

@Directive({
    selector: '[kbq-loader-overlay-text]',
    host: {
        class: 'kbq-loader-overlay-text'
    }
})
export class KbqLoaderOverlayText {}

@Directive({
    selector: '[kbq-loader-overlay-caption]',
    host: {
        class: 'kbq-loader-overlay-caption'
    }
})
export class KbqLoaderOverlayCaption {}

@Component({
    selector: 'kbq-loader-overlay',
    imports: [KbqProgressSpinner],
    templateUrl: './loader-overlay.component.html',
    styleUrls: ['./loader-overlay.scss', 'loader-overlay-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-loader-overlay',
        '[class]': 'loaderSizeClass',
        '[class.kbq-loader-overlay_empty]': 'isEmpty',
        '[class.kbq-loader-overlay_transparent]': 'isTransparent()',
        '[class.kbq-loader-overlay_filled]': '!isTransparent()',
        '[class.kbq-loader-overlay_card]': 'isCardBackground',
        '[class.kbq-loader-overlay_surface_bg]': 'surface() === "bg"',
        '[class.kbq-loader-overlay_surface_bg-secondary]': 'surface() === "bg-secondary"',
        '[class.kbq-loader-overlay_surface_bg-tertiary]': 'surface() === "bg-tertiary"'
    }
})
export class KbqLoaderOverlay implements OnInit, OnDestroy {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private renderer = inject(Renderer2);

    // TODO: Skipped for migration because:
    //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
    //  and migrating would break narrowing currently.
    @Input() text: string;

    // TODO: Skipped for migration because:
    //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
    //  and migrating would break narrowing currently.
    @Input() caption: string;
    readonly size = input<KbqDefaultSizes>('big');
    /**
     * Sets the surface and opacity mode used by the overlay.
     *
     * `solid` is an opaque overlay. Other values select a transparent overlay that matches the corresponding surface.
     */
    readonly surface = input<KbqLoaderOverlaySurface | undefined>();
    /**
     * Controls the legacy overlay opacity when `surface` is not set.
     *
     * @deprecated Use `surface` instead.
     */
    readonly transparent = input<boolean>(true);
    /**
     * Uses a semi-transparent card background.
     *
     * @deprecated Use `surface="card"` instead.
     */
    readonly card = input<boolean, unknown>(false, { transform: booleanAttribute });

    private parent: HTMLElement | null = null;

    get isExternalIndicator(): boolean {
        return !!this.externalIndicator;
    }

    get isExternalText(): boolean {
        return !!this.externalText;
    }

    get isExternalCaption(): boolean {
        return !!this.externalCaption;
    }

    get isEmpty(): boolean {
        return !(!!this.text || this.isExternalText || !!this.caption || this.isExternalCaption);
    }

    get spinnerSize(): string {
        return this.size() === 'compact' ? 'compact' : 'big';
    }

    /**
     * @docs-private
     */
    protected get loaderSizeClass(): string {
        return `kbq-loader-overlay_${this.size()}`;
    }

    protected readonly isTransparent = computed(() => {
        const surface = this.surface();

        if (surface !== undefined) {
            return surface !== 'solid';
        }

        if (this.card()) {
            return true;
        }

        return this.transparent();
    });

    protected get isCardBackground(): boolean {
        const surface = this.surface();

        return surface === 'card' || (surface === undefined && this.card());
    }

    @ContentChild(KbqLoaderOverlayIndicator) externalIndicator: KbqLoaderOverlayIndicator | null;
    @ContentChild(KbqLoaderOverlayText) externalText: KbqLoaderOverlayText | null;
    @ContentChild(KbqLoaderOverlayCaption) externalCaption: KbqLoaderOverlayCaption | null;

    ngOnInit(): void {
        this.parent = this.elementRef.nativeElement.parentElement;

        this.renderer.addClass(this.parent, kbqLoaderOverlayParent);
    }

    ngOnDestroy(): void {
        this.renderer.removeClass(this.parent, kbqLoaderOverlayParent);
    }
}
