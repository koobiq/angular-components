import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import {
    FlexibleConnectedPositionStrategy,
    HorizontalConnectionPos,
    Overlay,
    OverlayConfig,
    OverlayRef,
    ScrollStrategy,
    VerticalConnectionPos
} from '@angular/cdk/overlay';
import { normalizePassiveListenerOptions, Platform } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    AfterContentInit,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    Inject,
    InjectionToken,
    Input,
    numberAttribute,
    OnDestroy,
    Optional,
    Output,
    Self,
    ViewContainerRef
} from '@angular/core';
import { DOWN_ARROW, ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE } from '@koobiq/cdk/keycodes';
import { defaultOffsetY, KBQ_WINDOW } from '@koobiq/components/core';
import { asapScheduler, merge, Observable, of as observableOf, Subscription } from 'rxjs';
import { delay, filter, take, takeUntil } from 'rxjs/operators';
import { throwKbqDropdownMissingError } from './dropdown-errors';
import { KbqDropdownItem } from './dropdown-item.component';
import { KbqDropdown } from './dropdown.component';
import { DropdownCloseReason, DropdownPositionX, DropdownPositionY, KbqDropdownPanel } from './dropdown.types';

/** Injection token that determines the scroll handling while the dropdown is open. */
export const KBQ_DROPDOWN_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>('kbq-dropdown-scroll-strategy');

/** @docs-private */
export function KBQ_DROPDOWN_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const KBQ_DROPDOWN_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: KBQ_DROPDOWN_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: KBQ_DROPDOWN_SCROLL_STRATEGY_FACTORY
};

/** Default top padding of the nested dropdown panel. */
export const NESTED_PANEL_TOP_PADDING = 4;
export const NESTED_PANEL_LEFT_PADDING = 8;

/** Options for binding a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });

/**
 * This directive is intended to be used in conjunction with an kbq-dropdown tag.  It is
 * responsible for toggling the display of the provided dropdown instance.
 */
@Directive({
    selector: `[kbqDropdownTriggerFor]`,
    exportAs: 'kbqDropdownTrigger',
    host: {
        class: 'kbq-dropdown-trigger',
        '[class.kbq-pressed]': 'opened',
        '(mousedown)': 'handleMousedown($event)',
        '(keydown)': 'handleKeydown($event)',
        '(click)': 'handleClick($event)'
    }
})
export class KbqDropdownTrigger implements AfterContentInit, OnDestroy {
    protected readonly isBrowser = inject(Platform).isBrowser;
    private readonly window = inject(KBQ_WINDOW);

    lastDestroyReason: DropdownCloseReason;

    /** Position offset of the dropdown in the X axis. */
    @Input({ transform: numberAttribute }) offsetX: number;

    /** Position offset of the dropdown in the Y axis. */
    @Input({ transform: numberAttribute }) offsetY: number;

    /** Data to be passed along to any lazily-rendered content. */
    @Input('kbqDropdownTriggerData') data: any;

    @Input() openByArrowDown: boolean = true;

    /**
     * Whether focus should be restored when the menu is closed.
     * Note that disabling this option can have accessibility implications
     * and it's up to you to manage focus, if you decide to turn it off.
     */
    @Input('kbqDropdownTriggerRestoreFocus') restoreFocus: boolean = true;

    /** References the dropdown instance that the trigger is associated with. */
    @Input('kbqDropdownTriggerFor')
    get dropdown() {
        return this._dropdown;
    }

    set dropdown(dropdown: KbqDropdownPanel) {
        if (dropdown === this._dropdown) {
            return;
        }

        this._dropdown = dropdown;
        this.closeSubscription.unsubscribe();

        if (dropdown) {
            this.closeSubscription = dropdown.closed.asObservable().subscribe((reason) => {
                this.destroy(reason);

                // If a click closed the dropdown, we should close the entire chain of nested dropdowns.
                if (['click', 'tab'].includes(reason as string) && this.parent) {
                    this.parent.closed.emit(reason);
                }
            });
        }
    }

    private _dropdown: KbqDropdownPanel;

