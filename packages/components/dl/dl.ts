import { CdkMonitorFocus, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
    linkedSignal,
    numberAttribute,
    output,
    Provider,
    signal,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    KBQ_A11Y_LOCALE_CONFIGURATION,
    KBQ_WINDOW,
    kbqInjectNativeElement,
    KbqLocaleOverridesDirective,
    kbqOptionalNumberAttribute
} from '@koobiq/components/core';
import { KbqResizable, KbqResizer, KbqResizerDirection, KbqResizerSizeChangeEvent } from '@koobiq/components/resizer';

/** Supported alignment values for description list items. */
export type KbqDlAlign = 'start' | 'center' | 'end';

/** Configuration for {@link KbqDl}. Each input of a list overrides its option. */
export type KbqDlOptions = {
    /** Host width in pixels at or below which a list switches to the vertical layout. */
    verticalBreakpoint: number;
    /** Forces the vertical layout; `null` lets a list decide based on `verticalBreakpoint`. */
    vertical: boolean | null;
    /** Whether a list uses the wide two-column layout. */
    wide: boolean;
    /** Whether the `kbq-dt` area can be resized by dragging the separator. */
    resizable: boolean;
    /** Width of the `kbq-dt` area in pixels; `null` keeps the default column ratio. */
    dtWidth: number | null;
    /** Minimum width of the `kbq-dt` area in pixels; defaults to the rendered term width. */
    dtMinWidth?: number;
    /** Minimum width retained for the `kbq-dd` area in pixels; defaults to the rendered term width. */
    ddMinWidth?: number;
    /** Vertical alignment of `kbq-dt` and `kbq-dd` items. */
    verticalAlign: KbqDlAlign;
    /** Horizontal alignment of `kbq-dt` and `kbq-dd` items. */
    horizontalAlign: KbqDlAlign;
};

const KBQ_DL_DEFAULT_OPTIONS: KbqDlOptions = {
    verticalBreakpoint: 400,
    vertical: null,
    wide: false,
    resizable: false,
    dtWidth: null,
    verticalAlign: 'start',
    horizontalAlign: 'start'
};

/** Injection token holding the current {@link KbqDlOptions}. */
export const KBQ_DL_OPTIONS = new InjectionToken<KbqDlOptions>('KBQ_DL_OPTIONS', {
    factory: () => KBQ_DL_DEFAULT_OPTIONS
});

/**
 * Overrides the default description list options within the given injector scope. The options it leaves out keep the
 * values of the parent injector.
 */
export function kbqDlOptionsProvider(options: Partial<KbqDlOptions>): Provider {
    // An option passed as `undefined` keeps the inherited value instead of replacing it.
    const defined = Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined));

    return {
        provide: KBQ_DL_OPTIONS,
        useFactory: (): KbqDlOptions => ({
            ...(inject(KBQ_DL_OPTIONS, { skipSelf: true, optional: true }) ?? KBQ_DL_DEFAULT_OPTIONS),
            ...defined
        })
    };
}

/**
 * Coerces an attribute value to a boolean while keeping nullish apart from `false`.
 *
 * `booleanAttribute` folds both nullish values into `false`, which erases the "decide from
 * `verticalBreakpoint`" state `vertical` needs.
 */
const optionalBooleanAttribute = (value: unknown): boolean | null | undefined =>
    value == null ? (value as null | undefined) : booleanAttribute(value);

/** Term of a description list. */
@Component({
    selector: 'kbq-dt',
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-dt'
    }
})
export class KbqDt {}

/** Description of the term before it. */
@Component({
    selector: 'kbq-dd',
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-dd'
    }
})
export class KbqDd {}

