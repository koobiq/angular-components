import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
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
    InjectionToken,
    Input,
    numberAttribute,
    OnDestroy,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FocusKeyManager } from '@koobiq/cdk/a11y';
import { DOWN_ARROW, isVerticalMovement, TAB, UP_ARROW } from '@koobiq/cdk/keycodes';
import { KBQ_LOCALE_SERVICE, KbqRectangleItem, ruRULocaleData } from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqPopoverTrigger } from '@koobiq/components/popover';
import { BehaviorSubject, combineLatest, merge, Observable, Subject, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import {
    KbqNavbarFocusableItemEvent,
    KbqNavbarIcFocusableItem,
    KbqNavbarIcItem,
    KbqNavbarIcToggle
} from './navbar-ic-item';
import { toggleNavbarIcAnimation } from './navbar-ic.animation';

export enum KbqExpandEvents {
    toggle,
    hoverOrFocus
}

/** default configuration of navbar-ic */
/** @docs-private */
export const KBQ_NAVBAR_IC_DEFAULT_CONFIGURATION = ruRULocaleData.navbarIc;

/** Injection Token for providing configuration of navbar-ic */
/** @docs-private */
export const KBQ_NAVBAR_IC_CONFIGURATION = new InjectionToken('KbqNavbarIcConfiguration');

@Directive()
export class KbqFocusable implements AfterContentInit, AfterViewInit, OnDestroy {
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    protected readonly elementRef = inject(ElementRef);
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly focusMonitor = inject(FocusMonitor);

    @ContentChildren(forwardRef(() => KbqNavbarIcFocusableItem), { descendants: true })
    focusableItems: QueryList<KbqNavbarIcFocusableItem>;

    keyManager: FocusKeyManager<KbqNavbarIcFocusableItem>;

    @Input({ transform: numberAttribute })
    get tabindex(): number {
        return this._tabindex;
    }

    set tabindex(value: number) {
        this._tabindex = value;
    }

    private _tabindex = 0;

    get itemFocusChanges(): Observable<KbqNavbarFocusableItemEvent> {
        return merge(...this.focusableItems.map((item) => item.onFocus));
    }

    get itemBlurChanges(): Observable<KbqNavbarFocusableItemEvent> {
        return merge(...this.focusableItems.map((option) => option.onBlur));
    }

    private itemFocusSubscription: Subscription | null;
    private itemBlurSubscription: Subscription | null;

    ngAfterContentInit(): void {
        this.keyManager = new FocusKeyManager<KbqNavbarIcFocusableItem>(this.focusableItems).withTypeAhead();

        this.keyManager.tabOut.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.tabindex = -1;

            setTimeout(() => {
                this.tabindex = 0;
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

    /** @docs-private */
    focusHandler(): void {
        if (this.focusableItems.length === 0) return;

        this.keyManager.setFirstItemActive();
    }

    /** @docs-private */
    blurHandler() {
        if (!this.hasFocusedItem()) {
            this.keyManager.setActiveItem(-1);
        }

        this.changeDetectorRef.markForCheck();
    }

    protected resetOptions() {
        this.dropSubscriptions();
        this.listenToItemsFocus();
    }

    protected dropSubscriptions() {
        this.itemFocusSubscription?.unsubscribe();
        this.itemBlurSubscription?.unsubscribe();

        this.itemFocusSubscription = null;
        this.itemBlurSubscription = null;
    }

    protected listenToItemsFocus(): void {
        this.itemFocusSubscription = this.itemFocusChanges.subscribe((event) => {
            const index: number = this.focusableItems.toArray().indexOf(event.item);

            if (this.isValidIndex(index)) {
                this.keyManager.updateActiveItem(index);
            }
        });

        this.itemBlurSubscription = this.itemBlurChanges.subscribe(() => this.blurHandler());
    }

    protected updateTabIndex(): void {
        this.tabindex = this.focusableItems.length === 0 ? -1 : 0;
    }

    protected isValidIndex(index: number): boolean {
        return index >= 0 && index < this.focusableItems.length;
    }

    protected hasFocusedItem() {
        return this.focusableItems.some((item) => item.hasFocus);
    }
}

@Directive({
    standalone: true,
    selector: 'kbq-navbar-ic-container',
    host: {
        class: 'kbq-navbar-ic-container'
    }
})
export class KbqNavbarIcContainer {}

@Component({
    standalone: true,
    selector: 'kbq-navbar-ic',
    exportAs: 'KbqNavbarIc',
    template: `
        <div class="kbq-navbar-ic__top-layer" [@toggle]="expanded" (@toggle.done)="animationDone.next()">
            <ng-content select="[kbq-navbar-ic-container], kbq-navbar-ic-container" />
            <ng-content select="[kbq-navbar-ic-toggle], kbq-navbar-ic-toggle" />
        </div>
    `,
    styleUrls: [
        './navbar-ic.scss',
        './navbar-ic-divider.scss',
        './navbar-ic-tokens.scss'
    ],
    host: {
        class: 'kbq-navbar-ic',
        '[class.kbq-collapsed]': '!expanded',
        '[class.kbq-expanded]': 'expanded',
        '[style.min-width.px]': 'pinned ? expandedWidth : collapsedWidth',
        '[attr.tabindex]': 'tabindex',

        '(focus)': 'focusHandler()',
        '(blur)': 'blurHandler()',

        '(keydown)': 'onKeyDown($event)',

        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    },
    animations: [toggleNavbarIcAnimation()],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqNavbarIc extends KbqFocusable implements AfterContentInit {
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

    readonly externalConfiguration = inject(KBQ_NAVBAR_IC_CONFIGURATION, { optional: true });

    configuration;

    /** @docs-private */
    rectangleElements = contentChildren(
        forwardRef(() => KbqRectangleItem),
        { descendants: true }
    );

    /** @docs-private */
    items = contentChildren(
        forwardRef(() => KbqNavbarIcItem),
        { descendants: true }
    );

    /** @docs-private */
    toggleElement = contentChildren(
        forwardRef(() => KbqNavbarIcToggle),
        { descendants: true }
    );

    /** @docs-private */
    dropdownTrigger = contentChildren(
        forwardRef(() => KbqDropdownTrigger),
        { descendants: true }
    );

    /** @docs-private */
    popoverTrigger = contentChildren(
        forwardRef(() => KbqPopoverTrigger),
        { descendants: true }
    );

    readonly hovered = new BehaviorSubject<boolean>(false);
    readonly focused = new BehaviorSubject<boolean>(false);

    readonly animationDone: Subject<void> = new Subject();

    expandEvent: KbqExpandEvents | null = null;

    @Input({ transform: booleanAttribute }) pinned = true;

    @Input({ transform: numberAttribute }) collapsedWidth = 64;
    @Input({ transform: numberAttribute }) expandedWidth = 240;

    @Input({ transform: booleanAttribute })
    get expanded(): boolean {
        return this._expanded || this.pinned || this.hasOpenedPopUp;
    }

    set expanded(value: boolean) {
        this._expanded = value;

        this.updateExpandedStateForItems();
    }

    private _expanded: boolean = true;

    get hasOpenedPopUp() {
        return [...this.dropdownTrigger(), ...this.popoverTrigger()].some(
            (instance) => instance?.isOpen || instance?.opened
        );
    }

    get expandedByToggle() {
        return this.expanded && this.expandEvent === KbqExpandEvents.toggle;
    }

    get expandedByHoverOrFocus() {
        return this.expanded && this.expandEvent === KbqExpandEvents.hoverOrFocus;
    }

    get currentWidth(): number {
        return this.expanded ? this.expandedWidth : this.collapsedWidth;
    }

    constructor() {
        super();

        this.animationDone.pipe(takeUntilDestroyed()).subscribe(this.updateTooltipForItems);

        effect(this.updateExpandedStateForItems);

        combineLatest([this.hovered, this.focused])
            .pipe(takeUntilDestroyed())
            .subscribe(([hovered, focused]) => {
                if (this.pinned) return;

                this.expandEvent = KbqExpandEvents.hoverOrFocus;
                this.expanded = hovered || focused;

                this.changeDetectorRef.markForCheck();
            });

        this.focusMonitor.monitor(this.elementRef, true).subscribe((focusOrigin) => {
            this.focused.next(focusOrigin === 'keyboard');
        });

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }
    }

    /** @docs-private */
    ngAfterContentInit(): void {
        this.updateTooltipForItems();

        super.ngAfterContentInit();

        this.keyManager.withVerticalOrientation(true);
    }

    toggle(): void {
        this.expanded = !this.expanded;

        this.expandEvent = KbqExpandEvents.toggle;

        this.changeDetectorRef.markForCheck();
    }

    /** @docs-private */
    onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;

        if (!(event.target as HTMLElement).attributes.getNamedItem('kbqinput') && isVerticalMovement(event)) {
            event.preventDefault();
        }

        if (keyCode === TAB) {
            this.keyManager.tabOut.next();

            return;
        } else if (keyCode === DOWN_ARROW) {
            this.keyManager.setNextItemActive();
        } else if (keyCode === UP_ARROW) {
            this.keyManager.setPreviousItemActive();
        } else {
            this.keyManager.onKeydown(event);
        }
    }

    protected updateTooltipForItems = () => this.items().forEach((item) => item.updateTooltip());

    protected updateExpandedStateForItems = () => this.rectangleElements().forEach(this.updateItemExpandedState);

    protected updateItemExpandedState = (item: KbqNavbarIcItem): void => {
        item.collapsed = !this.expanded;
        setTimeout(() => item.button?.updateClassModifierForIcons());
    };

    private updateLocaleParams = () => {
        this.configuration = this.externalConfiguration || this.localeService?.getParams('navbarIc');

        this.changeDetectorRef.markForCheck();
    };

    private initDefaultParams() {
        this.configuration = KBQ_NAVBAR_IC_DEFAULT_CONFIGURATION;
    }
}
