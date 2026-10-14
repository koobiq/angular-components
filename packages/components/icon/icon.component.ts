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
    Renderer2,
    signal,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import { KbqColorDirective, KbqComponentColors } from '@koobiq/components/core';
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
        '[class.kbq-error]': 'colorIsError() || hasError || autoColorError',
        '[attr.aria-hidden]': 'resolvedAriaHidden()'
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

    /**
     * Whether the icon is hidden from assistive technology. Left unbound, it falls back to
     * `defaultAriaHidden`, which is `true` for a decorative icon and `false` for an interactive one.
     */
    readonly ariaHidden = input<boolean | undefined, boolean | string | null | undefined>(undefined, {
        alias: 'aria-hidden',
        // `null` is how a template says "leave it unset" (`cond ? true : null`), so it means the default
        // rather than `false` — `booleanAttribute(null)` would turn it into an explicit opt-out.
        transform: (value) => (value == null ? undefined : booleanAttribute(value))
    });

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
    readonly iconSize = input<number | undefined, number | string | null | undefined>(undefined, {
        transform: (value) => {
            const size = numberAttribute(value);

            return Number.isNaN(size) ? undefined : size;
        }
    });

    /**
     * Whether the icon follows the error state of the host it sits in (a form field, for one), painting
     * itself red while that host reports an error.
     */
    autoColor = false;

    /**
     * Whether the icon takes the error color whatever its `color` is. Set by a host that tints the icons
     * it holds, such as `KbqEmptyState`.
     */
    hasError: boolean = false;

    /**
     * Whether `autoColor` takes the error color from the host's error state.
     * @docs-private
     */
    protected get autoColorError(): boolean {
        return this.autoColor && !!this.errorStateContext?.errorState();
    }

    /**
     * Whether `color` is the error color. A signal of its own because the color class binding already reads
     * `color`: the host bindings of every icon in a view run in that view's reactive consumer, which finds a
     * signal read a second time by scanning all it has read so far, O(N²) per check across N icons.
     * @internal
     */
    protected readonly colorIsError = computed(() => this.color() === KbqComponentColors.Error);

    /** Name of an icon within a `@koobiq/icons`. Accepts "namespace:name" syntax. */
    iconName: string | undefined;

    /** @docs-private */
    readonly autoColorInput = input<boolean | undefined, boolean | string | null | undefined>(undefined, {
        alias: 'autoColor',
        transform: booleanAttribute
    });

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
     * Name the inline SVG is resolved for, which is `iconName` however that was set.
     * @docs-private
     */
    protected get svgIconName(): string | undefined {
        return this.iconName;
    }

    /** Resolution of the inline SVG, replaced whenever the name changes. */
    private svgIconSubscription = Subscription.EMPTY;

    /** The `<svg>` injected for the resolved name. */
    private injectedSvg: SVGElement | null = null;

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
     * Sets the icon name from code and resolves its inline SVG again. Before the content is initialized,
     * assigning `iconName` does the same.
     *
     * @docs-private
     */
    protected setIconName(name: string): void {
        this.iconName = name;

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
        // A bound input is handed to its member; unbound, it leaves what code wrote.
        // A bound `undefined` is a value as well: auto color turns off and the icon is removed.
        if (changes['autoColorInput']) this.autoColor = this.autoColorInput() ?? false;

        // A name change reaches the size through the resolution; an explicit size resolves nothing.
        if (changes['iconSize'] && this.contentInitialized) this.applyIconSize();

        if (changes['iconNameInput']) this.setIconName(this.iconNameInput() ?? '');
    }

    ngAfterContentInit(): void {
        this.updateMaxHeight();

        this.contentInitialized = true;
        this.resolveSvgIcon();
    }

    /** Renders `svgIconName` as inline SVG when the registry knows it, dropping a resolution still pending. */
    private resolveSvgIcon(): void {
        const name = this.svgIconName;

        this.svgIconSubscription.unsubscribe();

        if (!this.registry || !name) {
            this.renderSvgIcon(null);

            return;
        }

        const registry = this.registry;

        // Deferred so that a resolver or a literal that throws falls back to the font class as well, and the
        // next name is resolved again.
        this.svgIconSubscription = defer(() => registry.getNamedSvgIcon(name)).subscribe({
            next: (svg) => this.renderSvgIcon(svg),
            error: () => this.renderSvgIcon(null)
        });
    }

    /** Injects the resolved `<svg>`, or drops back to the font class when the name did not resolve. */
    private renderSvgIcon(svg: SVGElement | null): void {
        const host = this.getHostElement();

        // Only the element injected here: an `<svg>` projected into the host is the consumer's content.
        if (this.injectedSvg) {
            this.renderer.removeChild(host, this.injectedSvg);
        }

        this.injectedSvg = svg;
        this.svgIcon.set(!!svg);

        if (svg) {
            this.renderer.insertBefore(host, svg, host.firstChild);
        }

        this.applyIconSize();
    }

    /** Sizes the injected `<svg>` and the host's `max-height` to the resolved icon size. */
    private applyIconSize(): void {
        const size = this.resolveIconSize();
        const svg = this.injectedSvg;

        if (svg && size !== undefined) {
            this.renderer.setAttribute(svg, 'width', `${size}`);
            this.renderer.setAttribute(svg, 'height', `${size}`);
        }

        this.updateMaxHeight();
    }

    private resolveIconSize(): number | undefined {
        return this.iconSize() ?? this.parseIconSize();
    }

    private parseIconSize(): number | undefined {
        const iconName = this.iconName;
        const baseName = iconName?.includes(':') ? iconName.split(':')[1] : iconName;
        const size = parseInt(baseName?.split('_').pop() ?? '');

        return Number.isNaN(size) ? undefined : size;
    }
}
