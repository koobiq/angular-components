import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';
import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    input,
    Signal,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { KBQ_FORM_FIELD_REF, KbqFormFieldRef } from '../form-field';
import { END, ESCAPE, HOME, SPACE } from '../keycodes';
import {
    KBQ_PANEL_DEFAULT_MAX_HEIGHT,
    KbqPanelSpaceContext,
    kbqResolveTriggerFirstRowOffset,
    kbqShouldAnchorPanelToFirstRow
} from '../overlay/panel-height';
import {
    kbqGetPanelWidthOrigin,
    KbqPanelMinWidth,
    KbqPanelWidth,
    KbqPanelWidthOrigin,
    kbqResolvePanelWidth
} from '../overlay/panel-width';
import { KBQ_CONNECTED_OVERLAY_OVERLAP_CLASS } from '../pop-up/constants';
import { KBQ_WINDOW } from '../tokens';
import { KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD, SELECT_PANEL_VIEWPORT_PADDING } from './constants';

@Directive({
    selector: 'kbq-select-trigger, [kbq-select-trigger]'
})
export class KbqSelectTrigger {}

@Directive({
    selector: 'kbq-select-matcher, [kbq-select-matcher]'
})
export class KbqSelectMatcher {
    readonly useDefaultHandlers = input<boolean, unknown>(true, { transform: booleanAttribute });
}

@Directive({
    selector: '[kbq-select-search-empty-result]',
    host: {
        class: 'kbq-select-search-empty-result kbq-select__no-options-message'
    },
    exportAs: 'kbqSelectSearchEmptyResult'
})
export class KbqSelectSearchEmptyResult {}

@Directive({
    selector: 'kbq-select-footer, [kbq-select-footer]',
    host: { class: 'kbq-select__footer' }
})
export class KbqSelectFooter {}

@Directive({
    selector: '[kbqSelectSearch]',
    host: {
        '(keydown)': 'handleKeydown($event)'
    },
    exportAs: 'kbqSelectSearch'
})
export class KbqSelectSearch implements AfterContentInit {
    protected formField = inject<KbqFormFieldRef>(KBQ_FORM_FIELD_REF, { optional: true })!;

    /**
     * Captured here rather than built where it is used: `takeUntilDestroyed()` reads the current
     * `DestroyRef` from the injection context, and the subscription below is created in a microtask,
     * which has none. Field initialization runs in the constructor's context, where it does.
     */
    private readonly takeUntilDestroyed = takeUntilDestroyed<any>();

    readonly changes: EventEmitter<string> = new EventEmitter<string>();

    isSearchChanged: boolean = false;

    get ngControl() {
        return this.formField.control().ngControl;
    }

    constructor() {
        this.formField.canCleanerClearByEsc = false;
        this.formField.inOverlay.set(true);
    }

    setPlaceholder(value: string): void {
        this.formField.control().placeholder = value;
    }

    hasPlaceholder(): boolean {
        return !!this.formField?.control().placeholder;
    }

    focus(): void {
        this.formField.focus();
    }

    reset(): void {
        this.ngControl?.reset();
    }

    value() {
        return this.formField.control().value;
    }

    ngAfterContentInit(): void {
        if (this.formField.control().controlType !== 'input') {
            throw Error('KbqSelectSearch does not work without kbqInput');
        }

        if (!this.ngControl) {
            throw Error('KbqSelectSearch does not work without ngControl');
        }

        // The subscription is deferred, so the directive can be destroyed before it even exists —
        // the captured operator owns it either way, while an `ngOnDestroy` unsubscribe would not.
        Promise.resolve().then(() => {
            this.ngControl!.valueChanges!.pipe(this.takeUntilDestroyed).subscribe((value) => {
                this.isSearchChanged = true;
                this.changes.next(value);
            });
        });
    }

    handleKeydown(event: KeyboardEvent) {
        if (event.keyCode === ESCAPE) {
            if (this.value()) {
                this.reset();
                event.stopPropagation();
            }
        }

        if ([SPACE, HOME, END].includes(event.keyCode)) {
            event.stopPropagation();
        }
    }
}

/**
 * Abstract class representing a customizable select component with an overlay.
 *
 * This class provides base functionality for handling the overlay positioning.
 * @docs-private
 */
@Directive()
export abstract class KbqAbstractSelect {
    /** Overlay directive of the panel. Subclasses resolve it with their own view query. */
    protected abstract overlayDir: CdkConnectedOverlay;

