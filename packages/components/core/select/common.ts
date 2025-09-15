import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { AfterContentInit, Directive, EventEmitter, Inject, OnDestroy, Optional } from '@angular/core';
import { END, ESCAPE, HOME, SPACE } from '@koobiq/cdk/keycodes';
import { Subscription } from 'rxjs';
import { KBQ_FORM_FIELD_REF, KbqFormFieldRef } from '../form-field';
import { KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD, SELECT_PANEL_VIEWPORT_PADDING } from './constants';

@Directive({
    selector: 'kbq-select-trigger, [kbq-select-trigger]',
    standalone: true
})
export class KbqSelectTrigger {}

@Directive({
    selector: 'kbq-select-matcher, [kbq-select-matcher]',
    standalone: true
})
export class KbqSelectMatcher {}

@Directive({
    selector: 'kbq-select-footer, [kbq-select-footer]',
    host: { class: 'kbq-select__footer' },
    standalone: true
})
export class KbqSelectFooter {}

@Directive({
    selector: '[kbqSelectSearch]',
    exportAs: 'kbqSelectSearch',
    standalone: true,
    host: {
        '(keydown)': 'handleKeydown($event)'
    }
})
export class KbqSelectSearch implements AfterContentInit, OnDestroy {
    readonly changes: EventEmitter<string> = new EventEmitter<string>();

    isSearchChanged: boolean = false;

    get ngControl() {
        return this.formField.control.ngControl;
    }

    private searchChangesSubscription: Subscription = new Subscription();

    constructor(@Optional() @Inject(KBQ_FORM_FIELD_REF) protected formField: KbqFormFieldRef) {
        formField.canCleanerClearByEsc = false;
    }

    setPlaceholder(value: string): void {
        this.formField.control.placeholder = value;
    }

    hasPlaceholder(): boolean {
        return !!this.formField?.control.placeholder;
    }

    focus(): void {
        this.formField.focusViaKeyboard();
    }

    reset(): void {
        this.ngControl.reset();
    }

    value() {
        return this.formField.control.value;
    }

    ngAfterContentInit(): void {
        if (this.formField.control.controlType !== 'input') {
            throw Error('KbqSelectSearch does not work without kbqInput');
        }

        if (!this.ngControl) {
            throw Error('KbqSelectSearch does not work without ngControl');
        }

        Promise.resolve().then(() => {
            this.searchChangesSubscription = this.ngControl.valueChanges!.subscribe((value) => {
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

@Directive({
    selector: '[kbq-select-search-empty-result]',
    exportAs: 'kbqSelectSearchEmptyResult',
    standalone: true
})
export class KbqSelectSearchEmptyResult {}

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

    protected setOverlayPosition() {
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

    protected resolveSearchMinOptionsThreshold(value?: 'auto' | number) {
        return value === 'auto' ? KBQ_SELECT_SEARCH_MIN_OPTIONS_THRESHOLD : value;
    }
}
