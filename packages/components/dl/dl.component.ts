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

/** Supported alignment values for description list items. */
export type KbqDlAlign = 'start' | 'center' | 'end';

@Component({
    selector: 'kbq-dl',
    imports: [KbqResizable, KbqResizer],
    template: `
        <ng-content />

        @if (resizerVisible()) {
            <div
                #resizeTrack
                class="kbq-dl__resize-track"
                kbqResizable
                [style.max-width.px]="columnWidth() !== null ? maxColumnWidth : null"
                [style.min-width.px]="columnWidth() !== null ? normalizedColumnMinWidth() : null"
                [style.width.px]="columnWidth()"
            >
                <div
                    class="kbq-dl__resize-handle"
                    role="separator"
                    aria-orientation="vertical"
                    tabindex="0"
                    cursor="col-resize"
                    [attr.aria-label]="resolvedResizerAriaLabel()"
                    [attr.aria-valuemax]="maxColumnWidth"
                    [attr.aria-valuemin]="normalizedColumnMinWidth()"
                    [attr.aria-valuenow]="currentColumnWidth"
                    [kbqResizer]="resizeDirection()"
                    (dblclick)="handleResizeDblClick($event)"
                    (keydown)="handleResizeKeydown($event)"
                    (sizeChange)="handleColumnResize($event)"
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
        '[class.kbq-dl_resized]': 'columnWidth() !== null',
        '[class.kbq-dl_vertical-align-center]': "verticalAlign() === 'center'",
        '[class.kbq-dl_vertical-align-end]': "verticalAlign() === 'end'",
        '[class.kbq-dl_horizontal-align-center]': "horizontalAlign() === 'center'",
        '[class.kbq-dl_horizontal-align-end]': "horizontalAlign() === 'end'",
        '[style.--kbq-description-list-column-width.px]': 'columnWidth()',
        '[style.--kbq-description-list-column-min-width.px]': 'normalizedColumnMinWidth()'
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
    readonly minWidth = input<number | undefined>();

    /** Whether the list uses the wide two-column layout. */
    readonly wide = input(false);

    /** Whether the columns can be resized by dragging the separator between them. */
    readonly columnResizable = input(false, { transform: booleanAttribute });

    /** Current width of the first (resizable) column in pixels; `null` restores the default column ratio. */
    readonly columnWidth = model<number | null>(null);

    /** Minimum width of the first (resizable) column in pixels. */
    readonly columnMinWidth = input(96, { transform: numberAttribute });

    /** Minimum width retained for the remaining column in pixels. */
    readonly remainingColumnMinWidth = input(160, { transform: numberAttribute });

    /** Accessible name of the column resize separator; falls back to the localized default when omitted. */
    readonly resizerAriaLabel = input<string | undefined>(undefined);

    /** Vertical alignment of `kbq-dt` and `kbq-dd` items. */
    readonly verticalAlign = input<KbqDlAlign>('start');

    /** Horizontal alignment of `kbq-dt` and `kbq-dd` items. */
    readonly horizontalAlign = input<KbqDlAlign>('start');

    /** Forces the vertical layout; `null` lets the list decide based on `verticalBreakpoint`. */
    readonly vertical = input<boolean | null>(null);

    /** @docs-private */
    protected readonly resizeDirection = signal<KbqResizerDirection>([1, 0]);

    /** Auto-detected vertical layout, re-evaluated from the host width on resize while `vertical` is not set. */
    private readonly autoVertical = signal<boolean | null>(null);

    /** @docs-private Effective vertical layout, combining the explicit `vertical` input and the auto-detection. */
    protected readonly isVertical = computed(() => this.vertical() ?? this.autoVertical() ?? false);

    /** @docs-private Whether the column resize separator is currently rendered. */
    protected readonly resizerVisible = computed(() => this.columnResizable() && !this.isVertical());

    /** @docs-private Term column minimum width, clamped to a non-negative value. */
    protected readonly normalizedColumnMinWidth = computed(() => Math.max(0, this.columnMinWidth()));

    protected get maxColumnWidth(): number {
        if (!this.platform.isBrowser) return this.normalizedColumnMinWidth();

        const hostWidth = this.nativeElement.clientWidth;
        const columnGap = parseFloat(this.window.getComputedStyle(this.nativeElement).columnGap) || 0;

        return Math.max(
            this.normalizedColumnMinWidth(),
            hostWidth - columnGap - Math.max(0, this.remainingColumnMinWidth())
        );
    }

    protected get currentColumnWidth(): number {
        if (!this.platform.isBrowser) return this.normalizedColumnMinWidth();

        return Math.round(this.resizeTrack()?.nativeElement.clientWidth || this.normalizedColumnMinWidth());
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
    private readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();
    private readonly resizeTrack = viewChild<ElementRef<HTMLElement>>('resizeTrack');

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
            this.resizeObserver
                .observe(this.nativeElement)
                .pipe(startWith(null), debounceTime(this.resizeDebounceInterval), takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.updateLayout());
        });
    }

    /** @docs-private */
    protected handleColumnResize({ width }: KbqResizerSizeChangeEvent): void {
        this.setColumnWidth(width);
    }

    /** @docs-private */
    protected handleResizeKeydown(event: KeyboardEvent): void {
        let width: number | null = null;

        if (event.key === 'Home') width = this.normalizedColumnMinWidth();
        if (event.key === 'End') width = this.maxColumnWidth;

        if (event.key === 'ArrowLeft') {
            width = this.currentColumnWidth - this.resizeDirection()[0] * this.keyboardResizeStep;
        }

        if (event.key === 'ArrowRight') {
            width = this.currentColumnWidth + this.resizeDirection()[0] * this.keyboardResizeStep;
        }

        if (width === null) return;

        event.preventDefault();
        this.setColumnWidth(width);
    }

    /** @docs-private */
    protected handleResizeDblClick(event: MouseEvent): void {
        event.preventDefault();

        // First double-click collapses the first column to its minimum width; a second one restores the default ratio.
        if (this.columnWidth() === this.normalizedColumnMinWidth()) {
            this.columnWidth.set(null);
        } else {
            this.setColumnWidth(this.normalizedColumnMinWidth());
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

        if (this.columnWidth() !== null && !this.isVertical()) this.setColumnWidth(this.columnWidth()!);

        // Signal writes above already schedule change detection, but `maxColumnWidth` and `currentColumnWidth` read
        // live layout geometry rather than signals: a resize changes their values without touching any signal, so the
        // OnPush view must be told to re-check for the `aria-valuemax`/`aria-valuenow`/track-size bindings to refresh.
        this.changeDetectorRef.markForCheck();
    }

    private setColumnWidth(width: number): void {
        if (!Number.isFinite(width)) return;

        const constrainedWidth = Math.min(this.maxColumnWidth, Math.max(this.normalizedColumnMinWidth(), width));

        if (constrainedWidth !== this.columnWidth()) this.columnWidth.set(constrainedWidth);
    }

    private updateResizeDirection(direction: Direction | undefined): void {
        this.resizeDirection.set(direction === 'rtl' ? [-1, 0] : [1, 0]);
    }
}

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