/** Description list: `kbq-dt` terms paired with `kbq-dd` descriptions in an adaptive, horizontal or vertical layout. */
@Component({
    selector: 'kbq-dl',
    imports: [KbqResizable, KbqResizer, CdkMonitorFocus],
    template: `
        <ng-content />

        @if (resizerVisible()) {
            <div
                #resizeTrack
                class="kbq-dl__resize-track"
                kbqResizable
                [style.max-width.px]="resized() ? maxDtWidth() : null"
                [style.min-width.px]="resized() ? normalizedDtMinWidth() : null"
                [style.width.px]="dtWidth()"
            >
                <div
                    #resizeHandle
                    class="kbq-dl__resize-handle"
                    role="separator"
                    aria-orientation="vertical"
                    tabindex="0"
                    cdkMonitorElementFocus
                    [cursor]="resizeCursor()"
                    [attr.aria-label]="resolvedResizerAriaLabel()"
                    [attr.aria-valuemax]="maxDtWidth()"
                    [attr.aria-valuemin]="normalizedDtMinWidth()"
                    [attr.aria-valuenow]="currentDtWidth()"
                    [kbqResizer]="resizeDirection()"
                    (dblclick)="handleResizeDblClick($event)"
                    (keydown)="handleResizeKeydown($event)"
                    (resizeStart)="handleResizeStart()"
                    (sizeChange)="handleDtResize($event)"
                ></div>
            </div>
        }
    `,
    styleUrls: ['dl.scss', 'dl-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-dl',
        '[class.kbq-dl_vertical]': 'isVertical()',
        '[class.kbq-dl_wide]': 'wide()',
        '[class.kbq-dl_resizable]': 'resizerVisible()',
        '[class.kbq-dl_resized]': 'resized()',
        '[class.kbq-dl_vertical-align-center]': "verticalAlign() === 'center'",
        '[class.kbq-dl_vertical-align-end]': "verticalAlign() === 'end'",
        '[class.kbq-dl_horizontal-align-center]': "horizontalAlign() === 'center'",
        '[class.kbq-dl_horizontal-align-end]': "horizontalAlign() === 'end'",
        '[style.--kbq-description-list-dt-width.px]': 'dtWidth()',
        '[style.--kbq-description-list-dt-min-width.px]': 'normalizedDtMinWidth()'
    },
    hostDirectives: [
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ]
})
export class KbqDl {
    // Read by the input defaults below, so it is declared first.
    private readonly options = inject(KBQ_DL_OPTIONS);

    /**
     * Host width in pixels at or below which the list auto-switches to the vertical layout.
     * Defaults to the app-wide {@link KBQ_DL_OPTIONS}.
     */
    readonly verticalBreakpoint = input(this.options.verticalBreakpoint, { transform: numberAttribute });

    /** Whether the list uses the wide two-column layout. Defaults to the app-wide {@link KBQ_DL_OPTIONS}. */
    readonly wide = input(this.options.wide, { transform: booleanAttribute });

    /**
     * Whether the `kbq-dt` area can be resized by dragging the separator.
     * Defaults to the app-wide {@link KBQ_DL_OPTIONS}.
     */
    readonly resizable = input(this.options.resizable, { transform: booleanAttribute });

    /**
     * Backing input of `dtWidth`. Public because a signal input cannot be `protected` without breaking
     * the binding for a `strictTemplates` consumer.
     *
     * @docs-private
     */
    readonly dtWidthInput = input<number | null, unknown>(this.options.dtWidth, {
        alias: 'dtWidth',
        transform: (value: unknown) => kbqOptionalNumberAttribute(value) ?? null
    });

    /**
     * Width of the `kbq-dt` area in pixels; `null` restores the default column ratio.
     * Defaults to the app-wide {@link KBQ_DL_OPTIONS}.
     *
     * Writable: a drag or a double-click on the separator sets it, and `dtWidthChange` reports that back.
     * `model()` would have been the shorter form, but it takes no `transform`, so an uncoerced attribute
     * reached the layout arithmetic as a string and skipped the clamp against `dtMinWidth`.
     */
    readonly dtWidth = linkedSignal(() => this.dtWidthInput());

    /** Emits when the component itself changes `dtWidth`; completes the `[(dtWidth)]` two-way binding. */
    readonly dtWidthChange = output<number | null>();

    /**
     * Minimum width of the `kbq-dt` area in pixels; defaults to the app-wide {@link KBQ_DL_OPTIONS}, then to the
     * rendered term width.
     */
    readonly dtMinWidth = input<number | undefined, unknown>(this.options.dtMinWidth, {
        transform: kbqOptionalNumberAttribute
    });