    /** Event emitted when the associated dropdown is opened. */
    @Output() readonly dropdownOpened: EventEmitter<void> = new EventEmitter<void>();

    /** Event emitted when the associated dropdown is closed. */
    @Output() readonly dropdownClosed: EventEmitter<void> = new EventEmitter<void>();

    // Tracking input type is necessary so it's possible to only auto-focus
    // the first item of the list when the dropdown is opened via the keyboard
    openedBy: Exclude<FocusOrigin, 'program' | null> | undefined;

    /** The text direction of the containing app. */
    get dir(): Direction {
        return this._dir?.value === 'rtl' ? 'rtl' : 'ltr';
    }

    /** Whether the dropdown is open. */
    get opened(): boolean {
        return this._opened;
    }

    private _opened: boolean = false;

    private portal: TemplatePortal;

    private overlayRef: OverlayRef | null = null;

    private closeSubscription = Subscription.EMPTY;

    private hoverSubscription = Subscription.EMPTY;

    constructor(
        private overlay: Overlay,
        private elementRef: ElementRef<HTMLElement>,
        private viewContainerRef: ViewContainerRef,
        @Inject(KBQ_DROPDOWN_SCROLL_STRATEGY) private scrollStrategy: any,
        @Optional() private parent: KbqDropdown,
        @Optional() @Self() private dropdownItemInstance: KbqDropdownItem,
        @Optional() private _dir: Directionality,
        private changeDetectorRef: ChangeDetectorRef,
        private focusMonitor?: FocusMonitor
    ) {
        elementRef.nativeElement.addEventListener('touchstart', this.handleTouchStart, passiveEventListenerOptions);

        if (dropdownItemInstance) {
            dropdownItemInstance.isNested = this.isNested();
        }
    }

    ngAfterContentInit() {
        this.check();
        this.handleHover();
    }

