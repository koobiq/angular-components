import { CdkMonitorFocus, FocusMonitor } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChildren,
    DestroyRef,
    ElementRef,
    inject,
    input,
    model,
    numberAttribute,
    signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_WINDOW, kbqInjectA11yLocaleConfiguration, kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqResizable, KbqResizer, KbqResizerDirection, KbqResizerSizeChangeEvent } from '@koobiq/components/resizer';
import { debounceTime, startWith } from 'rxjs/operators';

/** Coerces an optional numeric input, keeping `undefined` distinguishable from `0`. */
const optionalNumberAttribute = (value: unknown): number | undefined =>
    value == null ? undefined : numberAttribute(value);

/** Supported alignment values for description list items. */
export type KbqDlAlign = 'start' | 'center' | 'end';

@Component({
    selector: 'kbq-dt',
    template: '<ng-content />',
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-dt'
    }
})
export class KbqDtComponent {}

@Component({
    selector: 'kbq-dd',
    template: '<ng-content />',
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-dd'
    }
})
export class KbqDdComponent {}

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
                [style.max-width.px]="dtWidth() !== null ? maxDtWidth : null"
                [style.min-width.px]="dtWidth() !== null ? normalizedDtMinWidth() : null"
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
                    [attr.aria-valuemax]="maxDtWidth"
                    [attr.aria-valuemin]="normalizedDtMinWidth()"
                    [attr.aria-valuenow]="currentDtWidth"
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
        '[class.kbq-dl_resized]': 'dtWidth() !== null',
        '[class.kbq-dl_vertical-align-center]': "verticalAlign() === 'center'",
        '[class.kbq-dl_vertical-align-end]': "verticalAlign() === 'end'",
        '[class.kbq-dl_horizontal-align-center]': "horizontalAlign() === 'center'",
        '[class.kbq-dl_horizontal-align-end]': "horizontalAlign() === 'end'",
        '[style.--kbq-description-list-dt-width.px]': 'dtWidth()',
        '[style.--kbq-description-list-dt-min-width.px]': 'normalizedDtMinWidth()'
    }
})
export class KbqDlComponent {
    /** Host width in pixels at or below which the list auto-switches to the vertical layout. */
    readonly verticalBreakpoint = input(400, { transform: numberAttribute });

    /**
     * Host width in pixels at or below which the list auto-switches to the vertical layout.
     * @deprecated The name is misleading (it is a breakpoint, not a min width). Use `verticalBreakpoint` instead.
     * Will be removed in a future major release. When both are set, `minWidth` takes precedence.
     */
    readonly minWidth = input<number | undefined, unknown>(undefined, { transform: optionalNumberAttribute });

    /** Whether the list uses the wide two-column layout. */
    readonly wide = input(false, { transform: booleanAttribute });

    /** Whether the `kbq-dt` area can be resized by dragging the separator. */
    readonly resizable = input(false, { transform: booleanAttribute });

    /** Width of the `kbq-dt` area in pixels; `null` restores the default column ratio. */
    readonly dtWidth = model<number | null>(null);

    /** Minimum width of the `kbq-dt` area in pixels; defaults to the rendered term width. */
    readonly dtMinWidth = input<number | undefined, unknown>(undefined, { transform: optionalNumberAttribute });

    /** Minimum width retained for the `kbq-dd` area in pixels; defaults to the rendered term width. */
    readonly ddMinWidth = input<number | undefined, unknown>(undefined, { transform: optionalNumberAttribute });

    /** Accessible name of the column resize separator; falls back to the localized default when omitted. */
    readonly resizerAriaLabel = input<string | undefined>(undefined);

    /** Vertical alignment of `kbq-dt` and `kbq-dd` items. */
    readonly verticalAlign = input<KbqDlAlign>('start');

    /** Horizontal alignment of `kbq-dt` and `kbq-dd` items. */
    readonly horizontalAlign = input<KbqDlAlign>('start');

    /** Forces the vertical layout; `null` lets the list decide based on `verticalBreakpoint`. */
    readonly vertical = input<boolean | null, unknown>(null, {
        // Not `booleanAttribute`: it would fold `null` — the "decide for me" state — into `false`.
        transform: (value) => (value == null ? null : booleanAttribute(value))
    });

