import { FocusMonitor, type FocusOrigin } from '@angular/cdk/a11y';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
    type AfterContentChecked,
    type AfterContentInit,
    afterNextRender,
    type AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChildren,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    input,
    model,
    NgZone,
    type OnDestroy,
    type QueryList,
    Renderer2,
    signal,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
    FocusKeyManager,
    isHorizontalMovement,
    isVerticalMovement,
    KBQ_WINDOW,
    kbqLeaveTabOrderOnTabOut,
    KbqLocaleOverridesDirective,
    KbqOverlayLayerExclude,
    kbqQueryListFrom,
    LEFT_ARROW,
    RIGHT_ARROW,
    TAB
} from '@koobiq/components/core';
import { KbqDropdown, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import {
    KbqOverflowFitEngine,
    KbqOverflowFitResult,
    KbqOverflowFitSubject,
    kbqOverflowRecalculationTriggers
} from '@koobiq/components/overflow-items';
import {
    distinctUntilChanged,
    EMPTY,
    fromEvent,
    map,
    merge,
    type Observable,
    Subject,
    type Subscription,
    switchMap
} from 'rxjs';
import { startWith } from 'rxjs/operators';
import {
    KbqNavbarFocusableItem,
    type KbqNavbarFocusableItemEvent,
    KbqNavbarItem,
    KbqNavbarRectangleElement
} from './navbar-item.component';
import { KBQ_NAVBAR_DEFAULT_LOCALE_CONFIGURATION, KBQ_NAVBAR_LOCALE_CONFIGURATION } from './navbar-locale';
import { kbqNavbarTooltipOptionsProvider } from './navbar-tooltip-defaults';
import { getOuterWidth } from './outer-width';

@Directive()
export class KbqFocusableComponent implements AfterContentChecked, AfterContentInit, AfterViewInit, OnDestroy {
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    /** @docs-private */
    protected readonly focusMonitor = inject(FocusMonitor);
    /** @docs-private */
    protected readonly destroyRef = inject(DestroyRef);

    /** The focusable items projected into the navbar, in projection order. @docs-private */
    protected readonly focusableItemsQuery = contentChildren<KbqNavbarFocusableItem>(
        forwardRef(() => KbqNavbarFocusableItem),
        { descendants: true }
    );

    /** The focusable items as a `QueryList`, kept in step with the query. @docs-private */
    protected readonly focusableItemsList = kbqQueryListFrom(this.focusableItemsQuery);

    /** @docs-private */
    get focusableItems(): QueryList<KbqNavbarFocusableItem> {
        return this.focusableItemsList();
    }

    /** @docs-private */
    keyManager: FocusKeyManager<KbqNavbarFocusableItem> = new FocusKeyManager<KbqNavbarFocusableItem>(
        this.focusableItemsList()
    ).withTypeAhead();

    /**
     * Tab index of the navbar host. The navbar owns the single tab stop of the whole widget and moves focus
     * between its items with the arrow keys. A navbar without a focusable item stays out of the tab order.
     */
    readonly tabIndex = model<number>(0);

    /**
     * Tab index the host renders: {@link tabIndex}, or `-1` while there is no item to hand the focus to. Derived
     * rather than written to the model, which a consumer may bind.
     *
     * @docs-private
     */
    protected readonly renderedTabIndex = computed(() => (this.noFocusableItems() ? -1 : this.tabIndex()));

    /** Whether there is no focusable item to hand the navbar's tab stop to. @docs-private */
    protected noFocusableItems(): boolean {
        return this.focusableItemsQuery().length === 0;
    }

    /**
     * Accessible name of the navigation landmark. Set it whenever a page renders more than one navbar, so
     * assistive technology can tell them apart.
     */
    readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

    private lastFocusOrigin: FocusOrigin = null;

    private cachedOptionFocusChanges: Observable<KbqNavbarFocusableItemEvent> | null = null;
    private cachedOptionBlurChanges: Observable<KbqNavbarFocusableItemEvent> | null = null;

    /** Focus events of every focusable item, merged once per change of the item set. @docs-private */
    get optionFocusChanges(): Observable<KbqNavbarFocusableItemEvent> {
        return (this.cachedOptionFocusChanges ??= merge(...this.focusableItems.map((item) => item.onFocus)));
    }

    /** Blur events of every focusable item, merged once per change of the item set. @docs-private */
    get optionBlurChanges(): Observable<KbqNavbarFocusableItemEvent> {
        return (this.cachedOptionBlurChanges ??= merge(...this.focusableItems.map((option) => option.onBlur)));
    }

    /** @docs-private */
    ngAfterContentInit(): void {
        kbqLeaveTabOrderOnTabOut(
            this.keyManager.tabOut,
            this.elementRef.nativeElement,
            () => this.renderedTabIndex(),
            this.destroyRef
        );

        this.focusableItems.changes
            .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.resetOptions());
    }

    /** @docs-private */
    ngAfterContentChecked(): void {
        // Syncs the list here so `changes` emits after the projected items are bound and before the host bindings.
        this.focusableItemsList();
    }

    /**
     * Monitored with `checkChildren`, because the navbar is one composite widget: the host owns the tab stop
     * but hands focus straight to an item, and without it that hand-off reads as the navbar being blurred.
     *
     * @docs-private
     */
    ngAfterViewInit(): void {
        this.focusMonitor
            .monitor(this.elementRef, true)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((focusOrigin) => {
                // A child losing focus to another child reports `null` in between; keep the origin the arrow
                // keys travel on, and let a real blur of the whole navbar be handled by `blur()`.
                if (focusOrigin === null) return;

                this.lastFocusOrigin = focusOrigin;
                this.keyManager.setFocusOrigin(focusOrigin);
            });
    }

    /** @docs-private */
    ngOnDestroy() {
        this.dropSubscriptions();

        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    /** Host element of the navbar. @docs-private */
    getNativeElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    /** @docs-private */
    focus(): void {
        if (this.focusableItems.length === 0) {
            return;
        }

        // Pointer focus on the navbar host (e.g. clicking empty area) should not
        // steal keyboard focus into the first item, which would surface its tooltip.
        if (this.lastFocusOrigin === 'mouse' || this.lastFocusOrigin === 'touch') {
            return;
        }

        this.keyManager.setFirstItemActive();
    }

    /** @docs-private */
    blur() {
        if (!this.hasFocusedItem()) {
            this.keyManager.setActiveItem(-1);
        }

        this.changeDetectorRef.markForCheck();
    }

    /** @docs-private */
    protected resetOptions() {
        this.dropSubscriptions();
        this.listenToOptionsFocus();
    }

    /** @docs-private */
    protected dropSubscriptions() {
        this.optionFocusSubscription?.unsubscribe();
        this.optionFocusSubscription = null;

        this.optionBlurSubscription?.unsubscribe();
        this.optionBlurSubscription = null;

        this.cachedOptionFocusChanges = null;
        this.cachedOptionBlurChanges = null;
    }

    private optionFocusSubscription: Subscription | null = null;
    private optionBlurSubscription: Subscription | null = null;

    private listenToOptionsFocus(): void {
        this.optionFocusSubscription = this.optionFocusChanges.subscribe((event) => {
            const index: number = this.focusableItems.toArray().indexOf(event.item);

            if (this.isValidIndex(index)) {
                this.keyManager.updateActiveItem(index);
            }
        });

        this.optionBlurSubscription = this.optionBlurChanges.subscribe(() => this.blur());
    }

    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.focusableItems.length;
    }

    private hasFocusedItem() {
        return this.focusableItems.some((item) => item.hasFocus);
    }
}