    /** Last measured bounding rect of the trigger. Subclasses refresh it whenever the panel opens. */
    protected abstract triggerRect: DOMRect;

    /** Positions the `cdkConnectedOverlayPositions` input reads. */
    abstract positions: ConnectedPosition[];

    /** Whether the trigger lays its selected values out in rows. */
    protected abstract readonly multiline: Signal<boolean>;

    /** Scrollable option list inside the panel. */
    protected abstract readonly optionsContainer: Signal<ElementRef<HTMLElement> | undefined>;

    /** Margin the overlay keeps from the viewport edge, i.e. `cdkConnectedOverlayViewportMargin`. */
    protected abstract readonly viewportMargin: number;

    /**
     * Row container of a multi-selection trigger. Absent for a single value, an empty trigger and a custom
     * matcher or trigger — all of which have no rows for the panel to anchor to.
     */
    protected readonly multilineMatchList = viewChild<ElementRef<HTMLElement>>('multilineMatchList');

    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    protected readonly window = inject(KBQ_WINDOW);

    /** Whether the panel is open. Declared as a method because the two selects spell the state differently. */
    protected abstract isPanelOpen(): boolean;

    /** Element the overlay is positioned and sized against. */
    protected abstract getOverlayOriginElement(): HTMLElement | undefined;

    /** Overlay panel class. */
    protected readonly overlayPanelClass = 'kbq-select-overlay';

    /** Width of the overlay panel. */
    protected overlayWidth: string | number = '';

    /** Minimum width of the overlay panel. */
    protected overlayMinWidth: string | number = '';

    /**
     * Height of everything in the panel that is not the option list — the trigger gap the pane pads itself
     * with, the list padding, a search field and a footer.
     *
     * The same for every anchor: the below and overlap panes pad the top, the above pane pads the bottom, and
     * all three pad by the same gap — which is what keeps the anchor decision from feeding back into itself.
     */
    private panelChromeHeight = 0;

    /** Transparent gap the pane pads itself with, which the anchor has to be raised by. */
    private panelGapHeight = 0;

    /**
     * Cap the option list is rendered with, in pixels. Measured off the panel rather than derived from
     * `panelMaxHeight`, because `--kbq-select-panel-size-max-height` is what the list actually obeys and a
     * consumer can override it. Seeded with the stylesheet's own default, which is what a DOM that computes
     * no layout — the server, jsdom — leaves in force.
     */
    private panelMaxHeightCap = KBQ_PANEL_DEFAULT_MAX_HEIGHT;

    private resizeSubscription = Subscription.EMPTY;

    /**
     * Resolves the overlay panel size for the current trigger geometry and stores it for the
     * `cdkConnectedOverlay` width bindings.
     */
    protected updateOverlayWidth(
        panelWidth: KbqPanelWidth,
        panelMinWidth: KbqPanelMinWidth,
        origin: KbqPanelWidthOrigin
    ): void {
        const { width, minWidth } = kbqResolvePanelWidth(panelWidth, panelMinWidth, kbqGetPanelWidthOrigin(origin));

        this.overlayWidth = width;
        this.overlayMinWidth = minWidth;
    }

    /**
     * Freezes the panel at its rendered width so that filtering the options does not reflow it.
     * Does nothing when the width is already pinned.
     */
    protected lockOverlayWidthForSearch(panel: ElementRef<HTMLElement> | undefined): void {
        // Compare against the unset sentinel rather than a truthy check — `overlayWidth` can
        // legitimately resolve to `0` for an explicit zero-width panel, which is falsy but pinned.
        if (this.overlayWidth !== '') return;

        const measuredPanelWidth = panel?.nativeElement.getBoundingClientRect().width;

        if (measuredPanelWidth) {
            this.overlayWidth = measuredPanelWidth;
        }
    }

    protected setOverlayPosition() {
        if (!this.overlayDir.overlayRef) return;

        this.resetOverlay();

        const overlayRect = this.getOverlayRect();
        // Window width without scrollbar
        const windowWidth = this.overlayDir.overlayRef?.hostElement.clientWidth;
        let offsetX: number = 0;
        let overlayMaxWidth: number;

        // Determine if select overflows on either side.
        const leftOverflow = -overlayRect.left;
        const rightOverflow = overlayRect.right - windowWidth;

        // If the element overflows on either side, reduce the offset to allow it to fit.
        if (leftOverflow > 0 || rightOverflow > 0) {
            [offsetX, overlayMaxWidth] = this.calculateOverlayOffsetX(offsetX);
            this.overlayDir.overlayRef.overlayElement.style.maxWidth = `${overlayMaxWidth}px`;
            // reset the minWidth property
            this.overlayDir.overlayRef.overlayElement.style.minWidth = '';
        }

        // Set the offset directly in order to avoid having to go through change detection and
        // potentially triggering "changed after it was checked" errors. Round the value to avoid
        // blurry content in some browsers.
        this.overlayDir.offsetX = Math.round(offsetX);
        this.overlayDir.overlayRef.updatePosition();
    }

