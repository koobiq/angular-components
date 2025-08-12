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
    numberAttribute,
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
} from './navbar-ic-item';

@Directive()
export class KbqFocusable implements AfterContentInit, AfterViewInit, OnDestroy {
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    protected readonly elementRef = inject(ElementRef);
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly focusMonitor = inject(FocusMonitor);

    @ContentChildren(forwardRef(() => KbqNavbarIcFocusableItem), { descendants: true })
    focusableItems: QueryList<KbqNavbarIcFocusableItem>;

    keyManager: FocusKeyManager<KbqNavbarIcFocusableItem>;

    @Input()
    get tabindex(): any {
        return this._tabindex;
    }

    set tabindex(value: any) {
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

        this.itemBlurSubscription = this.itemBlurChanges.subscribe(() => this.blur());
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
        <div
            class="kbq-navbar-ic__top-layer"
            [style.min-width.px]="currentWidth"
            [style.width.px]="currentWidth"
            [style.max-width.px]="currentWidth"
        >
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
        '[style.min-width.px]': 'collapsedWidth',
        '[attr.tabindex]': 'tabindex',

        '(focus)': 'focus()',
        '(blur)': 'blur()',

        '(keydown)': 'onKeyDown($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqNavbarIc extends KbqFocusable implements AfterContentInit {
    rectangleElements = contentChildren(
        forwardRef(() => KbqNavbarIcRectangleElement),
        { descendants: true }
    );

    items = contentChildren(
        forwardRef(() => KbqNavbarIcItem),
        { descendants: true }
    );

    readonly animationDone: Subject<void> = new Subject();

    @Input({ transform: numberAttribute }) collapsedWidth = 64;
    @Input({ transform: numberAttribute }) expandedWidth = 240;

    @Input()
    get expanded() {
        return this._expanded;
    }

    set expanded(value: boolean) {
        this._expanded = coerceBooleanProperty(value);

        this.updateExpandedStateForItems();
    }

    private _expanded: boolean = false;

    get currentWidth(): number {
        return this.expanded ? this.expandedWidth : this.collapsedWidth;
    }

    constructor() {
        super();

        this.animationDone.pipe(takeUntilDestroyed()).subscribe(this.updateTooltipForItems);

        effect(this.updateExpandedStateForItems);
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

    protected updateTooltipForItems = () => this.items().forEach((item) => item.updateTooltip());

    protected updateExpandedStateForItems = () => this.rectangleElements().forEach(this.updateItemExpandedState);

    protected updateItemExpandedState = (item: KbqNavbarIcRectangleElement): void => {
        item.collapsed = !this.expanded;
        setTimeout(() => item.button?.updateClassModifierForIcons());
    };
}