    /**
     * Minimum width retained for the `kbq-dd` area in pixels; defaults to the app-wide {@link KBQ_DL_OPTIONS}, then
     * to the rendered term width.
     */
    readonly ddMinWidth = input<number | undefined, unknown>(this.options.ddMinWidth, {
        transform: kbqOptionalNumberAttribute
    });

    /** Accessible name of the column resize separator; falls back to the localized default when omitted. */
    readonly resizerAriaLabel = input<string | undefined>(undefined);

    /** Vertical alignment of `kbq-dt` and `kbq-dd` items. Defaults to the app-wide {@link KBQ_DL_OPTIONS}. */
    readonly verticalAlign = input<KbqDlAlign>(this.options.verticalAlign);

    /** Horizontal alignment of `kbq-dt` and `kbq-dd` items. Defaults to the app-wide {@link KBQ_DL_OPTIONS}. */
    readonly horizontalAlign = input<KbqDlAlign>(this.options.horizontalAlign);

    /**
     * Forces the vertical layout; `null` lets the list decide based on `verticalBreakpoint`.
     * Defaults to the app-wide {@link KBQ_DL_OPTIONS}.
     */
    readonly vertical = input<boolean | null, unknown>(this.options.vertical, {
        // Not `booleanAttribute`: it would fold `null` — the "decide for me" state — into `false`.
        transform: (value: unknown) => optionalBooleanAttribute(value) ?? null
    });

    /** @docs-private */
    protected readonly resizeDirection = computed<KbqResizerDirection>(() =>
        this.directionality?.valueSignal() === 'rtl' ? [-1, 0] : [1, 0]
    );

    /** Host width as last measured; `null` until the list first has a box to measure. */
    private readonly hostWidth = signal<number | null>(null);

    /**
     * Auto-detected vertical layout. Derived from the measurement rather than written alongside it, so it
     * cannot go stale when `verticalBreakpoint` changes, and `null` means "not measured yet" rather than
     * doubling as "skipped the write".
     */
    private readonly autoVertical = computed(() => {
        const width = this.hostWidth();

        return width === null ? null : width <= this.verticalBreakpoint();
    });

    /** Effective vertical layout, combining the explicit `vertical` input and the auto-detection. @docs-private */
    protected readonly isVertical = computed(() => this.vertical() ?? this.autoVertical() ?? false);

    /** Whether the column resize separator is currently rendered. @docs-private */
    protected readonly resizerVisible = computed(() => this.resizable() && !this.isVertical());

    /** Whether `dtWidth` overrides the default column ratio. @docs-private */
    protected readonly resized = computed(() => this.dtWidth() !== null);

    /** Rendered term width used as the default minimum for both areas. */
    private readonly measuredDtWidth = signal(0);

    /** Effective minimum width of the `kbq-dt` area. */
    private readonly resolvedDtMinWidth = computed(() => this.dtMinWidth() ?? this.measuredDtWidth());

    /** Effective minimum width of the `kbq-dd` area. */
    private readonly resolvedDdMinWidth = computed(() => this.ddMinWidth() ?? this.measuredDtWidth());

    /** Minimum `kbq-dt` width, clamped to a non-negative value. @docs-private */
    protected readonly normalizedDtMinWidth = computed(() => Math.max(0, this.resolvedDtMinWidth()));

    /**
     * Host width the two areas share, without the gap between them; `null` until measured. The geometry is read at
     * the moments it can change, so change detection never forces a layout.
     */
    private readonly availableWidth = signal<number | null>(null);

    /** Rendered width of the resize track, which spans the `kbq-dt` area. */
    private readonly trackWidth = signal(0);

    /** Largest `kbq-dt` width that still leaves the `kbq-dd` area its minimum. @docs-private */
    protected readonly maxDtWidth = computed(() =>
        Math.max(this.normalizedDtMinWidth(), (this.availableWidth() ?? 0) - Math.max(0, this.resolvedDdMinWidth()))
    );

    /**
     * Current `kbq-dt` width, as the separator reports it: within `aria-valuemin` and `aria-valuemax`
     * even before the host is measured and the effect below clamps a bound `dtWidth`.
     *
     * @docs-private
     */
    protected readonly currentDtWidth = computed(() => {
        const width = this.dtWidth();

        return Math.round(
            width === null ? this.trackWidth() || this.normalizedDtMinWidth() : this.constrainDtWidth(width)
        );
    });