    protected calculateOverlayOffsetX(baseOffsetX: number): number[] {
        let offsetX = baseOffsetX;
        const windowWidth = this.overlayDir.overlayRef?.hostElement.clientWidth;
        const { left: leftIndent, right: triggerRight, width: triggerWidth } = this.triggerRect;
        const { width: overlayRectWidth } = this.getOverlayRect();
        const rightIndent = windowWidth - triggerRight;
        // Setting direction of dropdown expansion
        const isRightDirection = leftIndent <= rightIndent;

        const indent = isRightDirection ? rightIndent : leftIndent;
        const maxDropdownWidth = indent + triggerWidth - SELECT_PANEL_VIEWPORT_PADDING;
        const overlayMaxWidth = overlayRectWidth < maxDropdownWidth ? overlayRectWidth : maxDropdownWidth;

        if (!isRightDirection) {
            const leftOffset = triggerRight - overlayMaxWidth;

            offsetX -= leftIndent - leftOffset;
        }

        return [offsetX, overlayMaxWidth];
    }

    protected getOverlayRect(): DOMRect {
        return this.overlayDir.overlayRef.overlayElement.getBoundingClientRect();
    }

    protected resetOverlay(): void {
        this.overlayDir.overlayRef.hostElement.classList.add(this.overlayPanelClass);
        this.overlayDir.offsetX = 0;
        this.overlayDir.overlayRef.overlayElement.style.maxWidth = 'unset';
        this.overlayDir.overlayRef.updatePosition();
    }

    /**
     * Returns `positions` with the first-row anchor added, updated or removed, or `null` when the array
     * already says what it should — so that the caller can skip the change detection an edit would need.
     *
     * The anchor goes LAST. The overlay returns on the first position that fits completely, so an entry at the
     * end is reached exactly when neither the below nor the above position works, which is the rule this
     * implements. Pass `null` to drop it again.
     *
     * The result is meant to be assigned to the field the `cdkConnectedOverlayPositions` input reads, NOT
     * handed to `withPositions()` on the strategy: `CdkConnectedOverlay.ngOnChanges` rebuilds the strategy
     * from that field on ANY input change — the width `lockOverlayWidthForSearch` pins is one — so a list
     * applied only to the strategy would be dropped again without a trace.
     */
    protected withOverlapPosition(positions: ConnectedPosition[], offsetY: number | null): ConnectedPosition[] | null {
        // `panelClass` is `string | string[]`, and `positions` is public, so an anchor can come back in a
        // shape a strict comparison would miss — which would append a second anchor on every recompute and
        // leave every one of them behind on close.
        const isOverlap = ({ panelClass }: ConnectedPosition) =>
            Array.isArray(panelClass)
                ? panelClass.includes(KBQ_CONNECTED_OVERLAY_OVERLAP_CLASS)
                : panelClass === KBQ_CONNECTED_OVERLAY_OVERLAP_CLASS;
        const current = positions.find(isOverlap);
        const withoutOverlap = () => positions.filter((position) => !isOverlap(position));

        if (offsetY === null) return current ? withoutOverlap() : null;

        // Rounded so that sub-pixel layout jitter cannot rebuild the array on every selection change.
        const roundedOffsetY = Math.round(offsetY);

        if (current?.offsetY === roundedOffsetY) return null;

        return [
            ...withoutOverlap(),
            {
                originX: 'start',
                originY: 'top',
                overlayX: 'start',
                overlayY: 'top',
                offsetY: roundedOffsetY,
                panelClass: KBQ_CONNECTED_OVERLAY_OVERLAP_CLASS
            }
        ];
    }

