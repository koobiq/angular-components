import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    numberAttribute,
    OnChanges,
    signal,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import { KbqColorDirective } from '@koobiq/components/core';
import { defer, Subscription } from 'rxjs';
import { KBQ_ICON_ERROR_STATE_CONTEXT } from './icon-error-state-context';
import { KbqIconRegistry } from './icon-registry';

/**
 * Renders an icon on the element it is applied to: a `@koobiq/icons` font glyph by default, or an inline
 * `<svg>` when the name resolves through a configured `KbqIconRegistry`. A name that does not resolve
 * falls back to the font class, and every later name is resolved again.
 *
 * The host is `aria-hidden` by default: an icon carries no text of its own, and in nearly every place the
 * library and its consumers use one it repeats a label that is already there. A meaningful icon opts out
 * with `aria-hidden="false"`, and then has to supply its own `role="img"` and `aria-label`.
 */
@Component({
    selector: '[kbq-icon]',
    template: '<ng-content />',
    styleUrls: ['icon.scss', 'icon-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq kbq-icon',
        '[class]': 'svgIcon() ? null : iconName',
        '[class.kbq-error]': 'color() === "error" || hasError || autoColorError'
    }
})
export class KbqIcon extends KbqColorDirective implements AfterContentInit, OnChanges {
    /**
     * Host providing error state for `autoColor`, when the icon sits inside one (e.g. a form field).
     * @docs-private
     */
    protected readonly errorStateContext = inject(KBQ_ICON_ERROR_STATE_CONTEXT, { optional: true });
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    protected readonly registry = inject(KbqIconRegistry, { optional: true });
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly renderer = inject(Renderer2);

    readonly small = input(false);
    autoColor = false;

    /** Whether an icon of this kind is decorative when the caller says nothing. Overridden by subclasses. */
    protected readonly defaultAriaHidden: boolean = true;

    /** @docs-private */
    protected readonly resolvedAriaHidden = computed(() => {
        const explicit = this.ariaHidden();

        // An explicit value is the caller's, including "false" — reflecting it keeps the documented
        // opt-out visible in the DOM. Only an unbound input falls back to the kind's default.
        if (explicit !== undefined) return String(explicit);

        return this.defaultAriaHidden ? 'true' : null;
    });

    /**
     * Rendered size of the icon in pixels. Left unset, the size is read from the `_<px>` suffix of the
     * icon name (`kbq-plus_16` → 16), which is the `@koobiq/icons` convention; a name without one is
     * rendered at whatever size the surrounding styles give it.
     */
    readonly iconSize = input(undefined, {
        transform: (value: unknown): number | undefined => {
            const size = numberAttribute(value);

            return Number.isNaN(size) ? undefined : size;
        }
    });

    /**
     * Whether the icon follows the error state of the host it sits in (a form field, for one), painting
     * itself red while that host reports an error.
     */
    // Kept as an accessor `@Input()` rather than an `input()`: `KbqCleaner` writes it from its own
    // constructor, and an `input()` has no setter to write. The setter is also where the error-state
    // subscription is made and torn down, which a signal input cannot intercept.
    @Input({ transform: booleanAttribute })
    get autoColor(): boolean {
        return this.autoColorEnabled;
    }

    set autoColor(value: boolean) {
        if (this.autoColorEnabled === value) return;

        this.autoColorEnabled = value;

        // A subclass may write this from its constructor (`KbqCleaner` does), and the error-state context
        // is a form field reading a required `contentChild` — touching it that early throws NG0951.
        if (this.contentInitialized) {
            this.trackErrorState();
        }
    }

    private autoColorEnabled = false;
    private contentInitialized = false;
    private errorStateSubscription: Subscription | null = null;

    /** Whether the host this icon follows is currently in an error state. Only ever set with `autoColor`. */
    hasError: boolean = false;

    /**
     * Whether `autoColor` takes the error color from the host's error state.
     * @docs-private
     */
    protected get autoColorError(): boolean {
        return this.autoColor && !!this.errorStateContext?.errorState();
    }

    /** Name of an icon within a `@koobiq/icons`. Accepts "namespace:name" syntax. */
    iconName: string;

