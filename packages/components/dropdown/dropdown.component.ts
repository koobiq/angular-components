import { AnimationEvent } from '@angular/animations';
import { FocusOrigin } from '@angular/cdk/a11y';
import { Direction } from '@angular/cdk/bidi';
import { DOWN_ARROW, ENTER, UP_ARROW } from '@angular/cdk/keycodes';
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    Directive,
    ElementRef,
    NgZone,
    OnDestroy,
    QueryList,
    Renderer2,
    Signal,
    TemplateRef,
    ViewEncapsulation,
    booleanAttribute,
    computed,
    contentChild,
    contentChildren,
    effect,
    inject,
    input,
    model,
    numberAttribute,
    output,
    signal,
    untracked,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ActiveDescendantKeyManager,
    ESCAPE,
    FocusKeyManager,
    KBQ_PANEL_DEFAULT_MIN_WIDTH,
    KbqPanelMaxWidth,
    KbqPanelMinWidth,
    KbqPanelWidth,
    KbqPoint,
    LEFT_ARROW,
    ListKeyManager,
    RIGHT_ARROW,
    getSafeTriangleVertices,
    isExplicitPanelWidth,
    isPointInRect,
    isPointInTriangle,
    isVerticalMovement
} from '@koobiq/components/core';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { Observable, Subject, Subscription, merge, timer } from 'rxjs';
import { delay, filter, map, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { kbqDropdownAnimations } from './dropdown-animations';
import { KbqDropdownContent } from './dropdown-content.directive';
import { throwKbqDropdownInvalidPositionX, throwKbqDropdownInvalidPositionY } from './dropdown-errors';
import { KbqDropdownItem } from './dropdown-item.component';
import { KbqDropdownSearch } from './dropdown-search';
import {
    KBQ_DROPDOWN_DEFAULT_OPTIONS,
    KBQ_DROPDOWN_PANEL,
    KbqDropdownDefaultOptions,
    KbqDropdownPanel,
    KbqDropdownPositionX,
    KbqDropdownPositionY
} from './dropdown.types';

/** Options for binding a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true }) as EventListenerOptions;

/**
 * Grace period before switching to a different nested trigger hovered while a safe area is
 * protecting the currently open submenu. Without it, sweeping the pointer down a long list of
 * nested triggers on the way to the submenu would flicker each row's submenu open and closed.
 */
export const NESTED_HOVER_SWITCH_DELAY = 50;

/** Class applied to the panel while its safe area is protecting an open submenu, see `activateSafeArea`. */
const SAFE_AREA_ACTIVE_CLASS = 'kbq-dropdown__panel_safe-area-active';

@Directive({
    selector: '[kbqDropdownStaticContent]'
})
export class KbqDropdownStaticContent {}

/** Footer that is rendered below the dropdown options panel. */
@Directive({
    selector: '[kbqDropdownFooter], kbq-dropdown-footer',
    host: { class: 'kbq-dropdown-footer' }
})
export class KbqDropdownFooter {}

@Component({
    selector: 'kbq-dropdown',
    imports: [KbqScrollbarViewport],
    templateUrl: 'dropdown.html',
    /* Component inherits styles from `list`, so `list` variables are imported as the single source of truth. */
    styleUrls: ['dropdown.scss', 'dropdown-tokens.scss'],
    providers: [
        { provide: KBQ_DROPDOWN_PANEL, useExisting: KbqDropdown }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        // Remove the TemplatePortal host box from layout while keeping kbqDropdownStaticContent in the document flow.
        style: 'display: contents'
    },
    animations: [kbqDropdownAnimations.transformDropdown],
    exportAs: 'kbqDropdown'
})
export class KbqDropdown implements AfterContentInit, KbqDropdownPanel, OnDestroy {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private ngZone = inject(NgZone);
    private document = inject(DOCUMENT);
    private readonly renderer = inject(Renderer2);
    private defaultOptions = inject<KbqDropdownDefaultOptions>(KBQ_DROPDOWN_DEFAULT_OPTIONS);
    private readonly destroyRef = inject(DestroyRef);

    private readonly panelFormField = contentChild(KbqFormField);

    /**
     * Signal content queries carry `descendants: true`, and a nested panel declared inside this one's
     * content is part of the same view — so the match has to be narrowed to the fields this panel owns,
     * the way `syncDirectDescendants` narrows the items.
     */
    private readonly searches = contentChildren(KbqDropdownSearch, { descendants: true });

    private readonly search: Signal<KbqDropdownSearch | undefined> = computed(() =>
        this.searches().find((search) => search.panel === this)
    );

    /** Whether the dropdown projects a search form-field. @docs-private */
    readonly hasSearch = computed(() => !!this.panelFormField());

    /** Whether the panel highlights the active item instead of focusing it. @docs-private */
    readonly inSearchMode: Signal<boolean> = computed(() => !!this.search());

    readonly navigationWithWrap = input<boolean>(false);

    // The position members are `model()`s because `kbq-split-button` and `kbq-navbar-item` write them.
    /** Position of the dropdown in the X axis. */
    readonly xPosition = model<KbqDropdownPositionX>(this.defaultOptions.xPosition);

    /** Position of the dropdown in the Y axis. */
    readonly yPosition = model<KbqDropdownPositionY>(this.defaultOptions.yPosition);

    /** Whether the dropdown should overlap its trigger vertically. */
    readonly overlapTriggerY = model<boolean>(this.defaultOptions.overlapTriggerY);

    /** Whether the dropdown should overlap its trigger horizontally. */
    readonly overlapTriggerX = model<boolean>(this.defaultOptions.overlapTriggerX);

    /** Whether the dropdown has a backdrop. */
    readonly hasBackdrop = input(this.defaultOptions.hasBackdrop, { transform: booleanAttribute });

    /** Classes set on the host `kbq-dropdown` element, transferred onto the panel in the overlay container. */
    readonly panelClass = input<string>('', { alias: 'class' });

    /**
     * @deprecated Has no effect. Use `KbqDropdownTrigger.widthOrigin` to make the panel match
     * an element other than the trigger. Will be removed in v21.
     */
    triggerWidth: string;

    /** The position the trigger resolved; supersedes the inputs until one of them changes. */
    private readonly positionOverride = signal<{ posX: KbqDropdownPositionX; posY: KbqDropdownPositionY } | null>(null);

    /** Whether a safe area is protecting an open submenu, see `activateSafeArea`. */
    private readonly safeAreaActive = signal(false);

    /** Config object passed into the dropdown panel's `[class]` binding. */
    protected readonly classList = computed<Record<string, boolean>>(() => {
        const { posX, posY } = this.positionOverride() ?? { posX: this.xPosition(), posY: this.yPosition() };

        const classes: Record<string, boolean> = {
            'kbq-dropdown-before': posX === 'before',
            'kbq-dropdown-after': posX === 'after',
            'kbq-dropdown-center': posX === 'center',
            'kbq-dropdown-above': posY === 'above',
            'kbq-dropdown-below': posY === 'below',
            [SAFE_AREA_ACTIVE_CLASS]: this.safeAreaActive()
        };

        for (const className of this.panelClass().split(' ')) {
            if (className) classes[className] = true;
        }

        return classes;
    });

    /** Current state of the panel animation. */
    panelAnimationState: 'void' | 'enter' = 'void';

    /** Emits whenever an animation on the dropdown completes. */
    animationDone = new Subject<AnimationEvent>();

    /** Whether the dropdown is animating. */
    isAnimating: boolean;

    /** Parent dropdown of the current dropdown panel. */
    parent: KbqDropdownPanel | undefined;

    /** Layout direction of the dropdown. */
    direction: Direction;

    /** Class to be added to the backdrop element. */
    readonly backdropClass = input<string>(this.defaultOptions.backdropClass);

    /**
     * Width of the panel. If set to `auto`, the panel will match the trigger width, but will never be
     * narrower than `panelMinWidth`. If set to null, the panel will grow to match its content.
     * Any other value is used as an exact width, and `panelMinWidth` is not applied.
     */
    readonly panelWidth = input<KbqPanelWidth>(this.defaultOptions.panelWidth ?? null);

    /**
     * Minimum width of the panel in pixels. The panel is never narrower than this, nor than its trigger.
     */
    readonly panelMinWidth = input<KbqPanelMinWidth, unknown>(
        this.defaultOptions.panelMinWidth === undefined
            ? KBQ_PANEL_DEFAULT_MIN_WIDTH
            : this.defaultOptions.panelMinWidth,
        { transform: numberAttribute }
    );

    /**
     * Maximum width of the panel in pixels. Caps how far the panel grows with its content — it never makes
     * the panel narrower than the trigger, and never clamps an explicit `panelWidth`.
     * When null, the `--kbq-dropdown-size-container-width-max` token applies.
     */
    readonly panelMaxWidth = input<KbqPanelMaxWidth, unknown>(
        this.defaultOptions.panelMaxWidth === undefined ? null : this.defaultOptions.panelMaxWidth,
        { transform: numberAttribute }
    );

    /**
     * Whether nested dropdowns opened from this dropdown's items use a "safe area": while the
     * pointer moves from a trigger toward its open submenu, sibling items it crosses over on the way
     * don't prematurely close the submenu. Set on the panel that contains the nested triggers.
     */
    readonly safeArea = input(this.defaultOptions.safeArea ?? true, { transform: booleanAttribute });

    /**
     * `panelMinWidth` as a CSS length for `--kbq-dropdown-size-container-width-min`.
     * @docs-private
     */
    protected readonly panelMinWidthToken = computed(() => {
        const minWidth = this.panelMinWidth();

        // Always a length: dropping the token would fall back to the static 200px floor. It collapses
        // wherever `kbqResolvePanelWidth` applies no minimum, or the panel would overflow its pane.
        if (isExplicitPanelWidth(this.panelWidth()) || !Number.isFinite(minWidth)) return '0px';

        return `${minWidth}px`;
    });

    /** @docs-private */
    readonly templateRef = viewChild.required(TemplateRef);

    private readonly scrollbarViewport = viewChild(KbqScrollbarViewport);

    private readonly queriedItems = contentChildren(KbqDropdownItem, { descendants: true });

    /** Items borrowed from the parent panel, see `adoptItems`. Used only while this panel has none of its own. */
    private readonly adoptedItems = signal<readonly KbqDropdownItem[] | null>(null);

    /**
     * List of the items inside of a dropdown.
     */
    readonly items: Signal<readonly KbqDropdownItem[]> = computed(() => {
        const queried = this.queriedItems();

        return queried.length > 0 ? queried : (this.adoptedItems() ?? queried);
    });

    /**
     * Dropdown content that will be rendered lazily.
     * @docs-private
     */
    readonly lazyContent = contentChild(KbqDropdownContent);

    /** Event emitted when the dropdown is closed. */
    readonly closed = output<void | 'click' | 'keydown' | 'tab'>();

    private keyManager: ListKeyManager<KbqDropdownItem>;

    private activeDescendantKeyManager?: ActiveDescendantKeyManager<KbqDropdownItem>;
    private focusKeyManager?: FocusKeyManager<KbqDropdownItem>;

    private focusOrigin: FocusOrigin = 'program';

    /** Only the direct descendant menu items. */
    private directDescendantItems = new QueryList<KbqDropdownItem>();

    /** Subscription to tab events on the dropdown panel */
    private tabSubscription = Subscription.EMPTY;

    /** Cleans up the safe-area `mousemove` listener. `null` when no safe area is being tracked. */
    private safeAreaCleanup: (() => void) | null = null;

    /** The nested trigger currently protected by the active safe area, if any. */
    private safeAreaOwner: KbqDropdownItem | null = null;

    /**
     * The most recently hovered item, tracked independently of the safe area so that leaving it
     * straight onto a sibling's nested trigger can switch to it immediately instead of waiting for a
     * `mouseenter` that already happened.
     */
    private currentHovered: KbqDropdownItem | null = null;

    /** Emits when the pointer reaches the panel the active safe area protects. */
    private readonly panelReached = new Subject<void>();

    /** Emits the sibling trigger that should open once a forced switch has closed the current one. */
    private readonly switchTarget = new Subject<KbqDropdownItem>();

    /** Watches for a forced switch to a sibling trigger while a safe area is active. */
    private switchTargetSubscription = Subscription.EMPTY;

    constructor() {
        // The search field can show up long after content init — rendered by `kbqDropdownContent` when
        // the panel first opens, or revealed by a structural directive — so the key manager follows the
        // mode instead of being decided once.
        effect(() => {
            const inSearchMode = this.inSearchMode();

            if (!this.keyManager || this.keyManagerInstalledForSearch() === inSearchMode) return;

            this.initKeyManager();

            // A flip while the panel is open leaves focus wherever the previous mode put it: on an item
            // the new manager will not track, or on an input that is being destroyed. Hand it over the
            // same way opening does, deferred so the write lands outside this change detection pass.
            if (this.panelAnimationState === 'enter') {
                this.ngZone.onStable.pipe(take(1)).subscribe(() => this.applyInitialFocus(this.focusOrigin));
            }
        });

        effect(() => this.syncDirectDescendants(this.items()));

        // A partial `KBQ_DROPDOWN_DEFAULT_OPTIONS` can leave these undefined, so the default is not validated.
        const defaultPosX = untracked(this.xPosition);
        const defaultPosY = untracked(this.yPosition);

        // Validates the position (`model()` has no `transform`) and drops the trigger's resolved override.
        effect(() => {
            const posX = this.xPosition();
            const posY = this.yPosition();

            if (posX !== defaultPosX && posX !== 'before' && posX !== 'after' && posX !== 'center') {
                throwKbqDropdownInvalidPositionX();
            }

            if (posY !== defaultPosY && posY !== 'above' && posY !== 'below') {
                throwKbqDropdownInvalidPositionY();
            }

            untracked(() => this.positionOverride.set(null));
        });

        // `class` also lands on the host as an attribute. Strip only the transferred names, so classes
        // other directives put on `<kbq-dropdown>` survive.
        let previousPanelClass = '';

        effect(() => {
            const classes = this.panelClass();

            for (const className of `${previousPanelClass} ${classes}`.split(' ')) {
                if (className) {
                    this.renderer.removeClass(this.elementRef.nativeElement, className);
                }
            }

            previousPanelClass = classes;
        });
    }

    ngAfterContentInit() {
        // Not waiting for the effect: `initKeyManager` and `focusFirstItem` need the descendants now.
        this.syncDirectDescendants(untracked(this.items));

        this.initKeyManager();

        // If a user manually (programmatically) focuses a menu item, we need to reflect that focus
        // change back to the key manager. Note that we don't need to unsubscribe here because focused
        // is internal and we know that it gets completed on destroy.
        this.directDescendantItems.changes
            .pipe(
                startWith(this.directDescendantItems),
                switchMap((items) => merge(...items.map((item: KbqDropdownItem) => item.focused)))
            )
            .subscribe((focusedItem) => this.keyManager.updateActiveItem(focusedItem as KbqDropdownItem));

        this.panelFormField()?.inOverlay.set(true);

        // Driven by the item list rather than by the query, because consumers commonly debounce their
        // own filtering. `delay(0)` keeps the write out of the pass that reported the new items.
        this.directDescendantItems.changes
            .pipe(
                filter(() => !!this.search()),
                delay(0),
                filter(() => this.isActiveItemStale()),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => {
                // An item the highlight sat on is gone. With a query in the field the top result takes
                // over, so that ENTER picks it; with the field cleared nothing is highlighted — but the
                // stale instance still has to be dropped, or ENTER would replay a click on a detached
                // element and the arrows would resume from its index.
                if (this.search()?.value()) {
                    this.keyManager.setFirstItemActive();
                } else {
                    this.resetActiveItem();
                }
            });

        // Internal and completes with the items on destroy, so no explicit unsubscribe is needed.
        this.hovered().subscribe((item) => {
            this.currentHovered = item;

            // Hovering doesn't focus the item in search mode, so arrowing on has to resume from it.
            // Disabled items are skipped, the same way the key manager skips them for the arrows.
            if (this.inSearchMode() && !item.disabled()) {
                this.keyManager.setActiveItem(item);
            }
        });
    }

    ngOnDestroy() {
        this.directDescendantItems.destroy();
        this.tabSubscription.unsubscribe();
        this.deactivateSafeArea();
        this.panelReached.complete();
        this.switchTarget.complete();
    }

    /** Stream that emits whenever the hovered dropdown item changes. */
    hovered(): Observable<KbqDropdownItem> {
        const itemChanges = this.directDescendantItems.changes as Observable<QueryList<KbqDropdownItem>>;

        return itemChanges.pipe(
            startWith(this.directDescendantItems),
            switchMap((items) => merge(...items.map((item: KbqDropdownItem) => item.hovered)))
        ) as Observable<KbqDropdownItem>;
    }

    /**
     * Tracks the pointer against the triangle spanned by `origin` and the protected submenu, closing
     * `owner`'s submenu via `onExit` if the pointer leaves the triangle without first reaching the
     * panel. Meanwhile, if a different nested trigger is hovered, `switchTarget()` emits it —
     * immediately if it's outside the triangle, otherwise after a grace period (see
     * `NESTED_HOVER_SWITCH_DELAY`). Replaces any safe area already being tracked.
     * @docs-private
     */
    activateSafeArea(owner: KbqDropdownItem, origin: KbqPoint, getPanelRect: () => DOMRect, onExit: () => void): void {
        this.deactivateSafeArea();
        this.safeAreaOwner = owner;
        this.safeAreaActive.set(true);

        this.safeAreaCleanup = this.ngZone.runOutsideAngular(() => {
            const listener = (event: MouseEvent) => {
                const point: KbqPoint = { x: event.clientX, y: event.clientY };
                const panelRect = getPanelRect();

                if (isPointInRect(point, panelRect)) {
                    this.panelReached.next();
                    this.deactivateSafeArea();

                    return;
                }

                if (!isPointInTriangle(point, getSafeTriangleVertices(origin, panelRect))) {
                    const switchTo =
                        this.currentHovered?.isNested &&
                        this.currentHovered !== owner &&
                        !this.currentHovered.disabled()
                            ? this.currentHovered
                            : null;

                    this.deactivateSafeArea();

                    this.ngZone.run(() => {
                        onExit();

                        if (switchTo) {
                            this.switchTarget.next(switchTo);
                        }
                    });
                }
            };

            this.document.addEventListener('mousemove', listener, passiveEventListenerOptions);

            return () => this.document.removeEventListener('mousemove', listener, passiveEventListenerOptions);
        });

        this.switchTargetSubscription = this.hovered()
            .pipe(
                filter((active) => active.isNested && active !== owner && !active.disabled()),
                switchMap((active) =>
                    timer(NESTED_HOVER_SWITCH_DELAY).pipe(
                        map(() => active),
                        takeUntil(this.panelReached)
                    )
                )
            )
            .subscribe((active) => {
                this.deactivateSafeArea();
                onExit();
                this.switchTarget.next(active);
            });
    }

    /**
     * Stops tracking the current safe area, if any.
     * @docs-private
     */
    deactivateSafeArea(): void {
        this.safeAreaCleanup?.();
        this.safeAreaCleanup = null;
        this.safeAreaOwner = null;
        this.switchTargetSubscription.unsubscribe();
        this.switchTargetSubscription = Subscription.EMPTY;

        if (untracked(this.safeAreaActive)) {
            // The mousemove listener that can reach this runs outside the Angular zone, so re-enter it
            // to make sure the class update is picked up by change detection.
            this.ngZone.run(() => this.safeAreaActive.set(false));
        }
    }

    /**
     * Whether a safe area is currently being tracked.
     * @docs-private
     */
    isSafeAreaActive(): boolean {
        return this.safeAreaCleanup !== null;
    }

    /**
     * Whether `item` is the nested trigger currently protected by an active safe area.
     * @docs-private
     */
    isSafeAreaOwner(item: KbqDropdownItem): boolean {
        return this.safeAreaOwner === item;
    }

    /**
     * Stream that emits when the pointer reaches the panel the active safe area protects (as opposed
     * to leaving the safe area, which closes the panel instead).
     * @docs-private
     */
    onPanelReached(): Observable<void> {
        return this.panelReached.asObservable();
    }

    /**
     * Stream that emits the sibling trigger that should open once a forced safe-area switch has
     * closed the trigger it was protecting.
     * @docs-private
     */
    onSwitchTarget(): Observable<KbqDropdownItem> {
        return this.switchTarget.asObservable();
    }

    /** Handle a keyboard event from the dropdown, delegating to the appropriate action. */
    handleKeydown(event: KeyboardEvent) {
        const keyCode = event.keyCode;

        switch (keyCode) {
            case ESCAPE:
                this.closed.emit('keydown');
                break;
            case LEFT_ARROW:
                if (this.parent && this.direction === 'ltr') {
                    this.closed.emit('keydown');
                }

                break;
            case RIGHT_ARROW:
                if (this.parent && this.direction === 'rtl') {
                    this.closed.emit('keydown');
                }

                break;
            case ENTER:
                // The highlighted item never sees the key event itself, so replay it as a click and let
                // consumer handlers and nested triggers behave exactly as they do for the mouse.
                if (this.inSearchMode() && this.keyManager.activeItem) {
                    event.preventDefault();
                    // The click can close the dropdown synchronously, unregistering the overlay from the
                    // CDK keyboard dispatcher before this keydown reaches `body` — where it would be
                    // handed to whichever overlay was opened earlier.
                    event.stopPropagation();
                    this.keyManager.activeItem.getHostElement().click();
                }

                return;
            default:
                // Home/End too: with a stale `mouse` origin the item they move to is not scrolled into view.
                if (isVerticalMovement(event)) {
                    this.setFocusOrigin('keyboard');
                    this.keyManager.onKeydown(event);

                    // Only the arrows reveal: other keys would scroll the list back on each keystroke.
                    if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
                        this.revealActiveItem();
                    }
                } else {
                    this.keyManager.onKeydown(event);
                }

                return;
        }

        // Don't allow the event to propagate if we've already handled it, or it may
        // end up reaching other overlays that were opened earlier.
        event.stopPropagation();
    }

    /**
     * Applies the panel's initial focus, see `applyInitialFocus`.
     * @param origin Action from which the focus originated. Used to set the correct styling.
     */
    focusFirstItem(origin: FocusOrigin = 'program'): void {
        // When the content is rendered lazily, it takes a bit before the items are inside the DOM.
        if (this.lazyContent()) {
            this.ngZone.onStable.pipe(take(1)).subscribe(() => this.applyInitialFocus(origin));
        } else {
            this.applyInitialFocus(origin);
        }
    }

    /**
     * Applies focus when the dropdown is opened.
     *
     * A projected search field takes the caret for every origin and keeps it: the first arrow key press
     * only highlights an item. Without one, opening by mouse or touch focuses the panel rather than an
     * item, so that nothing is highlighted while keyboard events still reach the panel; any other origin
     * highlights the first item. A submenu of a search panel focuses nothing at all, so that hovering it
     * does not pull the caret out of the query.
     */
    private applyInitialFocus(origin: FocusOrigin): void {
        // The origin should be set even when no item gets activated,
        // since `close` relies on it to emit the correct close reason.
        this.setFocusOrigin(origin);

        const search = this.search();

        if (search) {
            search.focus();
        } else if (this.parent?.inSearchMode?.()) {
            return;
        } else if (origin === 'mouse' || origin === 'touch') {
            this.focusPanel();
        } else {
            this.keyManager.setFirstItemActive();
        }
    }

    /**
     * Moves focus back into the projected search field, reporting whether there was one. A nested panel
     * restores focus through this instead of onto its trigger item, which would strand the caret outside
     * the query.
     * @docs-private
     */
    restoreFocus(): boolean {
        const search = this.search();

        search?.focus();

        return !!search;
    }

    /** Moves DOM focus onto the dropdown panel so that keydown events keep being handled. */
    private focusPanel(): void {
        // The panel is rendered into the overlay through a `TemplatePortal`, so it can't be
        // queried with a `ViewChild`. If there are no rendered items, focus stays on the trigger,
        // same as `setFirstItemActive` no-ops in that case.
        const panel = this.directDescendantItems.first?.getHostElement().closest<HTMLElement>('.kbq-dropdown__panel');

        panel?.focus({ preventScroll: true });
    }

    /**
     * Resets the active item in the dropdown. This is used when the dropdown is opened, allowing
     * the user to start from the first option when pressing the down arrow.
     */
    resetActiveItem() {
        this.keyManager.activeItem?.resetStyles();
        this.keyManager.setActiveItem(-1);
    }

    /**
     * Lends this panel the parent's items, for a submenu whose own items were initialised as children of
     * the root panel. Ignored once the panel has items of its own.
     * @docs-private
     */
    adoptItems(items: readonly KbqDropdownItem[]): void {
        this.adoptedItems.set(items);
    }

    /**
     * Adds classes to the dropdown panel based on its position. Can be used by
     * consumers to add specific styling based on the position.
     * @param posX Position of the dropdown along the x axis.
     * @param posY Position of the dropdown along the y axis.
     * @docs-private
     */
    setPositionClasses(
        posX: KbqDropdownPositionX = untracked(this.xPosition),
        posY: KbqDropdownPositionY = untracked(this.yPosition)
    ) {
        this.positionOverride.set({ posX, posY });
    }

    /** Starts the enter animation. */
    startAnimation() {
        this.panelAnimationState = 'enter';
    }

    /** Resets the panel animation to its initial state. */
    resetAnimation() {
        this.panelAnimationState = 'void';
    }

    /** Callback that is invoked when the panel animation completes. */
    onAnimationDone(event: AnimationEvent) {
        if (event.toState === 'enter') {
            this.scrollbarViewport()?.flashScrollIndicators();
        }

        this.animationDone.next(event);
        this.isAnimating = false;
    }

    onAnimationStart(event: AnimationEvent) {
        this.isAnimating = true;

        // Scroll the content element to the top as soon as the animation starts. This is necessary,
        // because we move focus to the first item while it's still being animated, which can throw
        // the browser off when it determines the scroll position. Alternatively we can move focus
        // when the animation is done, however moving focus asynchronously will interrupt screen
        // readers which are in the process of reading out the dropdown already.
        if (event.toState === 'enter' && this.keyManager.activeItemIndex <= 0) {
            this.scrollbarViewport()?.scrollToTop();
        }
    }

    close() {
        this.closed.emit(this.focusOrigin === 'keyboard' ? 'keydown' : 'click');
    }

    /**
     * With a search field the caret has to stay in the input, so the active item is only highlighted and
     * typeahead is left off — it would race the query the user is typing.
     */
    private initKeyManager(): void {
        // The forked `ListKeyManager` subscribes to the item list in its constructor and has no teardown,
        // so a manager is built once per mode and kept — rebuilding on every switch would strand the
        // previous one, twice per open/close cycle with lazy content. The outgoing manager's highlight
        // has to go with it: the incoming one will never call `setInactiveStyles` on an item it does not
        // know about.
        if (this.keyManager) {
            this.resetActiveItem();
        }

        if (this.inSearchMode()) {
            this.activeDescendantKeyManager ??= this.configureKeyManager(
                new ActiveDescendantKeyManager<KbqDropdownItem>(this.directDescendantItems)
            );
            this.keyManager = this.activeDescendantKeyManager;
        } else {
            // Home/End only without a search field, where they belong to the caret.
            this.focusKeyManager ??= this.configureKeyManager(
                new FocusKeyManager<KbqDropdownItem>(this.directDescendantItems).withTypeAhead().withHomeAndEnd()
            );
            this.keyManager = this.focusKeyManager;
        }

        this.tabSubscription.unsubscribe();
        this.tabSubscription = this.keyManager.tabOut.subscribe(() => this.closed.emit('tab'));
    }

    /** Which mode the installed key manager serves; the wanted one is `inSearchMode()`. */
    private keyManagerInstalledForSearch(): boolean {
        return this.keyManager === this.activeDescendantKeyManager;
    }

    private configureKeyManager<T extends ListKeyManager<KbqDropdownItem>>(keyManager: T): T {
        return untracked(this.navigationWithWrap) ? (keyManager.withWrap() as T) : keyManager;
    }

    private setFocusOrigin(origin: FocusOrigin): void {
        this.focusOrigin = origin;

        if (this.keyManager instanceof FocusKeyManager) {
            this.keyManager.setFocusOrigin(origin);
        }
    }

    private isActiveItemStale(): boolean {
        const activeItem = this.keyManager.activeItem;

        return !activeItem || !this.directDescendantItems.some((item) => item === activeItem);
    }

    /**
     * Reveals the highlighted item, which the browser only does on its own for real focus. Mirrors the
     * reveal `kbqFocusAndReveal` performs for focused elements.
     */
    private revealActiveItem(): void {
        if (!this.inSearchMode()) return;

        this.keyManager.activeItem?.getHostElement().scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }

    /**
     * Narrows `items` down to the ones this panel owns. We collect the descendants this way, because
     * `items` can include items that are part of child menus, and using a custom way of registering
     * items is unreliable when it comes to maintaining the item order.
     */
    private syncDirectDescendants(items: readonly KbqDropdownItem[]): void {
        const owned = items.filter((item) => item.parentDropdownPanel === this);
        const current = this.directDescendantItems.toArray();

        // Re-notifying an unchanged list would restart every stream keyed on `changes`.
        if (owned.length === current.length && owned.every((item, index) => item === current[index])) return;

        this.directDescendantItems.reset(owned);
        this.directDescendantItems.notifyOnChanges();
    }
}