    /**
     * Re-resolves the panel position with the first-row anchor brought up to date.
     *
     * Never call this from a `positionChange` subscriber: CDK records the position it applied AFTER the
     * subscriber returns, so an anchor resolved from inside that frame is overwritten by the pre-anchor
     * position, and `cdkConnectedOverlayLockPosition` then replays that stale one on the next scroll.
     */
    protected reanchorPanel(): void {
        // `hostElement` is nulled by `OverlayRef.dispose()`, which is what a queued call landing after the
        // component was destroyed has to be told apart by — `overlayRef` itself outlives disposal.
        if (!this.overlayDir?.overlayRef?.hostElement) return;

        // Only when the anchor actually moved. `setOverlayPosition()` is a one-shot: it clears the pane's
        // `minWidth` and derives the panel offset from the width it had before that, so a second run over
        // the same open measures a narrower pane. In RTL the pane's x is `documentWidth - (x + paneWidth)`,
        // so that narrower measurement moves the panel; in LTR only `left` is written and nothing moves.
        if (this.updatePanelAnchor()) {
            this.setOverlayPosition();
        }
    }

    /**
     * Re-resolves the anchor while the panel is open. A resize rewraps the trigger's rows and changes the
     * room beside it at once, and CDK re-applies the position on its own, so without this the anchor it
     * resolves against is the one measured for the old viewport.
     */
    protected subscribeToPanelResize(): void {
        this.resizeSubscription.unsubscribe();

        if (!this.multiline()) return;

        this.resizeSubscription = fromEvent(this.window, 'resize')
            .pipe(debounceTime(50))
            .subscribe(() => this.reanchorPanel());
    }

    /** Drops the resize subscription the open set up. */
    protected unsubscribeFromPanelResize(): void {
        this.resizeSubscription.unsubscribe();
    }

    /**
     * Keeps the first-row anchor in `positions`: a third position that puts the panel just below the
     * trigger's first row and over the rest of it, for a multiline trigger that has grown taller than the
     * panel and fits on neither side of it.
     *
     * The anchor goes last, and the overlay stops at the first position that fits completely, so it is
     * reached exactly when neither `below` nor `above` works. `kbqShouldAnchorPanelToFirstRow` holds the
     * rest of the rule.
     *
     * Returns whether the array changed, so that a caller can skip the reposition an unchanged anchor does
     * not need. Updating the array is all there is to do here — `setOverlayPosition()` rebuilds the strategy
     * and resolves the position again.
     */
    protected updatePanelAnchor(): boolean {
        if (!this.multiline() || !this.isPanelOpen() || !this.overlayDir?.overlayRef) return false;

        // A measurement that cannot be trusted would leave the seeds in force, and a zero chrome height
        // overstates the room beside the trigger by the whole of a search field and a footer.
        if (!this.measurePanelChrome()) return false;

        const context = this.resolvePanelSpaceContext();

        if (!context) return false;

        const firstRowOffset = this.resolveFirstRowOffset();
        const anchorToFirstRow = kbqShouldAnchorPanelToFirstRow(context, {
            firstRowOffset,
            naturalListHeight: this.measureNaturalListHeight(),
            anchored: this.isPanelAnchoredToFirstRow()
        });
        // The pane pads the gap inside itself, so the anchor is raised by it: the painted panel then starts
        // where the second row does, instead of leaving the top of that row's tags showing through the band.
        const offsetY = anchorToFirstRow && firstRowOffset !== null ? firstRowOffset - this.panelGapHeight : null;
        const positions = this.withOverlapPosition(this.positions, offsetY);

        if (!positions) return false;

        this.positions = positions;
        // Pushes the new array into `CdkConnectedOverlay`: the strategy is rebuilt from the directive's
        // input, not from this field, so without this the reposition would resolve against the old list.
        this.changeDetectorRef.detectChanges();

        return true;
    }

    /**
     * Distance from the origin's top edge to just below the trigger's first row, or `null` when there is no
     * row to anchor to.
     */
    private resolveFirstRowOffset(): number | null {
        const origin = this.getOverlayOriginElement();
        const list = this.multilineMatchList()?.nativeElement;

        if (!origin || !list) return null;

        // The rows follow document order, so the scan stops at the first child that starts lower. Collapsed
        // children are skipped: a custom tag template can render a hidden node, and its all-zero rect would
        // otherwise be taken for the topmost row and push every real tag out of it.
        let firstRowTop: number | null = null;
        let firstRowBottom = Number.NEGATIVE_INFINITY;

        for (const child of Array.from(list.children)) {
            const { top, bottom, width, height } = child.getBoundingClientRect();

            // A collapsed child occupies no row and adds nothing to one, so it is skipped whichever way it
            // collapsed — its rect would otherwise be read as a row of its own.
            if (width === 0 || height === 0) continue;

            if (firstRowTop === null) {
                firstRowTop = top;
                // Sub-pixel layout only makes the tops of one row equal to within a pixel, and a custom tag
                // template can put several elements on the same row.
            } else if (top - firstRowTop >= 1) {
                break;
            }

            firstRowBottom = Math.max(firstRowBottom, bottom);
        }

        if (firstRowTop === null) return null;

        const originRect = origin.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();

        return kbqResolveTriggerFirstRowOffset({
            originTop: originRect.top,
            originBottom: originRect.bottom,
            listTop: listRect.top,
            listBottom: listRect.bottom,
            firstRowBottom,
            // The rows keep their laid-out position while their container scrolls, so the scroll offset is
            // what converts them back into the list's own coordinates.
            listScrollTop: list.scrollTop
        });
    }

