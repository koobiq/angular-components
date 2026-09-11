import { _IdGenerator, CdkMonitorFocus, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import {
    afterNextRender,
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
    InputSignal,
    model,
    ModelSignal,
    numberAttribute,
    Provider,
    Signal,
    signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    hasModifierKey,
    KBQ_WINDOW,
    kbqInjectA11yLocaleConfiguration,
    kbqInjectNativeElement
} from '@koobiq/components/core';
import { KbqResizable, KbqResizer, KbqResizerDirection, KbqResizerSizeChangeEvent } from '@koobiq/components/resizer';
import { startWith } from 'rxjs/operators';

/** Direction the panels of a splitter are laid out in. */
export type KbqSplitterOrientation = 'horizontal' | 'vertical';

/**
 * How a splitter draws its separators.
 *
 * - `divider` — a line between the panels, the default.
 * - `transparent` — nothing until the pointer reaches the separator, which then gives itself away by the cursor.
 * - `handle` — a grip centred on the boundary.
 */
export type KbqSplitterAppearance = 'divider' | 'transparent' | 'handle';

/**
 * Size of a splitter panel: a number of pixels, a `<number>px` string, or a `<number>%` share of the
 * splitter's own size along the resize axis.
 */
export type KbqSplitterSize = number | string;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

/**
 * Resolves a declared size against the splitter's own size along the resize axis.
 *
 * Numbers and `<number>px` strings are pixels, `<number>%` is a share of `total`. Returns `null` for a
 * size that is not set or cannot be parsed — which is how a panel says "take whatever is left".
 *
 * @docs-private
 */
export function resolveSplitterSize(size: KbqSplitterSize | null | undefined, total: number): number | null {
    if (size === null || size === undefined) return null;

    if (typeof size === 'number') return Number.isFinite(size) ? size : null;

    const trimmed = size.trim();
    const value = parseFloat(trimmed);

    if (!Number.isFinite(value)) return null;

    return trimmed.endsWith('%') ? (value / 100) * total : value;
}

/**
 * Clamps every panel to its own limits and then spends whatever that left over, so the sizes add up to
 * `total` again.
 *
 * The residual is handed out in passes rather than in one proportional step: a panel that reaches a limit
 * mid-pass stops taking, and the next pass shares what it refused among the panels that still have room.
 * At most one pass per panel can end that way, so the loop is bounded by the panel count.
 *
 * @docs-private
 */
export function fitSplitterSizes(
    sizes: readonly number[],
    min: readonly number[],
    max: readonly number[],
    total: number
): number[] {
    const next = sizes.map((size, index) => clamp(size, min[index], max[index]));

    for (let pass = 0; pass <= next.length; pass++) {
        const diff = total - sumOf(next);

        if (Math.abs(diff) < EPSILON) break;

        const open = next.reduce<number[]>(
            (indices, size, index) =>
                (diff > 0 ? size < max[index] : size > min[index]) ? [...indices, index] : indices,
            []
        );

        if (!open.length) break;

        const step = diff / open.length;

        open.forEach((index) => (next[index] = clamp(next[index] + step, min[index], max[index])));
    }

    return next;
}

/**
 * Moves the boundary that follows `index` by `delta` pixels and returns the new sizes.
 *
 * The panels on one side of the boundary take the delta and the ones on the other side give it up, each walking
 * outwards from the boundary: a panel sitting at its limit hands the remainder to the next one instead of
 * stopping the drag. Walking outwards on the taking side too is what keeps a boundary reachable when the panel
 * right beside it is pinned — otherwise a neighbour at its maximum would freeze a boundary that the panels
 * further out could still move, and the drag would do nothing at all.
 */
export function resizeSplitterSizesAt(
    sizes: readonly number[],
    index: number,
    delta: number,
    min: readonly number[],
    max: readonly number[]
): number[] {
    const next = [...sizes];

    if (index < 0 || index >= sizes.length - 1) return next;

    // Nearest to the boundary first, so the panel beside it always absorbs as much as it can before the next.
    const leading = Array.from({ length: index + 1 }, (_, offset) => index - offset);
    const trailing = Array.from({ length: sizes.length - index - 1 }, (_, offset) => index + 1 + offset);
    const growing = delta > 0;
    const roomOf = (indices: number[], grow: boolean) =>
        indices.reduce((room, panel) => room + (grow ? max[panel] - sizes[panel] : sizes[panel] - min[panel]), 0);

    // The boundary travels as far as the tighter of its two sides allows.
    const travel = Math.min(Math.abs(delta), roomOf(leading, growing), roomOf(trailing, !growing));

    const spend = (indices: number[], grow: boolean) => {
        let remaining = travel;

        for (const panel of indices) {
            if (remaining <= EPSILON) break;

            const taken = Math.min(remaining, grow ? max[panel] - sizes[panel] : sizes[panel] - min[panel]);

            next[panel] = sizes[panel] + (grow ? taken : -taken);
            remaining -= taken;
        }
    };

    spend(leading, growing);
    spend(trailing, !growing);

    return next;
}

/** A size a drag is pulled onto, with the distance the release has to be within for the pull to happen. */
export type KbqSplitterSnapPoint = { size: number; tolerance: number };

/**
 * Snaps a target size onto the nearest snap point it is close enough to, or returns it unchanged.
 *
 * Each point carries its own tolerance, because the panels around a separator both contribute points and each
 * of them says how far its own pull reaches. Two points exactly as close as one another are settled by
 * declaration order, so a target sitting midway between them picks the same one however it got there.
 *
 * @docs-private
 */
export function snapSplitterSize(target: number, snapPoints: readonly KbqSplitterSnapPoint[]): number {
    let snapped = target;
    let closest = Number.POSITIVE_INFINITY;

    for (const { size, tolerance } of snapPoints) {
        if (!Number.isFinite(size)) continue;

        const distance = Math.abs(size - target);

        if (distance > tolerance || distance >= closest) continue;

        closest = distance;
        snapped = size;
    }

    return snapped;
}

/** How far one arrow key press moves a separator, in pixels. */
const KEYBOARD_STEP = 8;

/** Sizes closer than this are the same size. */
const EPSILON = 0.01;

const sumOf = (sizes: readonly number[]): number => sizes.reduce((sum, size) => sum + size, 0);

/**
 * Settings a whole application shares, rather than something a single splitter decides.
 *
 * Only what a product picks once belongs here: how its separators look, and how far a snap size reaches. The
 * sizes and limits of the panels are a property of one layout and stay on the panels themselves.
 */
export type KbqSplitterOptions = {
    /** How the separators are drawn. */
    appearance: KbqSplitterAppearance;
    /** How close to a snap size a drag has to be released for it to be pulled in, in pixels. */
    snapTolerance: number;
};

const KBQ_SPLITTER_DEFAULT_OPTIONS: KbqSplitterOptions = {
    appearance: 'divider',
    snapTolerance: 32
};

/** Injection token holding the current {@link KbqSplitterOptions}. */
export const KBQ_SPLITTER_OPTIONS = new InjectionToken<KbqSplitterOptions>('KBQ_SPLITTER_OPTIONS', {
    factory: () => KBQ_SPLITTER_DEFAULT_OPTIONS
});

/**
 * Overrides the default splitter options within the given injector scope — the whole application from
 * `bootstrapApplication`, or one subtree from the `providers` of a component or a route.
 */
export function kbqSplitterOptionsProvider(options: Partial<KbqSplitterOptions>): Provider {
    return {
        provide: KBQ_SPLITTER_OPTIONS,
        useValue: { ...KBQ_SPLITTER_DEFAULT_OPTIONS, ...options }
    };
}

/**
 * The part of a panel that its splitter and its own separator read.
 *
 * @docs-private
 */
export interface KbqSplitterPanelRef {
    readonly id: Signal<string>;
    readonly element: HTMLElement;
    readonly size: InputSignal<KbqSplitterSize | undefined>;
    readonly minSize: InputSignal<KbqSplitterSize | undefined>;
    readonly maxSize: InputSignal<KbqSplitterSize | undefined>;
    readonly snapSizes: InputSignal<readonly KbqSplitterSize[]>;
    readonly snapTolerance: Signal<number>;
    readonly collapsible: Signal<boolean>;
    readonly collapsedSize: InputSignal<KbqSplitterSize>;
    readonly collapsed: ModelSignal<boolean>;
}

/**
 * The part of a splitter its panels read. Panels are projected content, so they reach the group through this
 * token rather than through its class.
 *
 * @docs-private
 */
export interface KbqSplitterGroup {
    readonly orientation: Signal<KbqSplitterOrientation>;
    readonly disabled: Signal<boolean>;
    readonly panels: Signal<readonly KbqSplitterPanelRef[]>;
    /** Direction the separator of the panel at `index` resizes in; `[0, 0]` while the splitter is disabled. */
    readonly resizerDirection: Signal<KbqResizerDirection>;
    /** Cursor for the separator of the panel at `index`, reflecting the room its boundary still has. */
    separatorCursor(index: number): string;
    /** `aria-valuenow` / `aria-valuemin` / `aria-valuemax` of the separator, as percentages of the splitter. */
    separatorValues(index: number): { now: number; min: number; max: number };
    handleResizeStart(index: number): void;
    handleResizeTo(index: number, size: number): void;
    handleResizeEnd(): void;
    handleSeparatorKeydown(index: number, event: KeyboardEvent): void;
    handleSeparatorDblClick(index: number): void;
}

/**
 * Contract a {@link KbqSplitterPanel} resolves to reach the splitter that projects it.
 *
 * @docs-private
 */
export const KBQ_SPLITTER = new InjectionToken<KbqSplitterGroup>('KBQ_SPLITTER');

/**
 * A resizable region of a {@link KbqSplitter}.
 *
 * Every panel but the last renders the separator that follows it, so the separator sits between the two
 * panels it resizes in the tab order as well as on screen.
 */
@Component({
    selector: 'kbq-splitter-panel',
    imports: [KbqResizer, CdkMonitorFocus],
    template: `
        <div class="kbq-splitter-panel__content">
            <ng-content />
        </div>

        @if (!last()) {
            <div
                #separator
                cdkMonitorElementFocus
                class="kbq-splitter-panel__separator"
                role="separator"
                [attr.aria-controls]="id()"
                [attr.aria-disabled]="disabled() || null"
                [attr.aria-label]="resolvedSeparatorAriaLabel()"
                [attr.aria-orientation]="separatorOrientation()"
                [attr.aria-valuemax]="separatorValues().max"
                [attr.aria-valuemin]="separatorValues().min"
                [attr.aria-valuenow]="separatorValues().now"
                [attr.tabindex]="disabled() ? -1 : 0"
                [cursor]="separatorCursor()"
                [disableSizeUpdate]="true"
                [kbqResizer]="splitter.resizerDirection()"
                (dblclick)="handleSeparatorDblClick($event)"
                (keydown)="handleSeparatorKeydown($event)"
                (lostpointercapture)="splitter.handleResizeEnd()"
                (resizeStart)="handleResizeStart($event)"
                (sizeChange)="handleSizeChange($event)"
            ></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-splitter-panel',
        tabindex: '-1',
        '[attr.id]': 'id()',
        '[class.kbq-splitter-panel_collapsed]': 'collapsed()'
    },
    hostDirectives: [KbqResizable],
    exportAs: 'kbqSplitterPanel'
})
export class KbqSplitterPanel implements KbqSplitterPanelRef {
    /** @docs-private */
    protected readonly splitter = inject(KBQ_SPLITTER);
    private readonly options = inject(KBQ_SPLITTER_OPTIONS);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    /** @docs-private */
    readonly element = kbqInjectNativeElement();

    /**
     * Identifies the panel to the `aria-controls` of its own separator, and gives a host something to point
     * `aria-labelledby` or a fragment link at. Generated when omitted.
     */
    readonly id = input<string>(inject(_IdGenerator).getId('kbq-splitter-panel-'));

    /**
     * Size the panel starts at, in pixels (`240`, `'240px'`) or as a share of the splitter (`'30%'`).
     * Panels that leave it unset share whatever the sized ones did not claim.
     */
    readonly size = input<KbqSplitterSize | undefined>(undefined);

    /** Smallest size the panel may be dragged to. Defaults to `0`. */
    readonly minSize = input<KbqSplitterSize | undefined>(undefined);

    /** Largest size the panel may be dragged to. Unbounded when omitted. */
    readonly maxSize = input<KbqSplitterSize | undefined>(undefined);

    /**
     * Sizes a drag is pulled onto when it is released near one. `minSize` and `maxSize` become snap points too
     * as soon as either panel around a separator declares any snap size.
     *
     * The layout the panels start at settles onto them as well, so a splitter is never handed to the user
     * sitting between two of its own snap points.
     */
    readonly snapSizes = input<readonly KbqSplitterSize[]>([]);

    /**
     * How close to one of this panel's {@link snapSizes} a drag has to be released for it to be pulled in, in
     * pixels. Raise it to make the snap points reach further — past half the gap between two of them the panel
     * can only ever land on a snap size.
     *
     * Defaults to the app-wide {@link KBQ_SPLITTER_OPTIONS}.
     */
    readonly snapTolerance = input(this.options.snapTolerance, { transform: numberAttribute });

    /**
     * Whether dragging the panel past half of its `minSize` collapses it to `collapsedSize` instead of
     * stopping at the minimum.
     */
    readonly collapsible = input(false, { transform: booleanAttribute });

    /** Size the panel takes while collapsed. `0` — the default — hides it completely. */
    readonly collapsedSize = input<KbqSplitterSize>(0);

    /**
     * Whether the panel is collapsed. Two-way, so a host can collapse and restore the panel itself — which is
     * the only way back for a panel whose `collapsedSize` is `0` and which therefore has no separator to grab.
     */
    readonly collapsed = model(false);

    /** Accessible name of the separator that follows the panel; falls back to the localized default. */
    readonly separatorAriaLabel = input<string | undefined>(undefined);

    /** The panel's own separator; a subtree search would find a nested splitter's separators first. */
    private readonly separator = viewChild<ElementRef<HTMLElement>>('separator');

    /** @docs-private */
    protected readonly index = computed(() => this.splitter.panels().indexOf(this));

    /**
     * @docs-private
     * Whether the panel renders no separator. The last panel has nothing after it to resize against, and a
     * panel that reached the splitter through the element injector without being one of its content children —
     * a wrapper element or another component's template stands between them — has no place in the group at
     * all, so it must not offer a handle whose ARIA values would resolve against an index of `-1`.
     */
    protected readonly last = computed(() => {
        const index = this.index();

        return index === -1 || index === this.splitter.panels().length - 1;
    });

    /** @docs-private */
    protected readonly disabled = computed(() => this.splitter.disabled());

    /** @docs-private A separator is oriented across the axis its splitter lays panels out along. */
    protected readonly separatorOrientation = computed(() =>
        this.splitter.orientation() === 'horizontal' ? 'vertical' : 'horizontal'
    );

    /** @docs-private */
    protected readonly separatorCursor = computed(() => this.splitter.separatorCursor(this.index()));

    /** @docs-private */
    protected readonly separatorValues = computed(() => this.splitter.separatorValues(this.index()));

    /** @docs-private */
    protected readonly resolvedSeparatorAriaLabel = computed(
        () => this.separatorAriaLabel() || this.a11yLocaleConfiguration().resizePanels
    );

    /**
     * @docs-private
     * Demotes the separator's focus origin to the pointer when a drag starts, so the keyboard-focus frame
     * stays hidden for the whole drag and does not linger afterwards. Keyboard focus keeps the frame.
     *
     * `preventScroll` because half of the separator reaches past the panel it belongs to: once the panel beyond
     * it is collapsed to nothing, that half hangs outside the splitter itself, and revealing it would scroll
     * whatever clipping box the splitter sits in — leaving the panels shifted by half a hit area, with a blank
     * strip along the edge that nothing scrolls back.
     */
    protected handleResizeStart(_event: KbqResizerSizeChangeEvent): void {
        const separator = this.separator();

        if (separator) this.focusMonitor.focusVia(separator.nativeElement, 'mouse', { preventScroll: true });

        this.splitter.handleResizeStart(this.index());
    }

    /** @docs-private */
    protected handleSizeChange({ width, height }: KbqResizerSizeChangeEvent): void {
        this.splitter.handleResizeTo(this.index(), this.splitter.orientation() === 'horizontal' ? width : height);
    }

    /** @docs-private */
    protected handleSeparatorKeydown(event: KeyboardEvent): void {
        this.splitter.handleSeparatorKeydown(this.index(), event);
    }

    /** @docs-private */
    protected handleSeparatorDblClick(event: MouseEvent): void {
        event.preventDefault();
        this.splitter.handleSeparatorDblClick(this.index());
    }
}

/**
 * Splits an area into panels the user can resize by dragging the separators between them.
 *
 * Panels must be direct children of the splitter — a wrapper element around them hides them from the group.
 *
 * @example
 * ```html
 * <kbq-splitter>
 *     <kbq-splitter-panel [minSize]="100">…</kbq-splitter-panel>
 *     <kbq-splitter-panel>…</kbq-splitter-panel>
 * </kbq-splitter>
 * ```
 */
@Component({
    selector: 'kbq-splitter',
    template: '<ng-content />',
    styleUrls: ['splitter.scss', 'splitter-tokens.scss'],
    providers: [{ provide: KBQ_SPLITTER, useExisting: KbqSplitter }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-splitter',
        '[class.kbq-splitter_vertical]': "orientation() === 'vertical'",
        '[class.kbq-splitter_disabled]': 'disabled()',
        '[class.kbq-splitter_dragging]': 'dragging()',
        '[class.kbq-splitter_transparent]': "appearance() === 'transparent'",
        '[class.kbq-splitter_handle]': "appearance() === 'handle'",
        '[style.grid-template-columns]': "orientation() === 'horizontal' ? gridTemplate() : null",
        '[style.grid-template-rows]': "orientation() === 'vertical' ? gridTemplate() : null"
    },
    exportAs: 'kbqSplitter'
})
export class KbqSplitter implements KbqSplitterGroup {
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly destroyRef = inject(DestroyRef);
    private readonly platform = inject(Platform);
    private readonly window = inject(KBQ_WINDOW);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly directionality = inject(Directionality, { optional: true });
    private readonly options = inject(KBQ_SPLITTER_OPTIONS);

    /** Direction the panels are laid out in. */
    readonly orientation = input<KbqSplitterOrientation>('horizontal');

    /** How the separators are drawn. Defaults to the app-wide {@link KBQ_SPLITTER_OPTIONS}. */
    readonly appearance = input<KbqSplitterAppearance>(this.options.appearance);

    /** Whether the panels can be resized at all. */
    readonly disabled = input(false, { transform: booleanAttribute });

    /**
     * Sizes of the panels as percentages of the splitter, in panel order.
     *
     * Two-way and, while `null`, derived from what the panels declare — so a host reads it to persist a
     * layout, writes it to restore one, and shares the same signal between two splitters to keep their panels
     * the same width. Setting it back to `null` returns the panels to their declared sizes.
     */
    readonly layout = model<number[] | null>(null);

    /** @docs-private */
    readonly panels = contentChildren(KbqSplitterPanel, { descendants: false });

    /** Boundary a drag is moving right now, or `null` when no drag is in progress. */
    private readonly dragBoundary = signal<number | null>(null);

    /** @docs-private Whether a separator is being dragged right now. */
    protected readonly dragging = computed(() => this.dragBoundary() !== null);

    /** Splitter size along the resize axis, in pixels; `0` until the first measurement. */
    private readonly containerSize = signal(0);

    /** Sizes and layout captured when the drag began; every move is measured against these, so clamping cannot drift. */
    private dragSnapshot: { index: number; sizes: number[]; total: number; layout: number[] | null } | null = null;

    // `valueSignal` rather than the plain `value` getter: the getter is not reactive, so a `dir` flipped at
    // runtime would leave every computed below it holding the direction the app booted with.
    private readonly rtl = computed(() => this.directionality?.valueSignal() === 'rtl');

    /** @docs-private A disabled splitter reports no direction, which is how `KbqResizer` ignores a drag. */
    readonly resizerDirection = computed<KbqResizerDirection>(() => {
        if (this.disabled()) return [0, 0];
        if (this.orientation() === 'vertical') return [0, 1];

        // In RTL the first panel sits on the right, so growing it moves the boundary west.
        return this.rtl() ? [-1, 0] : [1, 0];
    });

    /** Smallest size of each panel while it is not collapsed, in pixels. */
    private readonly expandedMinSizes = computed<number[]>(() => {
        const total = this.containerSize();

        return this.panels().map((panel) => Math.max(0, resolveSplitterSize(panel.minSize(), total) ?? 0));
    });

    /** Largest size of each panel while it is not collapsed, in pixels. */
    private readonly expandedMaxSizes = computed<number[]>(() => {
        const total = this.containerSize();
        const min = this.expandedMinSizes();

        return this.panels().map((panel, index) => {
            const max = resolveSplitterSize(panel.maxSize(), total) ?? Number.POSITIVE_INFINITY;

            // A maximum below the minimum would make every clamp order-dependent; the minimum wins.
            return Math.max(min[index], max);
        });
    });

    /** Size a collapsed panel is pinned to, in pixels. */
    private readonly collapsedSizes = computed<number[]>(() => {
        const total = this.containerSize();

        return this.panels().map((panel) => Math.max(0, resolveSplitterSize(panel.collapsedSize(), total) ?? 0));
    });

    /**
     * Panels the drag in progress may take through the gap between their collapsed size and their minimum.
     *
     * Only the two around the boundary being dragged. A collapsible panel further out is being pushed rather
     * than aimed at, and letting a push carry one into its gap would collapse it on release without the user
     * ever having pointed at it.
     */
    private readonly freePanels = computed<boolean[]>(() => {
        const boundary = this.dragBoundary();

        return this.panels().map(
            (panel, index) => boundary !== null && panel.collapsible() && (index === boundary || index === boundary + 1)
        );
    });

    /**
     * Which side of its own gap each panel is held on, per panel, while a drag is in progress.
     *
     * The sizes a collapsible panel may take are its collapsed size and everything from its minimum up, with a
     * gap in between that it never occupies. A drag moves it between those two regions rather than through the
     * gap: it stops at the minimum and waits there while the pointer crosses, and flips to the collapsed strip
     * once the pointer passes the midpoint. {@link pinsFor} decides, and it decides the same way whichever
     * direction the pointer came from.
     */
    private readonly gapPins = signal<boolean[]>([]);

    /** Smallest size of each panel in pixels; a collapsed panel is pinned to its collapsed size. */
    private readonly minSizes = computed<number[]>(() =>
        this.panels().map((panel, index) => {
            const collapsed = this.collapsedSizes()[index];
            const expanded = this.expandedMinSizes()[index];

            if (this.freePanels()[index]) return this.gapPins()[index] ? collapsed : expanded;

            return panel.collapsed() ? collapsed : expanded;
        })
    );

    /** Largest size of each panel in pixels; a collapsed panel is pinned to its collapsed size. */
    private readonly maxSizes = computed<number[]>(() =>
        this.panels().map((panel, index) => {
            const collapsed = this.collapsedSizes()[index];

            if (this.freePanels()[index]) return this.gapPins()[index] ? collapsed : this.expandedMaxSizes()[index];

            return panel.collapsed() ? collapsed : this.expandedMaxSizes()[index];
        })
    );

    /** Sizes seeded from what the panels declare — where the splitter starts and what a reset returns to. */
    private readonly defaultSizes = computed<number[]>(() => {
        const panels = this.panels();
        const total = this.containerSize();

        if (!panels.length || total <= 0) return panels.map(() => 0);

        const declared = panels.map((panel) =>
            panel.collapsed()
                ? (resolveSplitterSize(panel.collapsedSize(), total) ?? 0)
                : resolveSplitterSize(panel.size(), total)
        );
        const flexible = declared.reduce<number[]>(
            (indices, size, index) => (size === null ? [...indices, index] : indices),
            []
        );
        const claimed = declared.reduce<number>((sum, size) => sum + (size ?? 0), 0);
        const share = flexible.length ? Math.max(0, total - claimed) / flexible.length : 0;

        return this.settleOnSnapPoints(
            fitSplitterSizes(
                declared.map((size) => size ?? share),
                this.minSizes(),
                this.maxSizes(),
                total
            ),
            total
        );
    });

    /** Current size of every panel in pixels. */
    private readonly sizes = computed<number[]>(() => {
        const layout = this.layout();
        const total = this.containerSize();

        if (!layout || layout.length !== this.panels().length || total <= 0) return this.defaultSizes();

        return fitSplitterSizes(
            layout.map((share) => (share / 100) * total),
            this.minSizes(),
            this.maxSizes(),
            total
        );
    });

    /**
     * @docs-private
     * Tracks are percentages of the splitter's content box, which is exactly what `containerSize` measures, so
     * `size / total` renders as `size` pixels whatever padding the host puts on the splitter.
     *
     * Not `fr`: a flex factor carries only a ratio, and CSS Grid normalizes the factors by their sum. Sizes
     * that cannot add up to the container — every panel pinned to a minimum too large to fit, or every panel
     * capped below it — would then be silently rescaled to fill it, violating the very `minSize`/`maxSize` the
     * layout was computed from, while `aria-valuenow` and the drag arithmetic went on reporting the sizes the
     * component believed it had applied. Percentages under- or overflow instead, which is visible.
     *
     * Equal tracks stand in until the first measurement, which is the only layout that cannot be wrong before
     * the splitter has a size to resolve `%` and `px` against.
     */
    protected readonly gridTemplate = computed<string | null>(() => {
        const count = this.panels().length;

        if (!count) return null;
        if (this.containerSize() <= 0) return `repeat(${count}, minmax(0, 1fr))`;

        const total = this.containerSize();

        return this.sizes()
            .map((size) => `${((Math.max(0, size) / total) * 100).toFixed(4)}%`)
            .join(' ');
    });

    constructor() {
        // `afterNextRender` runs in the browser only, so no explicit platform guard is needed here.
        afterNextRender(() => {
            this.resizeObserver
                .observe(this.nativeElement)
                .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.measure());
        });

        // Swapping the axis changes which dimension every size resolves against, and no resize observation
        // fires for it: the splitter's own box may not have changed at all.
        effect(() => {
            this.orientation();

            if (this.platform.isBrowser) this.measure();
        });
    }

    /** @docs-private */
    separatorCursor(index: number): string {
        const horizontal = this.orientation() === 'horizontal';

        if (this.disabled()) return 'default';

        const { grow, shrink } = this.boundaryRoom(index);
        const rtl = this.rtl();
        // Which way the pointer travels to grow the leading panel, so the one-sided cursors point at the room
        // that is actually left rather than at the panel that owns it.
        const growCursor = horizontal ? (rtl ? 'w-resize' : 'e-resize') : 's-resize';
        const shrinkCursor = horizontal ? (rtl ? 'e-resize' : 'w-resize') : 'n-resize';

        if (grow < EPSILON && shrink < EPSILON) return 'default';
        if (shrink < EPSILON) return growCursor;
        if (grow < EPSILON) return shrinkCursor;

        return horizontal ? 'col-resize' : 'row-resize';
    }

    /** @docs-private */
    separatorValues(index: number): { now: number; min: number; max: number } {
        const total = this.containerSize();

        if (total <= 0) return { now: 0, min: 0, max: 100 };

        const sizes = this.sizes();
        const { grow, shrink } = this.panelRoom(index);
        const toPercent = (size: number) => Math.round((size / total) * 100);

        return {
            now: toPercent(sizes[index]),
            min: toPercent(sizes[index] - shrink),
            max: toPercent(sizes[index] + grow)
        };
    }

    /** @docs-private */
    handleResizeStart(index: number): void {
        // Without a measurement every size resolves to zero, and a drag would read as one that collapses every
        // collapsible panel it touches. A splitter with no size has nothing to resize anyway.
        if (this.disabled() || this.containerSize() <= 0) return;

        const sizes = [...this.sizes()];

        this.dragSnapshot = { index, sizes, total: this.containerSize(), layout: this.layout() };
        // Every panel starts the drag on the side of the gap it is already on, so taking hold of a separator
        // moves nothing by itself.
        this.gapPins.set(this.panels().map((panel) => panel.collapsed()));
        this.dragBoundary.set(index);
        // A collapsed panel's layout entry still holds the size it had before it collapsed, and the drag is
        // about to start writing that entry. Recording what is on screen first keeps the drag where the panel
        // actually is rather than at the size it will return to — but only when there is such an entry. With
        // the layout still derived, `sizes` already describes the screen, and writing it would hand the layout
        // to the host, after which the splitter stops following its own `size` and `snapSizes` inputs for good.
        if (this.layout() !== null) this.applySizes(sizes);
    }

    /** @docs-private */
    handleResizeTo(index: number, size: number): void {
        const snapshot = this.dragSnapshot;

        if (!snapshot || snapshot.index !== index || !this.matchesSnapshot(snapshot)) return;

        const delta = size - snapshot.sizes[index];

        this.gapPins.set(this.pinsFor(index, delta, snapshot));
        this.applySizes(resizeSplitterSizesAt(snapshot.sizes, index, delta, this.minSizes(), this.maxSizes()));
    }

    /** @docs-private */
    handleResizeEnd(): void {
        const snapshot = this.dragSnapshot;

        this.dragSnapshot = null;

        if (!snapshot || snapshot.total <= 0 || !this.matchesSnapshot(snapshot)) return this.endDrag();

        // While the pins are still live, because they are what the whole drag has been deciding.
        const collapsed = this.settleCollapse(snapshot);

        this.endDrag();

        // A panel that just collapsed has taken the whole boundary with it; there is nothing left to snap.
        if (collapsed) return;

        // Snapping happens here rather than on every move: the boundary follows the pointer exactly for the
        // whole drag and lands on the nearest snap point only once it is let go. Pulling mid-drag instead would
        // freeze the panel for as long as the pointer stayed near a point and then jump when it broke free —
        // and the specification names `scroll-snap-type: proximity`, which likewise settles on release.
        const sizes = this.sizes();
        const delta = this.snapDelta(snapshot.index, 0, { sizes, total: snapshot.total });

        if (Math.abs(delta) < EPSILON) return;

        this.applySizes(resizeSplitterSizesAt(sizes, snapshot.index, delta, this.minSizes(), this.maxSizes()));
    }

    /** @docs-private */
    handleSeparatorKeydown(index: number, event: KeyboardEvent): void {
        // A modified press belongs to the browser: Cmd+Left is Back, Ctrl+Home scrolls to the top. `Shift` is
        // the exception — `Shift+F6` walks the panels backwards.
        if (hasModifierKey(event, 'altKey', 'ctrlKey', 'metaKey')) return;

        if (event.key === 'F6') {
            event.preventDefault();

            // From a separator, "next" is the panel it opens onto and "previous" the one it closes.
            return this.focusPanel(event.shiftKey ? index : index + 1);
        }

        if (this.disabled()) return;

        const horizontal = this.orientation() === 'horizontal';
        // In RTL a horizontal splitter grows its leading panel as the boundary travels west, so the arrow that
        // moves the boundary right is the one that shrinks it.
        const sign = horizontal && this.rtl() ? -1 : 1;
        const panel = this.panels()[index];

        switch (event.key) {
            case 'ArrowLeft':
                if (!horizontal) return;

                return this.commitKeydown(event, () => this.resizeBy(index, -KEYBOARD_STEP * sign));
            case 'ArrowRight':
                if (!horizontal) return;

                return this.commitKeydown(event, () => this.resizeBy(index, KEYBOARD_STEP * sign));
            case 'ArrowUp':
                if (horizontal) return;

                return this.commitKeydown(event, () => this.resizeBy(index, -KEYBOARD_STEP));
            case 'ArrowDown':
                if (horizontal) return;

                return this.commitKeydown(event, () => this.resizeBy(index, KEYBOARD_STEP));
            case 'Home':
                return this.commitKeydown(event, () => {
                    const min = this.expandedMinSizes()[index];

                    // A panel already at its minimum has nowhere left to go but away, when it may collapse.
                    if (panel.collapsible() && this.sizes()[index] <= min + EPSILON) return panel.collapsed.set(true);

                    this.resizeBy(index, min - this.sizes()[index]);
                });
            case 'End':
                return this.commitKeydown(event, () => {
                    // Expand first, so the size the panel is grown from is a real one and not its collapsed
                    // strip — but only where collapsing was the splitter's to do in the first place.
                    if (panel.collapsible()) panel.collapsed.set(false);

                    // `resizeBy` is bounded by what the trailing panels can give up, so the splitter's own size
                    // is a safe stand-in for an unbounded maximum.
                    const max = Math.min(this.expandedMaxSizes()[index], this.containerSize());

                    this.resizeBy(index, max - this.sizes()[index]);
                });
            case 'Enter':
                if (!panel.collapsible()) return;

                return this.commitKeydown(event, () => panel.collapsed.update((collapsed) => !collapsed));
            default:
                return;
        }
    }

    /** @docs-private */
    handleSeparatorDblClick(index: number): void {
        if (this.disabled()) return;

        // First return the whole group to the sizes its panels declare; from there, take the leading panel down
        // to its minimum, which is the optional second step of the double-click behaviour.
        if (this.layout() !== null) return this.layout.set(null);

        this.resizeBy(index, this.minSizes()[index] - this.sizes()[index]);
    }

    /**
     * Whether the panels are still the ones the drag was measured against.
     *
     * A host that adds or removes a panel mid-drag invalidates every index the snapshot holds: the captured
     * sizes stop lining up with `minSizes`/`maxSizes`, which turns the arithmetic into `NaN`, and a boundary
     * index no longer names the panel the user took hold of.
     */
    private matchesSnapshot(snapshot: { sizes: number[] }): boolean {
        return snapshot.sizes.length === this.panels().length;
    }

    private commitKeydown(event: KeyboardEvent, action: () => void): void {
        event.preventDefault();
        action();
    }

    /** Moves focus onto a panel, which is how `F6` walks the regions of the splitter. */
    private focusPanel(index: number): void {
        this.panels().at(index)?.element.focus();
    }

    /**
     * Room on each side of the boundary after `index`, in pixels.
     *
     * Measured against the expanded limits rather than the collapse pin, because a collapsed panel can still be
     * dragged back out — reporting it as immovable would leave the cursor saying otherwise.
     */
    private sideRoom(index: number): {
        leadingGrow: number;
        leadingShrink: number;
        trailingGive: number;
        trailingTake: number;
    } {
        const sizes = this.sizes();
        const min = this.expandedMinSizes();
        const max = this.expandedMaxSizes();
        const room = (available: number) => Math.max(0, available);
        const sumOver = (panels: number[], take: (panel: number) => number) => sumOf(panels.map(take));
        const leading = Array.from({ length: index + 1 }, (_, offset) => offset);
        const trailing = Array.from({ length: sizes.length - index - 1 }, (_, offset) => index + 1 + offset);

        return {
            leadingGrow: sumOver(leading, (panel) => room(max[panel] - sizes[panel])),
            leadingShrink: sumOver(leading, (panel) => room(sizes[panel] - min[panel])),
            trailingGive: sumOver(trailing, (panel) => room(sizes[panel] - min[panel])),
            trailingTake: sumOver(trailing, (panel) => room(max[panel] - sizes[panel]))
        };
    }

    /**
     * How far the boundary after `index` can still travel each way — what the cursor advertises.
     *
     * Both sides are summed across every panel, because the drag walks outwards from the boundary: a neighbour
     * pinned at its limit passes the delta on, so the boundary is still movable when it alone is stuck.
     */
    private boundaryRoom(index: number): { grow: number; shrink: number } {
        if (index < 0 || index >= this.sizes().length - 1) return { grow: 0, shrink: 0 };

        const { leadingGrow, leadingShrink, trailingGive, trailingTake } = this.sideRoom(index);

        return {
            grow: Math.min(leadingGrow, trailingGive),
            shrink: Math.min(leadingShrink, trailingTake)
        };
    }

    /**
     * How far the panel at `index` itself can still be resized — what `aria-valuemin` / `aria-valuemax` report.
     *
     * Narrower than {@link boundaryRoom} on purpose: the boundary may keep moving by handing the delta to panels
     * further out, and those moves leave the pane this separator controls exactly where it was.
     */
    private panelRoom(index: number): { grow: number; shrink: number } {
        const sizes = this.sizes();

        if (index < 0 || index >= sizes.length - 1) return { grow: 0, shrink: 0 };

        const { trailingGive, trailingTake } = this.sideRoom(index);
        const room = (available: number) => Math.max(0, available);

        return {
            grow: room(Math.min(this.expandedMaxSizes()[index] - sizes[index], trailingGive)),
            shrink: room(Math.min(sizes[index] - this.expandedMinSizes()[index], trailingTake))
        };
    }

    private resizeBy(index: number, delta: number): void {
        this.applySizes(resizeSplitterSizesAt(this.sizes(), index, delta, this.minSizes(), this.maxSizes()));
    }

    /**
     * Settles a seeded layout onto the snap points its panels declare, boundary by boundary, exactly as
     * releasing a drag on each of them would.
     *
     * Only the seeded sizes go through this. A layout handed to the splitter is authoritative — settling that
     * one would both overwrite a restored layout and pull the boundary onto a point mid-drag, since every move
     * writes `layout`.
     */
    private settleOnSnapPoints(sizes: number[], total: number): number[] {
        const min = this.minSizes();
        const max = this.maxSizes();

        return sizes.reduce((settled, _, index) => {
            if (index >= settled.length - 1) return settled;

            const delta = this.snapDelta(index, 0, { sizes: settled, total });

            return Math.abs(delta) < EPSILON ? settled : resizeSplitterSizesAt(settled, index, delta, min, max);
        }, sizes);
    }

    /** Pulls the drag onto the nearest snap point declared by either panel around the separator. */
    private snapDelta(index: number, delta: number, snapshot: { sizes: number[]; total: number }): number {
        const panels = this.panels();
        const leading = panels[index];
        const trailing = panels[index + 1];

        if (!leading.snapSizes().length && !trailing?.snapSizes().length) return delta;

        // A size declared on the trailing panel is a position of the same boundary, so it is mapped into a size
        // for the leading one before it can compete with the leading panel's own points.
        const pairSize = snapshot.sizes[index] + (snapshot.sizes[index + 1] ?? 0);
        const snapPointsOf = (panel: KbqSplitterPanelRef, toLeadingSize: (size: number) => number) =>
            [...panel.snapSizes(), panel.minSize(), panel.maxSize()]
                .map((size) => resolveSplitterSize(size, snapshot.total))
                .filter((size): size is number => size !== null)
                .map((size) => ({ size: toLeadingSize(size), tolerance: panel.snapTolerance() }));

        const target = snapSplitterSize(snapshot.sizes[index] + delta, [
            ...snapPointsOf(leading, (size) => size),
            ...(trailing ? snapPointsOf(trailing, (size) => pairSize - size) : [])
        ]);

        return target - snapshot.sizes[index];
    }

    /**
     * Which side of its gap each panel around the dragged boundary is held on.
     *
     * Decided from the size the pointer is asking for rather than the one on screen, because a panel held at
     * its minimum or on its collapsed strip has stopped moving — only where the pointer went says what the user
     * means. Half the minimum is the midpoint of the gap, so the same distance decides the panel whichever
     * direction it came from.
     */
    private pinsFor(index: number, delta: number, snapshot: { sizes: number[] }): boolean[] {
        const min = this.expandedMinSizes();
        const aimed: Record<number, number> = {
            [index]: snapshot.sizes[index] + delta,
            [index + 1]: (snapshot.sizes[index + 1] ?? 0) - delta
        };

        return this.panels().map((_, panel) => panel in aimed && aimed[panel] < min[panel] / 2);
    }

    /** Clears everything the drag was holding, so the panels go back to their settled limits. */
    private endDrag(): void {
        this.dragBoundary.set(null);
        this.gapPins.set([]);
    }

    /**
     * Commits the side of the gap each collapsible panel around the boundary ended the drag on.
     *
     * Returns whether anything collapsed.
     */
    private settleCollapse(snapshot: {
        index: number;
        sizes: number[];
        total: number;
        layout: number[] | null;
    }): boolean {
        const panels = this.panels();
        const pins = this.gapPins();
        const around = [snapshot.index, snapshot.index + 1].filter((index) => panels[index]?.collapsible());
        const collapsing = around.filter((index) => pins[index]);

        around.forEach((index) => panels[index].collapsed.set(collapsing.includes(index)));

        if (!collapsing.length) return false;

        // Hand a collapsing panel back the share it had before the gesture, so expanding it later returns it to
        // that size rather than to the sliver the drag squeezed it down to on its way out.
        this.layout.update((layout) =>
            (layout ?? []).map((share, index) =>
                collapsing.includes(index)
                    ? (snapshot.layout?.[index] ?? (snapshot.sizes[index] / snapshot.total) * 100)
                    : share
            )
        );

        return true;
    }

    private applySizes(sizes: number[]): void {
        const total = this.containerSize();

        if (total <= 0) return;

        const panels = this.panels();
        const free = this.freePanels();
        const previous = this.layout();

        this.layout.set(
            sizes.map((size, index) =>
                // A collapsed panel keeps the share it had before it collapsed, so expanding restores that size
                // instead of the strip it is pinned to while collapsed. A panel the drag is free to move is the
                // exception: it is the one being aimed at, so what it records is where it actually is.
                panels[index].collapsed() && !free[index] && previous?.[index] !== undefined
                    ? previous[index]
                    : (size / total) * 100
            )
        );
    }

    private measure(): void {
        const style = this.window.getComputedStyle(this.nativeElement);
        // `clientWidth`/`clientHeight` are the padding box, and the tracks only ever fill the content box.
        const size =
            this.orientation() === 'horizontal'
                ? this.nativeElement.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
                : this.nativeElement.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);

        this.containerSize.set(Math.max(0, size || 0));
    }
}
