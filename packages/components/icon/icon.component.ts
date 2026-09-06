import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    DestroyRef,
    inject,
    Input,
    input,
    numberAttribute,
    OnChanges,
    Renderer2,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqColorDirective } from '@koobiq/components/core';
import { of, ReplaySubject, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
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
        '[class]': 'svgIcon ? null : iconName',
        '[class.kbq-error]': 'color === "error" || hasError',
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
    readonly ariaHidden = input<boolean | undefined, unknown>(undefined, {
        alias: 'aria-hidden',
        transform: (value) => (value === undefined ? undefined : booleanAttribute(value))
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

    /** Name of an icon within a @koobiq/icons. Accepts "namespace:name" syntax. */
    // TODO: Skipped for migration because:
    //  Subclass KbqIconButton overrides this input with `@Input({ alias: 'kbq-icon-button' })`
    //  using a plain string, which is incompatible with InputSignal<string>.
    //  Migrate KbqIconButton.iconName together as a follow-up.
    @Input({ alias: 'kbq-icon' }) iconName: string | undefined;

    /**
     * Whether the host gets an inline `max-height` matching the icon size. Only the bare icon does: the
     * button and the item size themselves through their own padding.
     */
    protected readonly appliesMaxHeight: boolean = true;

    /**
     * True when icon is being rendered as inline SVG.
     * @docs-private
     */
    protected svgIcon = false;

    /** @docs-private */
    protected readonly svgIconName = new ReplaySubject<string | undefined>(1);

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
        this.svgIconName.next(name);
    }

    /** @docs-private */
    updateMaxHeight() {
        if (!this.appliesMaxHeight) {
            return;
        }

        const size = this.resolveIconSize();
        const host = this.getHostElement();

        if (size) {
            this.renderer.setStyle(host, 'max-height', `${size}px`);
        } else {
            // Without this the ceiling written for the previous name keeps clipping the new glyph.
            this.renderer.removeStyle(host, 'max-height');
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.iconName) {
            this.svgIconName.next(changes['iconName'].currentValue);
        }

        // A name change reaches `updateMaxHeight` through the resolution stream; an explicit size does not.
        if (changes.iconSize && this.contentInitialized) {
            this.updateMaxHeight();
        }
    }

    ngAfterContentInit(): void {
        this.contentInitialized = true;
        this.destroyRef.onDestroy(() => this.errorStateSubscription?.unsubscribe());

        if (this.autoColorEnabled) {
            this.trackErrorState();
        }

        this.updateMaxHeight();

        this.svgIconName
            .pipe(
                // `catchError` inside the `switchMap` keeps an unresolved name from completing the outer
                // subscription: in the default font-icon setup every name is unresolved, so a terminal
                // `error` callback would leave the icon unable to render any later name at all.
                switchMap((name) =>
                    this.registry && name
                        ? this.registry.getNamedSvgIcon(name).pipe(catchError(() => of(null)))
                        : of(null)
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((svg) => this.renderSvgIcon(svg));
    }

    /** Injects the resolved `<svg>`, or drops back to the font class when the name did not resolve. */
    private renderSvgIcon(svg: SVGElement | null): void {
        const host = this.getHostElement();
        const previous = host.querySelector('svg');

        if (previous) {
            this.renderer.removeChild(host, previous);
        }

        this.svgIcon = !!svg;

        if (svg) {
            const size = this.resolveIconSize();

            if (size) {
                this.renderer.setAttribute(svg, 'width', `${size}`);
                this.renderer.setAttribute(svg, 'height', `${size}`);
            }

            this.renderer.insertBefore(host, svg, host.firstChild);
        }

        this.updateMaxHeight();
        this.changeDetectorRef.markForCheck();
    }

    private trackErrorState(): void {
        this.errorStateSubscription?.unsubscribe();
        this.errorStateSubscription = null;

        if (!this.autoColorEnabled) {
            this.setHasError(false);

            return;
        }

        const context = this.errorStateContext;

        if (!context) return;

        // `errorState` and `stateChanges` are read back off the context on every emission: the form field
        // exposes both as getters over the control it currently holds, which can be replaced at runtime.
        // Torn down by the `onDestroy` registered in `ngAfterContentInit`, so that toggling `autoColor`
        // does not pile up one destroy callback per toggle.
        this.errorStateSubscription = context.stateChanges.subscribe(() => this.setHasError(context.errorState));

        this.setHasError(context.errorState);
    }

    private setHasError(value: boolean): void {
        if (this.hasError === value) return;

        this.hasError = value;
        this.changeDetectorRef.markForCheck();
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