    /**
     * Height the option list takes with no viewport clamp in force.
     *
     * Read from `scrollHeight`, which reports the whole content rather than what the pane happens to show
     * right now — the anchor decision runs on a pane the overlay may be about to move.
     */
    private measureNaturalListHeight(): number {
        if (this.isListHeightPinnedToCap()) return this.panelMaxHeightCap;

        const content = this.optionsContainer()?.nativeElement;

        if (!content) return this.panelMaxHeightCap;

        // `clientHeight` less the computed content box is the list's own vertical padding, which
        // `scrollHeight` counts and the cap does not.
        const padding = content.clientHeight - parseFloat(this.window.getComputedStyle(content).height);

        return Math.min(this.panelMaxHeightCap, content.scrollHeight - (Number.isFinite(padding) ? padding : 0));
    }

    /**
     * Whether the option list renders at the cap whatever its content is, which a
     * `cdk-virtual-scroll-viewport` does by pinning both its `min-height` and its `max-height` to the token.
     */
    protected isListHeightPinnedToCap(): boolean {
        return false;
    }

    /** Geometry the panel height calculation needs, or `null` when there is nothing to measure against. */
    private resolvePanelSpaceContext(): KbqPanelSpaceContext | null {
        const origin = this.getOverlayOriginElement();

        if (!origin) return null;

        const { top, bottom } = origin.getBoundingClientRect();

        return {
            triggerTop: top,
            triggerBottom: bottom,
            // `clientHeight`, not `innerHeight`: the overlay narrows the viewport the same way, and the two
            // differ by the horizontal scrollbar — enough for a position we think fits to be rejected.
            viewportHeight: this.window.document.documentElement.clientHeight,
            viewportMargin: this.viewportMargin,
            chromeHeight: this.panelChromeHeight
        };
    }

    /** Whether the panel is currently drawn over the trigger, read from the class the overlay applies. */
    private isPanelAnchoredToFirstRow(): boolean {
        return this.overlayDir.overlayRef.overlayElement.classList.contains(KBQ_CONNECTED_OVERLAY_OVERLAP_CLASS);
    }

    /**
     * Records the part of the panel that is not the option list, the gap the pane pads itself with, and the
     * cap the list is rendered with. Returns `false` when the panel cannot be measured, which is the caller's
     * signal to leave the anchor alone rather than decide against a stale value.
     */
    private measurePanelChrome(): boolean {
        const pane = this.overlayDir.overlayRef.overlayElement;
        const content = this.optionsContainer()?.nativeElement;

        if (!content) return false;

        // `--kbq-select-panel-size-max-height` caps the list's *content box* — the scroller is `box-sizing:
        // initial` — so its own padding counts as chrome. The computed `height` is that content box, which is
        // exactly what the cap has to be measured against.
        const { height, maxHeight } = this.window.getComputedStyle(content);
        const { paddingTop, paddingBottom } = this.window.getComputedStyle(pane);
        const chromeHeight = pane.getBoundingClientRect().height - parseFloat(height);
        const cap = parseFloat(maxHeight);

        if (!Number.isFinite(chromeHeight) || chromeHeight < 0) return false;

        this.panelChromeHeight = chromeHeight;
        // Whichever side the current position pads, the gap is the same one the anchored pane will pad.
        this.panelGapHeight = Math.max(parseFloat(paddingTop) || 0, parseFloat(paddingBottom) || 0);

        // `none`, `''` and a DOM without layout all yield NaN, which leaves the seed in force.
        if (Number.isFinite(cap) && cap > 0) {
            this.panelMaxHeightCap = cap;
        }

        return true;
    }

    protected resolveSearchMinOptionsThreshold(value?: 'auto' | number) {
        return value === 'auto' ? KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD : value;
    }
}