    /** @docs-private */
    readonly autoColorInput = input<boolean | undefined>(undefined, { alias: 'autoColor' });

    /** @docs-private */
    readonly iconNameInput = input<string | undefined>(undefined, { alias: 'kbq-icon' });

    /**
     * Whether the host gets an inline `max-height` matching the icon size. Only the bare icon does: the
     * button and the item size themselves through their own padding.
     */
    protected readonly appliesMaxHeight: boolean = true;

    /**
     * True when icon is being rendered as inline SVG.
     * @docs-private
     */
    protected readonly svgIcon = signal(false);

    /**
     * Name the inline SVG is resolved for, set through `setIconName()`.
     * @docs-private
     */
    protected readonly svgIconName = signal<string | undefined>(undefined);

    /** Resolution of the inline SVG, replaced whenever the name changes. */
    private svgIconSubscription = Subscription.EMPTY;

    /** Whether the content is initialized, which is when the inline SVG is first resolved. */
    private contentInitialized = false;

    constructor() {
        super();

        this.destroyRef.onDestroy(() => this.svgIconSubscription.unsubscribe());
    }

    getHostElement() {
        return this.elementRef.nativeElement;
    }

    /**
     * Sets the icon name outside of the template, keeping the SVG resolution stream in sync.
     * `ngOnChanges` does not run for values assigned in a constructor, so subclasses have to use this.
     *
     * @docs-private
     */
    protected setIconName(name: string): void {
        this.iconName = name;
        this.svgIconName.set(name);

        if (this.contentInitialized) this.resolveSvgIcon();
    }

    /** @docs-private */
    updateMaxHeight() {
        if (!this.appliesMaxHeight) {
            return;
        }

        const size = this.resolveIconSize();
        const host = this.getHostElement();

        if (size !== undefined) {
            this.renderer.setStyle(host, 'max-height', `${size}px`);
        } else {
            // Without this the ceiling written for the previous name keeps clipping the new glyph.
            this.renderer.removeStyle(host, 'max-height');
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        // A bound input is handed to its member as the decorator input did; unbound, it leaves what code wrote.
        if (changes['autoColorInput']) {
            const autoColor = this.autoColorInput();

            if (autoColor !== undefined) this.autoColor = autoColor;
        }

        if (changes['iconNameInput']) {
            const iconName = this.iconNameInput();

            if (iconName !== undefined) this.setIconName(iconName);
        }

        // A name change reaches `updateMaxHeight` through the resolution stream; an explicit size does not.
        if (changes.iconSize && this.contentInitialized) {
            this.updateMaxHeight();
        }
    }

    ngAfterContentInit(): void {
        this.updateMaxHeight();

        this.contentInitialized = true;
        this.resolveSvgIcon();
    }

    /** Renders `svgIconName` as inline SVG when the registry knows it, dropping a resolution still pending. */
    private resolveSvgIcon(): void {
        const name = this.svgIconName();

        this.svgIconSubscription.unsubscribe();

        if (!this.registry || !name) {
            this.svgIcon.set(false);

            return;
        }

        const registry = this.registry;

        // Deferred so that a literal the registry fails to parse falls back to the font class as well.
        this.svgIconSubscription = defer(() => registry.getNamedSvgIcon(name)).subscribe({
            next: (svg) => {
                this.svgIcon.set(true);
                const host = this.getHostElement();

                // Remove any previously injected SVG.
                const existing = host.querySelector('svg');

                if (existing) {
                    host.removeChild(existing);
                }

                const size = this.parseIconSize();

                if (size) {
                    svg.setAttribute('width', `${size}`);
                    svg.setAttribute('height', `${size}`);
                }

                host.insertBefore(svg, host.firstChild);
            },
            error: () => {
                // Icon not registered — fall through to font-class path.
                this.svgIcon.set(false);
                this.updateMaxHeight();
            }
        });
    }

    private parseIconSize(): number {
        const iconName = this.iconName;
        const baseName = iconName?.includes(':') ? iconName.split(':')[1] : iconName;
        const size = parseInt(baseName?.split('_').pop() ?? '');

        return Number.isNaN(size) ? undefined : size;
    }
}
