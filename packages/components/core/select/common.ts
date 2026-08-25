import { CdkConnectedOverlay, ConnectedPosition, FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay';
import {
    AfterContentInit,
    booleanAttribute,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    input,
    OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import { KBQ_FORM_FIELD_REF, KbqFormFieldRef } from '../form-field';
import { END, ESCAPE, HOME, SPACE } from '../keycodes';
import {
    kbqGetPanelWidthOrigin,
    KbqPanelMinWidth,
    KbqPanelWidth,
    KbqPanelWidthOrigin,
    kbqResolvePanelWidth
} from '../overlay/panel-width';
import { KBQ_CONNECTED_OVERLAY_OVERLAP_CLASS } from '../pop-up/constants';
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
export class KbqSelectSearch implements AfterContentInit, OnDestroy {
    protected formField = inject<KbqFormFieldRef>(KBQ_FORM_FIELD_REF, { optional: true })!;

    readonly changes: EventEmitter<string> = new EventEmitter<string>();

    isSearchChanged: boolean = false;

    get ngControl() {
        return this.formField.control().ngControl;
    }

    private searchChangesSubscription: Subscription = new Subscription();

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

        Promise.resolve().then(() => {
            this.searchChangesSubscription = this.ngControl!.valueChanges!.subscribe((value) => {
                this.isSearchChanged = true;
                this.changes.next(value);
            });
        });
    }

    ngOnDestroy(): void {
        this.searchChangesSubscription.unsubscribe();
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
    protected overlayDir: CdkConnectedOverlay;
    protected triggerRect: DOMRect;

    /** Overlay panel class. */
    protected readonly overlayPanelClass = 'kbq-select-overlay';

    /** Width of the overlay panel. */
    protected overlayWidth: string | number = '';

    /** Minimum width of the overlay panel. */
    protected overlayMinWidth: string | number = '';

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
     *
     * Note that writing `overlayWidth` while the panel is open reaches `CdkConnectedOverlay.ngOnChanges`,
     * which rebuilds the position strategy and drops the locked position — the same mechanism documented on
     * `applyOverlayOffsetX`. `cdkConnectedOverlayLockPosition` is therefore never a hard guarantee, and any
     * fix for a jumping panel has to keep the panel fitting rather than rely on the lock alone.
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

        // Applied on the strategy rather than through change detection, so that no "changed after it was
        // checked" error can come out of a reposition.
        this.applyOverlayOffsetX(offsetX);
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
        this.applyOverlayOffsetX(0);
        this.overlayDir.overlayRef.overlayElement.style.maxWidth = 'unset';
        this.overlayDir.overlayRef.updatePosition();
    }

    /**
     * Returns `positions` with the first-row anchor added, updated or removed, or `null` when the array
     * already says what it should — the caller only re-resolves the overlay when something actually changed.
     *
     * The anchor goes LAST. The overlay returns on the first position that fits completely, so an entry at the
     * end is reached exactly when neither the below nor the above position works, which is the rule this
     * implements. Pass `null` to drop it again.
     *
     * The result is meant to be assigned to the field the `cdkConnectedOverlayPositions` input reads, NOT
     * handed to `withPositions()` on the strategy: `CdkConnectedOverlay.ngOnChanges` rebuilds the strategy
     * from that field on ANY input change — the width `lockOverlayWidthForSearch` pins is one — so a list
     * applied only to the strategy would be dropped again without a trace.
     *
     * The entry deliberately carries no `offsetX`. The directive maps `currentPosition.offsetX || this.offsetX`
     * into every literal it builds, and a mapped number is not `== null`, so an `offsetX` here would
     * permanently shadow the horizontal overflow correction `applyOverlayOffsetX` installs on the strategy.
     */
    protected withOverlapPosition(positions: ConnectedPosition[], offsetY: number | null): ConnectedPosition[] | null {
        const current = positions.find(({ panelClass }) => panelClass === KBQ_CONNECTED_OVERLAY_OVERLAP_CLASS);
        const withoutOverlap = () => positions.filter((position) => position !== current);

        if (offsetY === null) return current ? withoutOverlap() : null;

        // Rounded so that sub-pixel jitter from the resize observer cannot rebuild the array every frame.
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
     * Re-resolves which side the panel opens on, then restores the lock.
     *
     * `cdkConnectedOverlayLockPosition` deliberately keeps the side chosen when the panel opened, but that
     * side stops being usable once the trigger grows past the space left on it. Unlocking for a single
     * `apply()` lets the strategy pick a fitting side again and record it as the new locked one.
     */
    protected reevaluateOverlaySide(): void {
        if (!this.overlayDir?.overlayRef) return;

        const strategy = this.getPositionStrategy();

        strategy.withLockedPosition(false);
        this.overlayDir.overlayRef.updatePosition();
        strategy.withLockedPosition(this.overlayDir.lockPosition);
    }

    /**
     * Applies the horizontal overflow correction on the position strategy rather than through
     * `CdkConnectedOverlay.offsetX`.
     *
     * The directive's `offsetX` setter rebuilds the position array from fresh object literals, and
     * `withPositions()` drops `_lastPosition` whenever the stored position is not identity-equal to one of
     * them — which a fresh literal never is. That silently defeats `cdkConnectedOverlayLockPosition`, so the
     * next `updatePosition()` re-resolves the side from scratch and the panel flips between below and above.
     *
     * Nothing may go back to assigning `overlayDir.offsetX`: the directive maps its value into every position
     * literal, and a mapped `0` is not `== null`, so it would permanently shadow the default set here.
     */
    private applyOverlayOffsetX(offsetX: number): void {
        this.getPositionStrategy().withDefaultOffsetX(Math.round(offsetX));
    }

    private getPositionStrategy(): FlexibleConnectedPositionStrategy {
        return this.overlayDir.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
    }

    protected resolveSearchMinOptionsThreshold(value?: 'auto' | number) {
        return value === 'auto' ? KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD : value;
    }
}