@Directive({
    // The attribute form too: the navbar's own ng-content selector projects it, so a container written that
    // way must carry the class and the directive like an element one.
    selector: 'kbq-navbar-container, [kbq-navbar-container]',
    host: {
        class: 'kbq-navbar-container'
    }
})
export class KbqNavbarContainer {}

@Component({
    selector: 'kbq-navbar',
    imports: [
        KbqIcon,
        KbqNavbarItem,
        KbqNavbarFocusableItem,
        KbqNavbarRectangleElement,
        KbqDropdown,
        KbqDropdownTrigger
    ],
    template: `
        <ng-content select="[kbq-navbar-container], kbq-navbar-container" />

        <kbq-navbar-item
            #moreTrigger
            class="kbq-navbar__more-trigger kbq-navbar__more-trigger_hidden"
            [attr.inert]="!moreTriggerVisible() || null"
            [aria-label]="moreAriaLabel()"
            [kbqDropdownTriggerFor]="moreDropdown"
        >
            <i kbq-icon="kbq-ellipsis_16" color="contrast"></i>
        </kbq-navbar-item>

        <kbq-dropdown #moreDropdown="kbqDropdown" class="kbq-navbar__more-dropdown">
            <div
                #morePanelContent
                class="kbq-navbar__more-content"
                (click)="onMorePanelContentClick($event)"
                (keydown)="onMorePanelKeydown($event)"
            ></div>
        </kbq-dropdown>
    `,
    styleUrls: [
        './navbar.scss',
        './navbar-item.scss',
        './navbar-brand.scss',
        './navbar-divider.scss',
        './navbar-tokens.scss'
    ],
    providers: [kbqNavbarTooltipOptionsProvider],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-navbar',
        role: 'navigation',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.tabindex]': 'renderedTabIndex()',
        '(focus)': 'focus()',
        '(blur)': 'blur()',
        '(keydown)': 'onKeyDown($event)'
    },
    hostDirectives: [
        KbqOverlayLayerExclude,
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ]
})
export class KbqNavbar extends KbqFocusableComponent implements AfterViewInit, AfterContentInit, AfterContentChecked {
    private readonly platform = inject(Platform);
    private readonly ngZone = inject(NgZone);
    private readonly window = inject(KBQ_WINDOW);
    private readonly document = inject(DOCUMENT);

