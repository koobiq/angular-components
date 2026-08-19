import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Platform } from '@angular/cdk/platform';
import {
    AfterContentInit,
    afterNextRender,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    contentChildren,
    ContentChildren,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    input,
    model,
    NgZone,
    OnDestroy,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    FocusKeyManager,
    isHorizontalMovement,
    isVerticalMovement,
    KBQ_WINDOW,
    LEFT_ARROW,
    RIGHT_ARROW,
    TAB
} from '@koobiq/components/core';
import { fromEvent, merge, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import {
    KbqNavbarFocusableItem,
    KbqNavbarFocusableItemEvent,
    KbqNavbarItem,
    KbqNavbarRectangleElement
} from './navbar-item.component';

@Directive()
export class KbqFocusableComponent implements AfterContentInit, AfterViewInit, OnDestroy {
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    /** @docs-private */
    protected readonly focusMonitor = inject(FocusMonitor);
    /** @docs-private */
    protected readonly destroyRef = inject(DestroyRef);

    /** @docs-private */
    @ContentChildren(forwardRef(() => KbqNavbarFocusableItem), { descendants: true })
    focusableItems: QueryList<KbqNavbarFocusableItem>;

    /** @docs-private */
    keyManager: FocusKeyManager<KbqNavbarFocusableItem>;

    /**
     * Tab index of the navbar host. The navbar owns the single tab stop of the whole widget and moves focus
     * between its items with the arrow keys.
     */
    readonly tabIndex = model<number>(0);

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
        this.keyManager = new FocusKeyManager<KbqNavbarFocusableItem>(this.focusableItems).withTypeAhead();

        this.keyManager.tabOut.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.tabIndex.set(-1);

            // Restored on a macrotask so the browser has moved focus out of the navbar first. Bound to the
            // component's lifetime: without it the callback can run against a destroyed view.
            const timeoutId = setTimeout(() => {
                this.tabIndex.set(0);
                this.changeDetectorRef.markForCheck();
            });

            this.destroyRef.onDestroy(() => clearTimeout(timeoutId));
        });

        this.focusableItems.changes.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.resetOptions();

            // Check to see if we need to update our tab index
            this.updateTabIndex();
        });
    }

    /**
     * Monitored with `checkChildren`, because the navbar is one composite widget: the host owns the tab stop
     * but hands focus straight to an item, and without it that hand-off reads as the navbar being blurred.
     * The origin would reset to `null` on the very first item, leaving every later arrow key with no keyboard
     * origin to pass on — the key manager would move its active item while nothing moved in the DOM.
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

    private updateTabIndex(): void {
        this.tabIndex.set(this.focusableItems.length === 0 ? -1 : 0);
    }

    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.focusableItems.length;
    }

    private hasFocusedItem() {
        return this.focusableItems.some((item) => item.hasFocus);
    }
}

@Directive({
    selector: 'kbq-navbar-container',
    host: {
        class: 'kbq-navbar-container'
    }
})
export class KbqNavbarContainer {}

@Component({
    selector: 'kbq-navbar',
    template: `
        <ng-content select="[kbq-navbar-container], kbq-navbar-container" />
    `,
    styleUrls: [
        './navbar.scss',
        './navbar-item.scss',
        './navbar-brand.scss',
        './navbar-divider.scss',
        './navbar-tokens.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-navbar',
        role: 'navigation',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.tabindex]': 'tabIndex()',
        '(focus)': 'focus()',
        '(blur)': 'blur()',
        '(keydown)': 'onKeyDown($event)'
    }
})
export class KbqNavbar extends KbqFocusableComponent implements AfterViewInit, AfterContentInit {
    private readonly platform = inject(Platform);
    private readonly ngZone = inject(NgZone);
    private readonly window = inject(KBQ_WINDOW);

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

    /** Raw `resize` events of the window, fed from outside the Angular zone. @docs-private */
    readonly resizeStream = new Subject<Event>();

    private readonly resizeDebounceInterval: number = 100;

    private get width(): number {
        return this.elementRef.nativeElement.getBoundingClientRect().width;
    }

    private get totalItemsWidth(): number {
        return this.rectangleElements().reduce((acc, item) => acc + item.getOuterElementWidth(), 0);
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

        this.resizeStream
            .pipe(debounceTime(this.resizeDebounceInterval), takeUntilDestroyed())
            .subscribe(() => this.ngZone.run(this.updateExpandedStateForItems));

        effect(() => this.rectangleElements().forEach((item) => (item.orientation = 'horizontal')));

        // Note: this wait is required for loading and rendering fonts for icons;
        // unfortunately we cannot control font rendering. Bound to the component's lifetime, unlike a bare
        // `setTimeout`, so it can never run against a destroyed view.
        afterNextRender(() => this.updateExpandedStateForItems());
    }

    /** @docs-private */
    ngAfterContentInit(): void {
        super.ngAfterContentInit();

        this.keyManager.withVerticalOrientation(false).withHorizontalOrientation('ltr');
    }

    /**
     * Recomputes which collapsable items fit into the current navbar width.
     *
     * Every measurement is taken up front, in one read pass, and only then is anything written: collapsing an
     * item invalidates layout, so a measurement taken afterwards forces a synchronous reflow for each of the
     * remaining items. The per-item title widths the decision below needs were captured at view init and are
     * read from that cache, not from the DOM.
     * @docs-private */
    updateExpandedStateForItems = () => {
        const availableWidth = this.width;
        const collapseDelta = this.totalItemsWidth - availableWidth;

        const needCollapse = collapseDelta > 0;

        if (needCollapse) {
            this.collapseItems(collapseDelta);
        } else {
            this.expandItems(collapseDelta);
        }
    };

    /** @docs-private */
    protected onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;

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

    private collapseItems(collapseDelta: number) {
        let delta = collapseDelta;

        const unCollapsedItems = this.collapsableItems.filter((item) => !item.isCollapsed());

        for (const item of unCollapsedItems) {
            item.collapsed = true;
            delta -= item.getTitleWidth();

            if (delta < 0) {
                break;
            }
        }
    }

    private expandItems(collapseDelta: number) {
        let delta = collapseDelta;

        this.collapsableItems
            .filter((item) => item.isCollapsed())
            .forEach((item) => {
                if (delta + item.getTitleWidth() < 0) {
                    item.collapsed = false;
                    delta += item.getTitleWidth();
                }
            });
    }
}