    /** @docs-private */
    protected readonly resizeDirection = signal<KbqResizerDirection>([1, 0]);

    /**
     * @docs-private
     * Cursor shown over the separator: it advertises not just that the column is resizable but the
     * direction still available — grow-only at the minimum width, shrink-only at the maximum, `default` when there is
     * no room to move the border at all.
     */
    protected readonly resizeCursor = signal<string>('col-resize');

    /** Auto-detected vertical layout, re-evaluated from the host width on resize while `vertical` is not set. */
    private readonly autoVertical = signal<boolean | null>(null);

    /** @docs-private Effective vertical layout, combining the explicit `vertical` input and the auto-detection. */
    protected readonly isVertical = computed(() => this.vertical() ?? this.autoVertical() ?? false);

    /** @docs-private Whether the column resize separator is currently rendered. */
    protected readonly resizerVisible = computed(() => this.resizable() && !this.isVertical());

    /** Rendered term width used as the default minimum for both areas. */
    private readonly measuredDtWidth = signal(0);

    /** Effective minimum width of the `kbq-dt` area. */
    private readonly resolvedDtMinWidth = computed(() => this.dtMinWidth() ?? this.measuredDtWidth());

    /** Effective minimum width of the `kbq-dd` area. */
    private readonly resolvedDdMinWidth = computed(() => this.ddMinWidth() ?? this.measuredDtWidth());

    /** @docs-private Minimum `kbq-dt` width, clamped to a non-negative value. */
    protected readonly normalizedDtMinWidth = computed(() => Math.max(0, this.resolvedDtMinWidth()));

    protected get maxDtWidth(): number {
        if (!this.platform.isBrowser) return this.normalizedDtMinWidth();

        const hostWidth = this.nativeElement.clientWidth;
        const columnGap = parseFloat(this.window.getComputedStyle(this.nativeElement).columnGap) || 0;

        return Math.max(this.normalizedDtMinWidth(), hostWidth - columnGap - Math.max(0, this.resolvedDdMinWidth()));
    }

    protected get currentDtWidth(): number {
        if (!this.platform.isBrowser) return this.normalizedDtMinWidth();

        return Math.round(this.resizeTrack()?.nativeElement.clientWidth || this.normalizedDtMinWidth());
    }

    private readonly resizeDebounceInterval: number = 100;
    private readonly keyboardResizeStep: number = 8;

    private readonly nativeElement = kbqInjectNativeElement();
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly platform = inject(Platform);
    private readonly window = inject(KBQ_WINDOW);
    private readonly destroyRef = inject(DestroyRef);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly directionality = inject(Directionality, { optional: true });
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();
    private readonly resizeTrack = viewChild<ElementRef<HTMLElement>>('resizeTrack');
    private readonly resizeHandle = viewChild<ElementRef<HTMLElement>>('resizeHandle');
    private readonly terms = contentChildren(KbqDtComponent, { read: ElementRef });

    /** @docs-private Resolved accessible name of the resize separator. */
    protected readonly resolvedResizerAriaLabel = computed(
        () => this.resizerAriaLabel() || this.a11yLocaleConfiguration().resizeColumns
    );

    constructor() {
        this.updateResizeDirection(this.directionality?.value);
        this.directionality?.change.pipe(takeUntilDestroyed()).subscribe((direction) => {
            this.updateResizeDirection(direction);
        });

        // `afterNextRender` runs in the browser only, so no explicit platform guard is needed here.
        afterNextRender(() => {
            this.measureDtWidth();

            this.resizeObserver
                .observe(this.nativeElement)
                .pipe(startWith(null), debounceTime(this.resizeDebounceInterval), takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.updateLayout());
        });
    }

    /** Captures the rendered width of the term column, used as the default minimum when no widths are provided. */
    private measureDtWidth(): void {
        const term = this.terms()[0]?.nativeElement;

        if (term) this.measuredDtWidth.set(Math.round(term.getBoundingClientRect().width));
    }

