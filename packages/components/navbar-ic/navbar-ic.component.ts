import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
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
import { DOWN_ARROW, isHorizontalMovement, isVerticalMovement, TAB, UP_ARROW } from '@koobiq/cdk/keycodes';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import {
    KbqNavbarFocusableItemEvent,
    KbqNavbarIcFocusableItem,
    KbqNavbarIcItem,
    KbqNavbarIcRectangleElement
} from './navbar-ic-item.component';

@Directive()
export class KbqFocusableComponent implements AfterContentInit, AfterViewInit, OnDestroy {
    @ContentChildren(forwardRef(() => KbqNavbarIcFocusableItem), { descendants: true })
    focusableItems: QueryList<KbqNavbarIcFocusableItem>;

    keyManager: FocusKeyManager<KbqNavbarIcFocusableItem>;

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
        protected readonly elementRef: ElementRef,
        protected readonly focusMonitor: FocusMonitor
    ) {}

    ngAfterContentInit(): void {
        this.keyManager = new FocusKeyManager<KbqNavbarIcFocusableItem>(this.focusableItems).withTypeAhead();

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
    selector: 'kbq-navbar-ic-container',
    host: {
        class: 'kbq-navbar-ic-container'
    }
})
export class KbqNavbarIcContainer {}

@Component({
    selector: 'kbq-navbar-ic',
    exportAs: 'KbqNavbarIc',
    template: `
        <div class="kbq-navbar-ic__container" [class.kbq-collapsed]="!expanded" [class.kbq-expanded]="expanded">
            <ng-content select="[kbq-navbar-ic-container], kbq-navbar-ic-container" />
            <ng-content select="[kbq-navbar-ic-toggle], kbq-navbar-ic-toggle" />
        </div>
    `,
    styleUrls: [
        './navbar-ic.scss',
        './navbar-ic-item.scss',
        './navbar-ic-header.scss',
        './navbar-ic-divider.scss',
        './navbar-ic-tokens.scss'
    ],
    host: {
        class: 'kbq-navbar-ic',
        '[class.kbq-navbar-ic_open-over]': 'openOver',
        '[attr.tabindex]': 'tabIndex',

        '(focus)': 'focus()',
        '(blur)': 'blur()',

        '(keydown)': 'onKeyDown($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqNavbarIc extends KbqFocusableComponent implements AfterContentInit {
    rectangleElements = contentChildren(
        forwardRef(() => KbqNavbarIcRectangleElement),
        { descendants: true }
    );

    @ContentChildren(forwardRef(() => KbqNavbarIcItem), { descendants: true }) items: QueryList<KbqNavbarIcItem>;

    readonly animationDone: Subject<void> = new Subject();

    @Input() openOver: boolean = true;

    @Input()
    get expanded() {
        return this._expanded;
    }

    set expanded(value: boolean) {
        this._expanded = coerceBooleanProperty(value);

        this.updateExpandedStateForItems();
    }

    private _expanded: boolean = false;

    constructor(
        protected elementRef: ElementRef,
        changeDetectorRef: ChangeDetectorRef,
        focusMonitor: FocusMonitor
    ) {
        super(changeDetectorRef, elementRef, focusMonitor);

        this.animationDone.pipe(takeUntilDestroyed()).subscribe(this.updateTooltipForItems);

        effect(() => this.setItemsVerticalStateAndUpdateExpandedState(this.rectangleElements()));
    }

    ngAfterContentInit(): void {
        this.updateTooltipForItems();

        super.ngAfterContentInit();

        this.keyManager.withVerticalOrientation(true);
    }

    toggle(): void {
        this.expanded = !this.expanded;

        this.changeDetectorRef.markForCheck();
    }

    onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;

        if (
            !(event.target as HTMLElement).attributes.getNamedItem('kbqinput') &&
            (isVerticalMovement(event) || isHorizontalMovement(event))
        ) {
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

    private updateExpandedStateForItems = () => this.rectangleElements().forEach(this.updateItemExpandedState);

    private updateTooltipForItems = () => this.items.forEach((item) => item.updateTooltip());

    private setItemsVerticalStateAndUpdateExpandedState = (
        rectangleElements: Readonly<KbqNavbarIcRectangleElement[]>
    ) => rectangleElements.forEach(this.setItemVerticalStateAndUpdateExpandedState);

    private setItemVerticalStateAndUpdateExpandedState = (item: KbqNavbarIcRectangleElement): void => {
        this.updateItemExpandedState(item);
    };

    private updateItemExpandedState = (item: KbqNavbarIcRectangleElement): void => {
        item.collapsed = !this.expanded;
        setTimeout(() => item.button?.updateClassModifierForIcons());
    };
}