    /**
     * Cursor shown over the separator: it advertises not just that the column is resizable but the
     * direction still available — grow-only at the minimum width, shrink-only at the maximum, `default` when there is
     * no room to move the border at all.
     *
     * @docs-private
     */
    protected readonly resizeCursor = computed(() => {
        // The bounds are unknown until the host is measured.
        if (this.availableWidth() === null) return 'col-resize';

        const min = this.normalizedDtMinWidth();
        const max = this.maxDtWidth();

        // No room to move the border in either direction.
        if (max <= min) return 'default';

        const width = this.currentDtWidth();
        // `resizeDirection` is `[1, 0]` in LTR and `[-1, 0]` in RTL, so growing the column moves the pointer east in
        // LTR and west in RTL; the cursor mirrors accordingly.
        const ltr = this.resizeDirection()[0] > 0;

        if (width <= min) return ltr ? 'e-resize' : 'w-resize';
        if (width >= max) return ltr ? 'w-resize' : 'e-resize';

        return 'col-resize';
    });

    private readonly keyboardResizeStep: number = 8;

    private readonly nativeElement = kbqInjectNativeElement();
    private readonly window = inject(KBQ_WINDOW);
    private readonly destroyRef = inject(DestroyRef);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly directionality = inject(Directionality, { optional: true });
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly a11yLocaleConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'a11y',
        KBQ_A11Y_LOCALE_CONFIGURATION
    );
    private readonly resizeTrack = viewChild<ElementRef<HTMLElement>>('resizeTrack');
    private readonly resizeHandle = viewChild<ElementRef<HTMLElement>>('resizeHandle');
    private readonly terms = contentChildren(KbqDt, { read: ElementRef });

    /** Resolved accessible name of the resize separator. @docs-private */
    protected readonly resolvedResizerAriaLabel = computed(
        () => this.resizerAriaLabel() || this.a11yLocaleConfiguration().resizeColumns
    );

    constructor() {
        // `afterNextRender` runs in the browser only, so no explicit platform guard is needed here.
        afterNextRender(() => {
            // Decided before the first paint rather than on the first observation, which only arrives after it: a
            // list too narrow for the horizontal layout would show it for a frame and then jump.
            this.updateLayout();

            // Everything the layout decides is derived from this measurement, so nothing here has to re-run when an
            // input changes.
            this.resizeObserver
                .observe(this.nativeElement)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.updateLayout());
        });

        // The track can change width while the host keeps its size: when the separator appears, when `dtWidth`
        // returns to the default ratio, with `dtMinWidth`, which bounds the column at rest, and with `wide`, which
        // changes the number of columns.
        afterRenderEffect({
            read: () => {
                if (!this.resizeTrack()) return;

                this.resized();
                this.normalizedDtMinWidth();
                this.wide();

                untracked(() => this.measureResizeBounds());
            }
        });

        // The clamp is the one part that is not derived: `dtWidth` is writable by the consumer too, and its bounds
        // move with the inputs and the host. Written back, so the CSS variable, the track and `aria-valuenow` agree.
        effect(() => {
            const width = this.dtWidth();

            // Not before the layout is decided, which waits for the list to have a box: it renders horizontally until
            // then, so a list about to turn vertical would lose the bound width to the bounds of a layout it never shows.
            if (width === null || this.hostWidth() === null || this.availableWidth() === null || this.isVertical()) {
                return;
            }

            const constrainedWidth = this.constrainDtWidth(width);

            if (constrainedWidth !== width) untracked(() => this.writeDtWidth(constrainedWidth));
        });
    }

    /** Captures the rendered width of the term column, used as the default minimum when no widths are provided. */
    private measureDtWidth(): void {
        const term = this.terms()[0]?.nativeElement;

        // In the vertical layout a term spans the whole list, which is no measure of the term column.
        if (term && !this.isVertical()) this.measuredDtWidth.set(Math.round(term.getBoundingClientRect().width));
    }

    /** Reads the geometry the separator is bounded by. Browser-only: called after a render or on user interaction. */
    private measureResizeBounds(): void {
        const hostWidth = this.nativeElement.clientWidth;

        // A hidden list measures zero, and bounds of zero would clamp `dtWidth` to its minimum.
        if (!hostWidth) return;

        const columnGap = parseFloat(this.window.getComputedStyle(this.nativeElement).columnGap) || 0;

        this.availableWidth.set(hostWidth - columnGap);
        this.trackWidth.set(this.resizeTrack()?.nativeElement.clientWidth ?? 0);
    }

    /** @docs-private */
    protected handleDtResize({ width }: KbqResizerSizeChangeEvent): void {
        this.setDtWidth(width);
    }

    /**
     * Demotes the separator's focus origin to the pointer when a mouse drag starts, so the keyboard-focus frame
     * hides for the whole drag and does not linger afterwards. Keyboard focus keeps the frame as usual.
     *
     * @docs-private
     */
    protected handleResizeStart(): void {
        // The host keeps its size for the length of a drag, so the bounds are read once, not on every move.
        this.measureResizeBounds();

        const handle = this.resizeHandle()?.nativeElement;

        if (handle) this.focusMonitor.focusVia(handle, 'mouse');
    }

    /** @docs-private */
    protected handleResizeKeydown(event: KeyboardEvent): void {
        const { key } = event;

        if (key !== 'Home' && key !== 'End' && key !== 'ArrowLeft' && key !== 'ArrowRight') return;

        event.preventDefault();
        this.measureResizeBounds();

        const step = this.resizeDirection()[0] * this.keyboardResizeStep;

        if (key === 'Home') return this.setDtWidth(this.normalizedDtMinWidth());
        if (key === 'End') return this.setDtWidth(this.maxDtWidth());

        this.setDtWidth(this.currentDtWidth() + (key === 'ArrowRight' ? step : -step));
    }

    /** @docs-private */
    protected handleResizeDblClick(event: MouseEvent): void {
        event.preventDefault();
        this.measureResizeBounds();

        // First double-click collapses the first column to its minimum width; a second one restores the default ratio.
        if (this.dtWidth() === this.normalizedDtMinWidth()) {
            this.writeDtWidth(null);
        } else {
            this.setDtWidth(this.normalizedDtMinWidth());
        }
    }

    private updateLayout(): void {
        const domRect = this.nativeElement.getClientRects()[0];

        // A hidden list has no box. It keeps its last layout, so it does not jump when shown again at the same size.
        if (!domRect) return;

        // Taken before the new width can switch the layout. A list created hidden or vertical had no term column to
        // measure yet; the layout switch that gives it one changes the host height, which the observer reports.
        if (!this.measuredDtWidth()) this.measureDtWidth();

        this.hostWidth.set(domRect.width);
        this.measureResizeBounds();
    }

    private setDtWidth(width: number): void {
        if (!Number.isFinite(width)) return;

        const constrainedWidth = this.constrainDtWidth(width);

        if (constrainedWidth !== this.dtWidth()) this.writeDtWidth(constrainedWidth);
    }

    private constrainDtWidth(width: number): number {
        return Math.min(this.maxDtWidth(), Math.max(this.normalizedDtMinWidth(), width));
    }

    /**
     * The only way the component writes `dtWidth`. `linkedSignal` does not emit on its own the way
     * `model()` did, so the write and the notification are kept together rather than at each call site.
     */
    private writeDtWidth(width: number | null): void {
        this.dtWidth.set(width);
        this.dtWidthChange.emit(width);
    }
}

/**
 * @deprecated Use `KbqDl` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const KbqDlComponent = KbqDl;

/**
 * @deprecated Use `KbqDl` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export type KbqDlComponent = KbqDl;

/**
 * @deprecated Use `KbqDt` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const KbqDtComponent = KbqDt;

/**
 * @deprecated Use `KbqDt` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export type KbqDtComponent = KbqDt;

/**
 * @deprecated Use `KbqDd` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const KbqDdComponent = KbqDd;

/**
 * @deprecated Use `KbqDd` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export type KbqDdComponent = KbqDd;
