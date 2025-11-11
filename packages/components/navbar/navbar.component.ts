import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterContentInit,
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
    Input,
    OnDestroy,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FocusKeyManager } from '@koobiq/cdk/a11y';
import { isHorizontalMovement, isVerticalMovement, LEFT_ARROW, RIGHT_ARROW, TAB } from '@koobiq/cdk/keycodes';
import { isFunction } from '@koobiq/components/core';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import {
    KbqNavbarFocusableItem,
    KbqNavbarFocusableItemEvent,
    KbqNavbarItem,
    KbqNavbarRectangleElement
} from './navbar-item.component';

export type KbqNavbarContainerPositionType = 'left' | 'right';

@Directive()
export class KbqFocusableComponent implements AfterContentInit, AfterViewInit, OnDestroy {
    @ContentChildren(forwardRef(() => KbqNavbarFocusableItem), { descendants: true })
    focusableItems: QueryList<KbqNavbarFocusableItem>;

    keyManager: FocusKeyManager<KbqNavbarFocusableItem>;

    @Input()
    get tabIndex(): any {
        return this._tabIndex;
    }

    set tabIndex(value: any) {
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    get optionFocusChanges(): Observable<KbqNavbarFocusableItemEvent> {
        return merge(...this.focusableItems.map((item) => item.onFocus));
    }

    get optionBlurChanges(): Observable<KbqNavbarFocusableItemEvent> {
        return merge(...this.focusableItems.map((option) => option.onBlur));
    }

    private readonly destroyRef = inject(DestroyRef);

    private optionFocusSubscription: Subscription | null;
    private optionBlurSubscription: Subscription | null;

    constructor(
        protected readonly changeDetectorRef: ChangeDetectorRef,
        protected readonly elementRef: ElementRef<HTMLElement>,
        protected readonly focusMonitor: FocusMonitor
    ) {}

    ngAfterContentInit(): void {
        this.keyManager = new FocusKeyManager<KbqNavbarFocusableItem>(this.focusableItems).withTypeAhead();

        this.keyManager.tabOut.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.tabIndex = -1;

            setTimeout(() => {
                this.tabIndex = 0;
                this.changeDetectorRef.markForCheck();
            });
        });

        this.focusableItems.changes.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.resetOptions();

            // Check to see if we need to update our tab index
            this.updateTabIndex();
        });
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef).subscribe((focusOrigin) => {
            this.keyManager.setFocusOrigin(focusOrigin);
        });
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    focus(): void {
        if (this.focusableItems.length === 0) {
            return;
        }

        this.keyManager.setFirstItemActive();
    }

    blur() {
        if (!this.hasFocusedItem()) {
            this.keyManager.setActiveItem(-1);
        }

        this.changeDetectorRef.markForCheck();
    }

    protected resetOptions() {
        this.dropSubscriptions();
        this.listenToOptionsFocus();
    }

    protected dropSubscriptions() {
        if (this.optionFocusSubscription) {
            this.optionFocusSubscription.unsubscribe();
            this.optionFocusSubscription = null;
        }

        if (this.optionBlurSubscription) {
            this.optionBlurSubscription.unsubscribe();
            this.optionBlurSubscription = null;
        }
    }

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
        this.tabIndex = this.focusableItems.length === 0 ? -1 : 0;
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
    host: {
        class: 'kbq-navbar',

        '[attr.tabindex]': 'tabIndex',

        '(focus)': 'focus()',
        '(blur)': 'blur()',

        '(keydown)': 'onKeyDown($event)',

        '(window:resize)': 'resizeStream.next($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqNavbar extends KbqFocusableComponent implements AfterViewInit, AfterContentInit, OnDestroy {
    rectangleElements = contentChildren(
        forwardRef(() => KbqNavbarRectangleElement),
        { descendants: true }
    );

    @ContentChildren(forwardRef(() => KbqNavbarItem), { descendants: true }) navbarItems: QueryList<KbqNavbarItem>;

    readonly resizeStream = new Subject<Event>();

    private readonly resizeDebounceInterval: number = 100;

    private get width(): number {
        const element = this.elementRef.nativeElement;

        // For SSR compatibility
        if (!isFunction(element.getBoundingClientRect)) return 0;

        return element.getBoundingClientRect().width;
    }

    private get totalItemsWidth(): number {
        return this.rectangleElements().reduce((acc, item) => acc + item.getOuterElementWidth(), 0);
    }

    private get collapsableItems(): KbqNavbarItem[] {
        return this.navbarItems
            .toArray()
            .filter((item) => item.icon && item.title && item.collapsable)
            .reverse();
    }

    private resizeSubscription: Subscription;

    constructor(
        protected readonly elementRef: ElementRef<HTMLElement>,
        protected readonly changeDetectorRef: ChangeDetectorRef,
        protected readonly focusMonitor: FocusMonitor
    ) {
        super(changeDetectorRef, elementRef, focusMonitor);

        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.resizeDebounceInterval), takeUntilDestroyed())
            .subscribe(this.updateExpandedStateForItems);

        effect(() => this.setItemsState(this.rectangleElements()));
    }

    ngAfterContentInit(): void {
        super.ngAfterContentInit();

        this.keyManager.withVerticalOrientation(false).withHorizontalOrientation('ltr');
    }

    ngAfterViewInit(): void {
        // Note: this wait is required for loading and rendering fonts for icons;
        // unfortunately we cannot control font rendering
        setTimeout(this.updateExpandedStateForItems);
    }

    ngOnDestroy() {
        this.resizeSubscription.unsubscribe();

        super.ngOnDestroy();
    }

    onKeyDown(event: KeyboardEvent) {
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

    updateExpandedStateForItems = () => {
        const collapseDelta = this.totalItemsWidth - this.width;

        const needCollapse = collapseDelta > 0;

        if (needCollapse) {
            this.collapseItems(collapseDelta);
        } else {
            this.expandItems(collapseDelta);
        }
    };

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

        const unCollapsedItems = this.collapsableItems.filter((item) => !item.collapsed);

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
            .filter((item) => item.collapsed)
            .forEach((item) => {
                if (delta + item.getTitleWidth() < 0) {
                    item.collapsed = false;
                    delta += item.getTitleWidth();
                }
            });
    }

    private setItemsState = (rectangleElements: Readonly<KbqNavbarRectangleElement[]>) => {
        Promise.resolve().then(() => rectangleElements.forEach((item) => (item.horizontal = true)));
    };
}