    ngOnDestroy() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }

        this.elementRef.nativeElement.removeEventListener(
            'touchstart',
            this.handleTouchStart,
            passiveEventListenerOptions
        );

        this.cleanUpSubscriptions();
    }

    /** Whether the dropdown triggers a nested dropdown or a top-level one. */
    isNested(): boolean {
        return !!(this.dropdownItemInstance && this.parent);
    }

    /** Toggles the dropdown between the open and closed states. */
    toggle(): void {
        return this._opened ? this.close() : this.open();
    }

    /** Opens the dropdown. */
    open(): void {
        if (this._opened) {
            return;
        }

        this.check();

        const overlayRef = this.createOverlay();
        const overlayConfig = overlayRef.getConfig();

        this.setPosition(overlayConfig.positionStrategy as FlexibleConnectedPositionStrategy);

        overlayConfig.hasBackdrop = this.dropdown.hasBackdrop ? !this.isNested() : this.dropdown.hasBackdrop;

        overlayRef.attach(this.getPortal());

        if (this.dropdown.lazyContent) {
            this.dropdown.lazyContent.detach();

            this.dropdown.lazyContent.attach(this.data);
        }

        this.closeSubscription = this.closingActions().subscribe(() => this.close());

        this.init();

        if (this.dropdown instanceof KbqDropdown) {
            this.dropdown.startAnimation();
        }
    }

    /** Closes the dropdown. */
    close(): void {
        this.dropdown.closed.emit();
    }

    /**
     * Focuses the dropdown trigger.
     */
    focus(origin?: FocusOrigin, options?: FocusOptions) {
        if (this.focusMonitor && origin) {
            this.focusMonitor.focusVia(this.elementRef.nativeElement, origin, options);
        } else {
            this.elementRef.nativeElement.focus();
        }
    }

    /** Handles mouse presses on the trigger. */
    handleMousedown(event: MouseEvent): void {
        // Since right or middle button clicks won't trigger the `click` event,
        // we shouldn't consider the dropdown as opened by mouse in those cases.
        this.openedBy = event.button === 0 ? 'mouse' : undefined;

        // Since clicking on the trigger won't close the dropdown if it opens a nested dropdown,
        // we should prevent focus from moving onto it via click to avoid the
        // highlight from lingering on the dropdown item.
        if (this.isNested()) {
            event.preventDefault();
        }
    }

    /** Handles key presses on the trigger. */
    handleKeydown(event: KeyboardEvent) {
        const keyCode = event.keyCode;

        if (keyCode === ENTER || keyCode === SPACE) {
            this.openedBy = 'keyboard';

            event.preventDefault();

            if (this.isNested()) {
                // Stop event propagation to avoid closing the parent dropdown.
                event.stopPropagation();

                this.open();
            } else {
                this.toggle();
            }
        }

        if (
            (this.isNested() &&
                ((keyCode === RIGHT_ARROW && this.dir === 'ltr') || (keyCode === LEFT_ARROW && this.dir === 'rtl'))) ||
            (!this.isNested() && keyCode === DOWN_ARROW && this.openByArrowDown)
        ) {
            event.preventDefault();

            this.openedBy = 'keyboard';
            this.open();
        }
    }

    /** Handles click events on the trigger. */
    handleClick(event: MouseEvent): void {
        if (this.isNested()) {
            // Stop event propagation to avoid closing the parent dropdown.
            event.stopPropagation();

            this.open();
        } else {
            this.toggle();
        }
    }

    /**
     * Handles touch start events on the trigger.
     * Needs to be an arrow function so we can easily use addEventListener and removeEventListener.
     */
    private handleTouchStart = () => (this.openedBy = 'touch');

    /** Closes the dropdown and does the necessary cleanup. */
    private destroy(reason: DropdownCloseReason) {
        if (!this.overlayRef || !this.opened) {
            return;
        }

        this.lastDestroyReason = reason;

        this.dropdown.resetActiveItem();

        this.closeSubscription.unsubscribe();
        this.overlayRef.detach();

        if (this.restoreFocus && (reason === 'keydown' || !this.openedBy || !this.isNested())) {
            this.focus(this.openedBy);
        }

        this.openedBy = undefined;

        if (this.dropdown instanceof KbqDropdown) {
            this.dropdown.resetAnimation();

            const animationSubscription = this.dropdown.animationDone.pipe(
                filter((event) => event.toState === 'void'),
                take(1)
            );

            if (this.dropdown.lazyContent) {
                // Wait for the exit animation to finish before detaching the content.
                animationSubscription
                    .pipe(
                        // Interrupt if the content got re-attached.
                        takeUntil(this.dropdown.lazyContent.attached)
                    )
                    .subscribe({
                        next: () => this.dropdown.lazyContent!.detach(),
                        // No matter whether the content got re-attached, reset the this.dropdown.
                        complete: () => this.setIsOpened(false)
                    });
            } else {
                animationSubscription.subscribe(() => this.setIsOpened(false));
            }
        } else {
            this.setIsOpened(false);

            if (this.dropdown.lazyContent) {
                this.dropdown.lazyContent.detach();
            }
        }
    }

    /**
     * This method sets the dropdown state to open and focuses the first item if
     * the dropdown was opened via the keyboard.
     */
    private init(): void {
        this.dropdown.parent = this.isNested() ? this.parent : undefined;
        this.dropdown.direction = this.dir;

        // reset submenu items since they can be initialized as children of root menu
        if (this.parent && !this.dropdown.items.length) {
            this.dropdown.items.reset(Array.from(this.parent.items));
            this.dropdown.items.notifyOnChanges();
        }

        const isVerticalTrigger = this.dropdown.overlapTriggerY && !this.dropdown.overlapTriggerX;

        if (!this.dropdown.parent && !isVerticalTrigger) {
            this.dropdown.triggerWidth = this.dropdown.triggerWidth ?? this.getWidth();
        }

        this.dropdown.focusFirstItem(this.openedBy || 'program');

        this.setIsOpened(true);
    }

    // set state rather than toggle to support triggers sharing a dropdown
    private setIsOpened(isOpen: boolean): void {
        if (isOpen !== this._opened) {
            this.changeDetectorRef.markForCheck();
        }

        this._opened = isOpen;
        this._opened ? this.dropdownOpened.emit() : this.dropdownClosed.emit();

        if (this.isNested()) {
            this.dropdownItemInstance.highlighted = isOpen;
        }
    }

    /**
     * This method checks that a valid instance of KbqDropdown has been passed into
     * kbqDropdownTriggerFor. If not, an exception is thrown.
     */
    private check() {
        if (!this.dropdown) {
            throwKbqDropdownMissingError();
        }
    }

    /**
     * This method creates the overlay from the provided dropdown's template and saves its
     * OverlayRef so that it can be attached to the DOM when open is called.
     */
    private createOverlay(): OverlayRef {
        if (!this.overlayRef) {
            const config = this.getOverlayConfig();

            this.subscribeToPositions(config.positionStrategy as FlexibleConnectedPositionStrategy);
            this.overlayRef = this.overlay.create(config);

            // Consume the `keydownEvents` in order to prevent them from going to another overlay.
            // Ideally we'd also have our keyboard event logic in here, however doing so will
            // break anybody that may have implemented the `KbqDropdownPanel` themselves.
            this.overlayRef.keydownEvents().subscribe();
        }

        return this.overlayRef;
    }

    /**
     * This method builds the configuration object needed to create the overlay, the OverlayState.
     * @returns OverlayConfig
     */
    private getOverlayConfig(): OverlayConfig {
        return new OverlayConfig({
            positionStrategy: this.overlay
                .position()
                .flexibleConnectedTo(this.elementRef)
                .withTransformOriginOn('.kbq-dropdown__panel')
                .withPush(false),
            backdropClass: this.dropdown.backdropClass || 'cdk-overlay-transparent-backdrop',
            scrollStrategy: this.scrollStrategy(),
            direction: this.dir
        });
    }

    /**
     * Listens to changes in the position of the overlay and sets the correct classes
     * on the dropdown based on the new position. This ensures the animation origin is always
     * correct, even if a fallback position is used for the overlay.
     */
    private subscribeToPositions(position: FlexibleConnectedPositionStrategy): void {
        if (this.dropdown.setPositionClasses) {
            position.positionChanges.subscribe((change) => {
                const posX: DropdownPositionX = change.connectionPair.overlayX === 'start' ? 'after' : 'before';
                const posY: DropdownPositionY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';

                this.dropdown.setPositionClasses!(posX, posY);
            });
        }
    }

    /**
     * Sets the appropriate positions on a position strategy
     * so the overlay connects with the trigger correctly.
     * @param positionStrategy Strategy whose position to update.
     */
    private setPosition(positionStrategy: FlexibleConnectedPositionStrategy) {
        let [originX, originFallbackX, overlayX, overlayFallbackX]: HorizontalConnectionPos[] =
            this.dropdown.xPosition === 'before' ? ['end', 'start', 'end', 'start'] : ['start', 'end', 'start', 'end'];

        // eslint-disable-next-line prefer-const
        let [overlayY, overlayFallbackY, originY, originFallbackY]: VerticalConnectionPos[] =
            this.dropdown.yPosition === 'above'
                ? ['bottom', 'top', 'bottom', 'top']
                : ['top', 'bottom', 'top', 'bottom'];

        let offsetY = 0;
        let offsetX = 0;

        if (this.isNested()) {
            // When the dropdown is nested, it should always align itself
            // to the edges of the trigger, instead of overlapping it.
            overlayFallbackX = originX = this.dropdown.xPosition === 'before' ? 'start' : 'end';
            originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
            offsetY = overlayY === 'bottom' ? NESTED_PANEL_TOP_PADDING : -NESTED_PANEL_TOP_PADDING;
            offsetX = NESTED_PANEL_LEFT_PADDING;
        } else {
            if (!this.dropdown.overlapTriggerY) {
                offsetY = defaultOffsetY;
                originY = overlayY === 'top' ? 'bottom' : 'top';
                originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
            }

            if (!this.dropdown.overlapTriggerX) {
                overlayFallbackX = originX = this.dropdown.xPosition === 'before' ? 'start' : 'end';
                originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
            }
        }

        positionStrategy.withPositions([
            {
                originX,
                originY,
                overlayX,
                overlayY,
                offsetY: this.offsetY ?? offsetY,
                offsetX: this.offsetX ?? -offsetX
            },
            {
                originX: originFallbackX,
                originY,
                overlayX: overlayFallbackX,
                overlayY,
                offsetY: this.offsetY ?? offsetY,
                offsetX: this.offsetX ?? offsetX
            },
            {
                originX,
                originY: originFallbackY,
                overlayX,
                overlayY: overlayFallbackY,
                offsetY: this.offsetY ?? -offsetY,
                offsetX: this.offsetX ?? -offsetX
            },
            {
                originX: originFallbackX,
                originY: originFallbackY,
                overlayX: overlayFallbackX,
                overlayY: overlayFallbackY,
                offsetY: this.offsetY ?? -offsetY,
                offsetX: this.offsetX ?? -offsetX
            }
        ]);
    }

    /** Cleans up the active subscriptions. */
    private cleanUpSubscriptions(): void {
        this.closeSubscription.unsubscribe();
        this.hoverSubscription.unsubscribe();
    }

    /** Returns a stream that emits whenever an action that should close the dropdown occurs. */
    private closingActions() {
        const backdrop = this.overlayRef!.backdropClick();
        const outsidePointerEvents = this.overlayRef!.outsidePointerEvents();
        const detachments = this.overlayRef!.detachments();
        const parentClose = this.parent ? this.parent.closed : observableOf();
        const hover = this.parent
            ? this.parent.hovered().pipe(
                  filter((active) => active !== this.dropdownItemInstance),
                  filter(() => this._opened)
              )
            : observableOf();

        return merge(
            backdrop,
            outsidePointerEvents,
            parentClose as Observable<DropdownCloseReason>,
            hover,
            detachments
        );
    }

    /** Handles the cases where the user hovers over the trigger. */
    private handleHover() {
        // Subscribe to changes in the hovered item in order to toggle the panel.
        if (!this.isNested()) {
            return;
        }

        this.hoverSubscription = this.parent
            .hovered()
            // Since we might have multiple competing triggers for the same dropdown (e.g. a nested dropdown
            // with different data and triggers), we have to delay it by a tick to ensure that
            // it won't be closed immediately after it is opened.
            .pipe(
                filter((active) => active === this.dropdownItemInstance && !active.disabled),
                delay(0, asapScheduler)
            )
            .subscribe(() => {
                this.openedBy = 'mouse';

                // If the same dropdown is used between multiple triggers, it might still be animating
                // while the new trigger tries to re-open it. Wait for the animation to finish
                // before doing so. Also interrupt if the user moves to another item.
                if (this.dropdown instanceof KbqDropdown && this.dropdown.isAnimating) {
                    // We need the `delay(0)` here in order to avoid
                    // 'changed after checked' errors in some cases. See #12194.
                    this.dropdown.animationDone
                        .pipe(take(1), delay(0, asapScheduler), takeUntil(this.parent.hovered()))
                        // eslint-disable-next-line rxjs/no-nested-subscribe
                        .subscribe(() => this.open());
                } else {
                    this.open();
                }
            });
    }

    /** Gets the portal that should be attached to the overlay. */
    private getPortal(): TemplatePortal {
        // Note that we can avoid this check by keeping the portal on the dropdown panel.
        // While it would be cleaner, we'd have to introduce another required method on
        // `KbqDropdownPanel`, making it harder to consume.
        if (!this.portal || this.portal.templateRef !== this.dropdown.templateRef) {
            this.portal = new TemplatePortal(this.dropdown.templateRef, this.viewContainerRef);
        }

        return this.portal;
    }

    private getWidth(): string {
        if (!this.isBrowser) return '';

        const nativeElement = this.elementRef.nativeElement;

        const { width, borderRightWidth, borderLeftWidth } = this.window.getComputedStyle(nativeElement);

        return `${parseInt(width) - parseInt(borderRightWidth) - parseInt(borderLeftWidth)}px`;
    }
}