    /** @docs-private */
    protected handleDtResize({ width }: KbqResizerSizeChangeEvent): void {
        this.setDtWidth(width);
    }

    /**
     * @docs-private
     * Demotes the separator's focus origin to the pointer when a mouse drag starts, so the keyboard-focus frame
     * hides for the whole drag and does not linger afterwards. Keyboard focus keeps the frame as usual.
     */
    protected handleResizeStart(): void {
        const handle = this.resizeHandle()?.nativeElement;

        if (handle) this.focusMonitor.focusVia(handle, 'mouse');
    }

    /** @docs-private */
    protected handleResizeKeydown(event: KeyboardEvent): void {
        let width: number | null = null;

        if (event.key === 'Home') width = this.normalizedDtMinWidth();
        if (event.key === 'End') width = this.maxDtWidth;

        if (event.key === 'ArrowLeft') {
            width = this.currentDtWidth - this.resizeDirection()[0] * this.keyboardResizeStep;
        }

        if (event.key === 'ArrowRight') {
            width = this.currentDtWidth + this.resizeDirection()[0] * this.keyboardResizeStep;
        }

        if (width === null) return;

        event.preventDefault();
        this.setDtWidth(width);
    }

    /** @docs-private */
    protected handleResizeDblClick(event: MouseEvent): void {
        event.preventDefault();

        // First double-click collapses the first column to its minimum width; a second one restores the default ratio.
        if (this.dtWidth() === this.normalizedDtMinWidth()) {
            this.dtWidth.set(null);
            this.resizeCursor.set('col-resize');
        } else {
            this.setDtWidth(this.normalizedDtMinWidth());
        }
    }

    private updateLayout(): void {
        // While `vertical` is not set explicitly, re-evaluate the layout against the breakpoint on every resize.
        if (this.vertical() === null) {
            const domRect = this.nativeElement.getClientRects()[0];
            const width = domRect?.width || 0;
            // `minWidth` is the deprecated alias of `verticalBreakpoint`; honor it when a consumer still sets it.
            const breakpoint = this.minWidth() ?? this.verticalBreakpoint();

            this.autoVertical.set(width <= breakpoint);
        }

        if (this.dtWidth() !== null && !this.isVertical()) this.setDtWidth(this.dtWidth()!);

        this.updateResizeCursor();

        // Signal writes above already schedule change detection, but `maxDtWidth` and `currentDtWidth` read
        // live layout geometry rather than signals: a resize changes their values without touching any signal, so the
        // OnPush view must be told to re-check for the `aria-valuemax`/`aria-valuenow`/track-size bindings to refresh.
        this.changeDetectorRef.markForCheck();
    }

    private setDtWidth(width: number): void {
        if (!Number.isFinite(width)) return;

        const constrainedWidth = Math.min(this.maxDtWidth, Math.max(this.normalizedDtMinWidth(), width));

        this.updateResizeCursor(constrainedWidth);

        if (constrainedWidth !== this.dtWidth()) this.dtWidth.set(constrainedWidth);
    }

    /** Refreshes the separator cursor to reflect the direction the border can still move from the given width. */
    private updateResizeCursor(width: number = this.currentDtWidth): void {
        if (!this.platform.isBrowser) return;

        const min = this.normalizedDtMinWidth();
        const max = this.maxDtWidth;

        // No room to move the border in either direction.
        if (max <= min) return this.resizeCursor.set('default');

        // `resizeDirection` is `[1, 0]` in LTR and `[-1, 0]` in RTL, so growing the column moves the pointer east in
        // LTR and west in RTL; the cursor mirrors accordingly.
        const growCursor = this.resizeDirection()[0] > 0 ? 'e-resize' : 'w-resize';
        const shrinkCursor = this.resizeDirection()[0] > 0 ? 'w-resize' : 'e-resize';

        if (width <= min) return this.resizeCursor.set(growCursor);
        if (width >= max) return this.resizeCursor.set(shrinkCursor);

        this.resizeCursor.set('col-resize');
    }

    private updateResizeDirection(direction: Direction | undefined): void {
        this.resizeDirection.set(direction === 'rtl' ? [-1, 0] : [1, 0]);
    }
}