    /**
     * Localized strings of the navbar, the accessible name of the «Ещё» trigger among them, see
     * `KbqNavbarLocaleConfiguration`.
     */
    readonly localeConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'navbar',
        KBQ_NAVBAR_LOCALE_CONFIGURATION
    );

    /**
     * Accessible name of the «Ещё» trigger: the active locale's `more`, or the default's — a full custom
     * configuration that leaves `more` out must not leave the trigger an unnamed icon-only button.
     */
    protected readonly moreAriaLabel = computed(
        () => this.localeConfiguration().more ?? KBQ_NAVBAR_DEFAULT_LOCALE_CONFIGURATION.more ?? null
    );

    /** The measurement and hiding engine of the third fit stage, shared with `KbqOverflowItems`. */
    private readonly engine = new KbqOverflowFitEngine(this.window);

    private readonly renderer = inject(Renderer2);

    /** @docs-private */
    readonly rectangleElements = contentChildren<KbqNavbarRectangleElement>(
        forwardRef(() => KbqNavbarRectangleElement),
        { descendants: true }
    );

    /** @docs-private */
    readonly navbarItems = contentChildren<KbqNavbarItem>(
        forwardRef(() => KbqNavbarItem),
        { descendants: true }
    );

    /** The «Ещё» trigger, whose host the navbar moves into its last container. */
    private readonly moreTriggerElement = viewChild('moreTrigger', { read: ElementRef<HTMLElement> });

    /** The focusable side of the «Ещё» trigger, joined to the roving focus order while it is shown. */
    private readonly moreTriggerFocusable = viewChild(KbqNavbarFocusableItem);

    /** The dropdown trigger of the «Ещё» panel, an internal view child. */
    private readonly moreDropdownTrigger = viewChild(KbqDropdownTrigger);

    /** The rectangle of the «Ещё» trigger, whose orientation the content-query effect never reaches. */
    private readonly moreTriggerRectangle = viewChild(KbqNavbarRectangleElement);

    /** The container the hidden items are moved into while the «Ещё» panel is open. */
    private readonly morePanelContent = viewChild('morePanelContent', { read: ElementRef<HTMLElement> });

    /** Whether the «Ещё» trigger is shown, i.e. whether anything is hidden under it. @docs-private */
    protected readonly moreTriggerVisible = signal(false);

    /** The «Ещё» trigger as the engine's result slot, its width joining the budget once it is shown. */
    private readonly moreResult: KbqOverflowFitResult = {
        hide: () => this.setMoreTriggerHidden(true),
        show: () => this.setMoreTriggerHidden(false)
    };

    /**
     * Writes the «Ещё» trigger's visibility: the class, synchronously, and the signal that follows it. The class
     * cannot be a binding: the engine measures the trigger's width in the same pass it shows it, and a binding
     * reaches the DOM only at the next change detection, which would budget a `display: none` box as nothing.
     */
    private setMoreTriggerHidden(hidden: boolean): void {
        const element = this.moreTriggerElement()?.nativeElement;

        this.moreTriggerVisible.set(!hidden);

        if (!element) return;

        if (hidden) {
            this.renderer.addClass(element, 'kbq-navbar__more-trigger_hidden');
        } else {
            this.renderer.removeClass(element, 'kbq-navbar__more-trigger_hidden');
        }
    }

    /** Items moved into the «Ещё» panel, with the anchors they return to. */
    private readonly movedToMorePanel = new Map<
        KbqNavbarRectangleElement,
        { container: HTMLElement; anchor: Element | null; item: KbqNavbarItem | null; wasCollapsed: boolean }
    >();

    /** Dividers whose both neighbours are hidden, which move into the «Ещё» panel with the items. */
    private readonly panelDividers = new Set<KbqNavbarRectangleElement>();

    /** Focusable items of the open «Ещё» panel, in panel order. */
    private readonly morePanelItems = signal<KbqNavbarFocusableItem[]>([]);

    private readonly morePanelItemsList = kbqQueryListFrom(this.morePanelItems);

    private morePanelKeyManager: FocusKeyManager<KbqNavbarFocusableItem> | null = null;

    /** Raw `resize` events of the window, fed from outside the Angular zone. @docs-private */
    readonly resizeStream = new Subject<Event>();

    /** Reports the navbar host's resizes, the page-level element aside. */
    private readonly hostResizeObserver = inject(SharedResizeObserver);

    /** The page element whose resize recalculates the fit, on top of the navbar itself. */
    private readonly recalculationTargets = signal<Element | Element[]>(this.document.body);

    private readonly resizeDebounceInterval: number = 100;

    /** The debounce of a burst of recalculation triggers, the resize one of the past included. */
    private readonly recalculationDebounce = signal(this.resizeDebounceInterval);

    private get width(): number {
        return this.elementRef.nativeElement.getBoundingClientRect().width;
    }

    /**
     * Room the content needs: the outer widths of the containers' laid-out children plus the containers' own margins,
     * which hold the gap between them. The containers' boxes are not measured whole, so a container styled to grow
     * still reports what it needs rather than what it was given. Items hidden under «Ещё» are taken out of the flow
     * and report nothing.
     */
    private contentWidth(containers: readonly HTMLElement[]): number {
        return containers.reduce((total, container) => {
            const { marginLeft, marginRight } = this.window.getComputedStyle(container);
            const childrenWidth = this.measuredChildren(container).reduce(
                (acc, element) => acc + getOuterWidth(element, this.window),
                0
            );

            return total + childrenWidth + (parseFloat(marginLeft) || 0) + (parseFloat(marginRight) || 0);
        }, 0);
    }

    private get collapsableItems(): KbqNavbarItem[] {
        return this.navbarItems()
            .filter((item) => item.icon() && item.title() && item.collapsable())
            .reverse();
    }

    constructor() {
        super();

        this.destroyRef.onDestroy(() => this.resizeStream.complete());

        // Raw resize events must not enter the zone: a single drag fires hundreds of them, and only the
        // debounced recompute at the end of the burst is worth a change detection pass.
        if (this.platform.isBrowser) {
            this.ngZone.runOutsideAngular(() => {
                fromEvent(this.window, 'resize')
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((event) => this.resizeStream.next(event));
            });
        }

        // The recalculation triggers: a change of the navbar's actual width, a web font loading, the projected
        // elements changing, and the resizes of the page, all debounced. The raw window-resize event and the
        // host's own resize observer report the same width change a frame apart, so they are one trigger
        // deduplicated on the measured width: the fit runs once per actual width, not once per source.
        kbqOverflowRecalculationTriggers({
            additionalTargets: this.recalculationTargets,
            debounceTime: this.recalculationDebounce,
            extra: [
                merge(this.resizeStream, this.hostResizeObserver.observe(this.elementRef.nativeElement)).pipe(
                    map(() => this.width),
                    distinctUntilChanged(),
                    map(() => undefined)
                ),
                toObservable(this.rectangleElements).pipe(map(() => undefined))
            ]
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.ngZone.run(this.updateExpandedStateForItems));

        // The hidden items ride along into the panel the trigger opens, and back when it closes: the original
        // elements, not copies, keep their submenus, routers and listeners working.
        toObservable(this.moreDropdownTrigger)
            .pipe(
                switchMap((trigger) =>
                    trigger
                        ? merge(
                              outputToObservable(trigger.dropdownOpened).pipe(map(() => true)),
                              outputToObservable(trigger.dropdownClosed).pipe(map(() => false))
                          )
                        : EMPTY
                ),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((opened) => (opened ? this.onMorePanelOpened() : this.onMorePanelClosed()));

        effect(() => {
            this.rectangleElements().forEach((item) => (item.orientation = 'horizontal'));

            // The trigger is a view child, not projected content: no query of the navbar hands it to the loop
            // above, so its orientation is written here — with the horizontal styling, keydown branch and
            // tooltip placement the loop would have given it.
            const trigger = this.moreTriggerRectangle();

            if (trigger) trigger.orientation = 'horizontal';
        });

        // Note: this wait is required for loading and rendering fonts for icons;
        // unfortunately we cannot control font rendering. Bound to the component's lifetime, unlike a bare
        // `setTimeout`, so it can never run against a destroyed view.
        afterNextRender(() => {
            this.placeMoreTrigger();

            this.updateExpandedStateForItems();
        });
    }

    /** @docs-private */
    override ngAfterContentInit(): void {
        super.ngAfterContentInit();

        this.keyManager.withVerticalOrientation(false).withHorizontalOrientation('ltr');
    }

    /** @docs-private */
    ngAfterContentChecked(): void {
        super.ngAfterContentChecked();

        this.focusableItemsWithTriggerList();
    }

    /**
     * The focusable items with the «Ещё» trigger appended, visible only while there is something hidden.
     */
    private readonly focusableItemsWithTrigger = computed<readonly KbqNavbarFocusableItem[]>(() => {
        const items = this.focusableItemsQuery();
        const trigger = this.moreTriggerFocusable();

        return trigger && this.moreTriggerVisible() ? [...items, trigger] : items;
    });

    private readonly focusableItemsWithTriggerList = kbqQueryListFrom(this.focusableItemsWithTrigger);

    /** @docs-private */
    override get focusableItems(): QueryList<KbqNavbarFocusableItem> {
        return this.focusableItemsWithTriggerList();
    }

    protected override noFocusableItems(): boolean {
        return super.noFocusableItems() && !(this.moreTriggerFocusable() && this.moreTriggerVisible());
    }

    /**
     * Recomputes which items fit into the current navbar width, collapsing the collapsable ones into icons first
     * and hiding what still does not fit under the «Ещё» trigger.
     *
     * Every measurement is taken up front, and only then is anything written: collapsing or hiding an item
     * invalidates layout, so a measurement taken afterwards forces a synchronous reflow for each of the remaining
     * items. The width an item frees by collapsing comes from its own record of both presentations, see
     * `KbqNavbarItem.measureWidths()`; the width it frees by hiding is its own outer width.
     *
     * @docs-private
     */
    updateExpandedStateForItems = () => {
        // Untracked: called from a consumer's `effect()`, the items and their collapsed state read here would make the
        // effect run again on every collapse it makes.
        untracked(() => this.fitNavbarItems());
    };

    /** Body of `updateExpandedStateForItems()`. */
    private fitNavbarItems(): void {
        // The items sit in the «Ещё» panel while it is open: bring them back before anything is measured.
        this.returnItemsFromMorePanel();

        this.placeMoreTrigger();

        // A navbar that is not rendered, e.g. hidden in an inactive tab, has nothing to measure — but a panel
        // floating over the page from a hidden navbar closes rather than waits for the navbar to come back.
        if (!this.width) {
            if (this.moreDropdownTrigger()?.opened) {
                this.moreDropdownTrigger()?.close();
            }

            return;
        }

        // One pass over the containers and the rectangles in them: the stages below share it, and recomputing
        // it per stage would re-read the DOM children and the element queries for nothing.
        const containers = this.containerElements();
        const rectangles = this.containerRectangles(containers);
        const candidates = rectangles.filter((rectangle) => !isDivider(rectangle));

        // Stage 0: everything shown, the result hidden — the state to measure in.
        this.engine.showAll(rectangles, this.moreResult);

        // Stage 1: collapse into icons, the fit the navbar has always had.
        this.fitItems(containers);

        // Stage 2: hide under «Ещё», from the end, the trigger's width joining the budget once it is shown.
        this.engine.hideOverflownItems([...candidates].reverse(), this.navbarFitSubject(containers), this.moreResult);

        // Stage 3: dividers, by the state of their neighbours.
        this.fitDividers(containers, rectangles);

        // The panel, kept open through a resize, takes the new hidden set live — and closes once nothing is left
        // to hide, the trigger that opens it gone with them.
        const dropdownTrigger = this.moreDropdownTrigger();

        if (dropdownTrigger?.opened) {
            if (this.moreTriggerVisible()) {
                this.moveItemsIntoMorePanel();
            } else {
                dropdownTrigger.close();
            }
        }
    }

    /** Body of the first fit stage, unchanged apart from measuring after everything is shown. */
    private fitItems(containers: readonly HTMLElement[]): void {
        const items = this.collapsableItems;

        // Before the content is read, because an item seen in one presentation measures the other by toggling a class.
        items.forEach((item) => item.measureWidths());

        const collapseDelta = this.contentWidth(containers) - this.width;

        if (collapseDelta > 0) {
            this.collapseItems(items, collapseDelta);
        } else {
            this.expandItems(items, collapseDelta);
        }
    }

    /** @docs-private */
    protected onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;

        // The origin of the last focus event may be a click, and an item takes no DOM focus for a pointer origin.
        this.keyManager.setFocusOrigin('keyboard');

        if (!this.eventFromInput(event) && (isVerticalMovement(event) || isHorizontalMovement(event))) {
            event.preventDefault();
        }

        if (keyCode === TAB) {
            this.keyManager.tabOut.next();

            return;
        } else if (this.eventFromInput(event) && this.cursorOnLastPosition(event) && keyCode === RIGHT_ARROW) {
            this.keyManager.setNextItemActive();
        } else if (this.eventFromInput(event) && this.cursorOnFirstPosition(event) && keyCode === LEFT_ARROW) {
            this.keyManager.setPreviousItemActive();
        } else if (!this.eventFromInput(event)) {
            this.keyManager.onKeydown(event);
        }
    }

    private eventFromInput(event: KeyboardEvent): boolean {
        return !!(event.target as HTMLElement).attributes.getNamedItem('kbqinput');
    }

    private cursorOnFirstPosition(event: KeyboardEvent): boolean {
        const input = event.target as HTMLInputElement;

        return input.selectionStart === 0;
    }

    private cursorOnLastPosition(event: KeyboardEvent): boolean {
        const input = event.target as HTMLInputElement;

        return input.selectionEnd === input.value.length;
    }

    private collapseItems(items: KbqNavbarItem[], collapseDelta: number) {
        let delta = collapseDelta;

        // An item that frees nothing has not been measured, because it is hidden, and collapsing it gains nothing.
        for (const item of items.filter((item) => !item.isCollapsed() && item.getCollapsibleWidth() > 0)) {
            item.collapsed = true;
            delta -= item.getCollapsibleWidth();

            if (delta <= 0) break;
        }
    }

    private expandItems(items: KbqNavbarItem[], collapseDelta: number) {
        let delta = collapseDelta;

        for (const item of items.filter((item) => item.isCollapsed())) {
            if (delta + item.getCollapsibleWidth() <= 0) {
                item.collapsed = false;
                delta += item.getCollapsibleWidth();
            }
        }
    }

    /** The containers projected into the navbar, in the order they sit in it. */
    private containerElements(): HTMLElement[] {
        return Array.from(this.elementRef.nativeElement.children).filter(
            (container) => container instanceof HTMLElement && container.classList.contains('kbq-navbar-container')
        ) as HTMLElement[];
    }

    /**
     * The rectangle elements that sit in a container, the «Ещё» trigger apart: items, brands and dividers.
     */
    private containerRectangles(containers: readonly HTMLElement[]): KbqNavbarRectangleElement[] {
        const trigger = this.moreTriggerElement()?.nativeElement;

        return this.rectangleElements().filter(
            (rectangle) =>
                rectangle.element !== trigger && containers.includes(rectangle.element.parentElement as HTMLElement)
        );
    }

    /** The navbar itself as the fit subject: its content, every container's, against its own width. */
    private navbarFitSubject(containers: readonly HTMLElement[]): KbqOverflowFitSubject {
        return {
            measure: () => this.measureContent(containers),
            hasOverflown: () => this.contentWidth(containers) - this.width >= this.engine.deviceThreshold()
        };
    }

    /**
     * One sweep of the content: the outer width of every laid-out child of every container, the containers' own
     * margins included, as the room it needs and the per-element sizes the engine subtracts as it hides.
     */
    private measureContent(containers: readonly HTMLElement[]): {
        overflow: number;
        sizes: ReadonlyMap<Element, number>;
    } {
        const sizes = new Map<Element, number>();
        let total = 0;

        for (const container of containers) {
            const { marginLeft, marginRight } = this.window.getComputedStyle(container);

            total += (parseFloat(marginLeft) || 0) + (parseFloat(marginRight) || 0);

            for (const element of this.measuredChildren(container)) {
                const width = getOuterWidth(element, this.window);

                sizes.set(element, width);
                total += width;
            }
        }

        return { overflow: total - this.width, sizes };
    }

    /**
     * The children of a container that take part in the fit: laid out, with the «Ещё» trigger counted only
     * while it is shown — the engine budgets for it as its result slot, so it joins the content exactly when
     * the engine has something hidden.
     */
    private measuredChildren(container: HTMLElement): Element[] {
        const trigger = this.moreTriggerElement()?.nativeElement;

        return this.engine
            .laidOutChildren(container)
            .map(({ element }) => element)
            .filter((element) => element !== trigger || this.moreTriggerVisible());
    }

    /**
     * Hides and shows the dividers by the state of their neighbours: one hidden neighbour leaves the divider
     * dangling and hides it, two hidden ones take it into the «Ещё» panel with the items between them. A divider
     * pinned with `alwaysVisible` stays, the same contract the engine honors on items.
     */
    private fitDividers(containers: readonly HTMLElement[], containerRectangles: KbqNavbarRectangleElement[]): void {
        this.panelDividers.clear();

        const trigger = this.moreTriggerElement()?.nativeElement;
        const rectangles = new Map<Element, KbqNavbarRectangleElement>(
            containerRectangles.map((rectangle) => [rectangle.element, rectangle] as const)
        );

        for (const container of containers) {
            const children = Array.from(container.children);

            children.forEach((child, index) => {
                const rectangle = rectangles.get(child);

                if (!rectangle || !isDivider(rectangle)) return;

                if (rectangle.alwaysVisible()) {
                    rectangle.show();

                    return;
                }

                const leftHidden = !!rectangles.get(children[index - 1])?.hidden();
                // A shown trigger ends the laid-out content as surely as a hidden item does.
                const rightHidden =
                    !!rectangles.get(children[index + 1])?.hidden() ||
                    (children[index + 1] === trigger && this.moreTriggerVisible());

                if (leftHidden && rightHidden) {
                    rectangle.hide();

                    this.panelDividers.add(rectangle);
                } else if (leftHidden || rightHidden) {
                    rectangle.hide();
                } else {
                    rectangle.show();
                }
            });
        }
    }

    /** Moves the «Ещё» trigger's host into the last container, the right end of the navbar. */
    private placeMoreTrigger(): void {
        const containers = this.containerElements();
        const element = this.moreTriggerElement()?.nativeElement;
        const last = containers[containers.length - 1];

        if (element && last && element.parentElement !== last) {
            last.appendChild(element);
        }
    }

    private onMorePanelOpened(): void {
        this.morePanelKeyManager ??= new FocusKeyManager<KbqNavbarFocusableItem>(
            this.morePanelItemsList()
        ).withHomeAndEnd();

        this.moveItemsIntoMorePanel();

        // The read syncs the QueryList: kbqQueryListFrom's own sync runs as a scheduled effect, too late for
        // the synchronous focus below.
        this.morePanelItemsList();

        // The dropdown's own key manager drives `KbqDropdownItem`s only; the navbar items carried into the panel
        // get their arrow navigation from the navbar, vertical as a menu reads.
        if (this.moreDropdownTrigger()?.openedBy === 'keyboard') {
            this.morePanelKeyManager.setFocusOrigin('keyboard').setFirstItemActive();
        }
    }

    private onMorePanelClosed(): void {
        this.returnItemsFromMorePanel();

        // The panel reopens with a fresh list: navigation must not resume from the row that was active before
        // it closed, which may no longer exist.
        this.morePanelKeyManager?.setActiveItem(-1);
    }

    /** Handles the arrow keys of the items moved into the «Ещё» panel. */
    protected onMorePanelKeydown(event: KeyboardEvent): void {
        // The same guard the navbar's own keydown carries: an arrow inside an input moves the caret, not the row.
        if (this.eventFromInput(event)) return;

        this.morePanelKeyManager?.onKeydown(event);
    }

    /**
     * Keeps the panel open for a click on an item that opens a submenu of its own: the click belongs to that
     * submenu, while the panel's own content handler would close it. `KbqDropdownTrigger` stops the propagation
     * for a `kbq-dropdown-item` trigger itself; a navbar item is not one.
     */
    protected onMorePanelContentClick(event: MouseEvent): void {
        const target = (event.target as HTMLElement | null)?.closest('kbq-navbar-item, [kbq-navbar-item]');

        if (!target) return;

        const item = this.navbarItems().find((candidate) => candidate.rectangleElement.element === target);

        if (item?.hasDropDownTrigger) {
            event.stopPropagation();
        }
    }

    /**
     * Moves the hidden items, and the dividers between them, into the «Ещё» panel: the original host elements, so
     * whatever the consumer projected — a submenu, a router link, a listener — keeps working where the element lands.
     */
    private moveItemsIntoMorePanel(): void {
        const content = this.morePanelContent()?.nativeElement;

        if (!content) return;

        const itemOfRectangle = new Map(this.navbarItems().map((item) => [item.rectangleElement, item]));
        const moving = this.containerRectangles(this.containerElements()).filter(
            (rectangle) => rectangle.hidden() && (!isDivider(rectangle) || this.panelDividers.has(rectangle))
        );

        for (const rectangle of moving) {
            const item = itemOfRectangle.get(rectangle) ?? null;

            this.movedToMorePanel.set(rectangle, {
                container: rectangle.element.parentElement as HTMLElement,
                anchor: rectangle.element.nextElementSibling,
                item,
                wasCollapsed: item ? item.isCollapsed() : false
            });

            rectangle.show();

            // The panel row shows the title: the presentation a collapsed item drops, restored on the way back.
            item?.inMorePanel.set(true);
            if (item) item.collapsed = false;

            content.appendChild(rectangle.element);
        }

        this.morePanelItems.set(
            moving.flatMap((rectangle) => {
                const item = itemOfRectangle.get(rectangle);

                return item ? [item.navbarFocusableItem] : [];
            })
        );
    }

    /** Returns the items moved into the «Ещё» panel to their places, hidden again as the fit left them. */
    private returnItemsFromMorePanel(): void {
        if (!this.movedToMorePanel.size) return;

        // In reverse, so every anchor is back in the container by the time it is used: the anchors point at the
        // siblings that follow, and those were moved after the items that reference them.
        const panel = this.morePanelContent()?.nativeElement;

        for (const [rectangle, { container, anchor, item, wasCollapsed }] of [...this.movedToMorePanel.entries()]
            .reverse()
            .map(([rectangle, state]) => [rectangle, state] as const)) {
            // An item the consumer destroyed while it sat in the panel left the panel with its view: there is
            // nothing to return, and re-attaching the dead node would orphan it in the container. The panel
            // itself may sit detached from the document by the time this runs — its content is still ours.
            if (!rectangle.element.isConnected && !panel?.contains(rectangle.element)) {
                this.movedToMorePanel.delete(rectangle);

                continue;
            }

            if (anchor && anchor.parentElement === container) {
                container.insertBefore(rectangle.element, anchor);
            } else {
                container.appendChild(rectangle.element);
            }

            rectangle.hide();

            item?.inMorePanel.set(false);
            if (item) item.collapsed = wasCollapsed;
        }

        this.movedToMorePanel.clear();

        this.morePanelItems.set([]);
    }
}

/** Whether the rectangle is a divider: its selector is the element form, so the tag decides. */
const isDivider = (rectangle: KbqNavbarRectangleElement): boolean => {
    return rectangle.element.tagName === 'KBQ-NAVBAR-DIVIDER';
};
