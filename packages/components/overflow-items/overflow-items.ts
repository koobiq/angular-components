import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    contentChildren,
    Directive,
    ElementRef,
    inject,
    input,
    signal,
    TemplateRef,
    viewChild,
    viewChildren
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, merge, skip } from 'rxjs';

/**
 * Template context for the `KbqOverflowItemsResult` directive.
 *
 * @see `KbqOverflowItemsResult`
 */
export type KbqOverflowItemsResultContext = {
    /**
     * Set of hidden item ID's.
     *
     * Example:
     *
     * ```html
     * <ng-template kbqOverflowItemsResult let-hiddenItemIDs>
     *  {{ hiddenItemIDs.size }}
     * </ng-template>
     * ````
     */
    $implicit: ReadonlySet<unknown>;
    /**
     * Set of hidden item ID's.
     *
     * Example:
     *
     * ```html
     * <ng-template kbqOverflowItemsResult let-hiddenItemIDs="hiddenItemIDs">
     *  @if (hiddenItemIDs.has(SOME_ID)) {...}
     * </ng-template>
     * ````
     */
    hiddenItemIDs: ReadonlySet<unknown>;
};

/**
 * Directive for providing `KbqOverflowItemsResultContext` to the `KbqOverflowItems` component.
 *
 * @see `KbqOverflowItemsResultContext`
 */
@Directive({
    standalone: true,
    selector: 'ng-template[kbqOverflowItemsResult]'
})
export class KbqOverflowItemsResult {
    /**
     * TemplateRef for the overflow result.
     *
     * @docs-private
     */
    readonly templateRef = inject<TemplateRef<KbqOverflowItemsResultContext>>(TemplateRef);
}

/**
 * Structure directive for providing items to the `KbqOverflowItems`.
 */
@Directive({
    standalone: true,
    selector: '[kbqOverflowItem]'
})
export class KbqOverflowItem {
    /**
     * Identifier for the item.
     */
    readonly id = input.required({ alias: 'kbqOverflowItem' });

    /**
     * Whether the item is hidden.
     *
     * @docs-private
     */
    readonly hidden = signal<boolean>(false);

    /**
     * TemplateRef for the item.
     *
     * @docs-private
     */
    readonly templateRef = inject(TemplateRef);
}

/**
 * Component for automatically hiding elements with dynamic adaptation to the container width.
 */
@Component({
    standalone: true,
    selector: 'kbq-overflow-items',
    imports: [NgTemplateOutlet],
    template: `
        @if (reverseOverflowOrder()) {
            <ng-container [ngTemplateOutlet]="template" />
        }

        @for (item of items(); track item.id()) {
            <div
                class="kbq-overflow-items__item"
                #itemRef
                [attr.aria-hidden]="item.hidden()"
                [class.kbq-overflow-items__item_hidden]="item.hidden()"
            >
                <ng-container [ngTemplateOutlet]="item.templateRef" />
            </div>
        }

        @if (!reverseOverflowOrder()) {
            <ng-container [ngTemplateOutlet]="template" />
        }

        <ng-template #template>
            <div
                class="kbq-overflow-items__result"
                #resultRef
                [attr.aria-hidden]="resultHidden()"
                [class.kbq-overflow-items__result_hidden]="resultHidden()"
            >
                <ng-container
                    [ngTemplateOutlet]="result()?.templateRef || null"
                    [ngTemplateOutletContext]="resultTemplateContext()"
                />
            </div>
        </ng-template>
    `,
    styleUrl: './overflow-items.scss',
    host: {
        class: 'kbq-overflow-items'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqOverflowItems {
    private readonly itemElementRefs = viewChildren<string, ElementRef<HTMLElement>>('itemRef', { read: ElementRef });

    /**
     * `KbqOverflowItem` directive references.
     *
     * @docs-private
     */
    protected readonly items = contentChildren(KbqOverflowItem);

    /**
     * `KbqOverflowItemsResult` directive reference.
     *
     * @docs-private
     */
    protected readonly result = contentChild(KbqOverflowItemsResult);

    private readonly resultElementRef = viewChild<string, ElementRef<HTMLElement>>('resultRef', { read: ElementRef });

    /**
     * Template context for the `KbqOverflowItemsResult` directive.
     *
     * @docs-private
     */
    protected readonly resultTemplateContext = computed<KbqOverflowItemsResultContext>(() => {
        const hiddenItemIDs = new Set(
            this.items()
                .filter(({ hidden }) => hidden())
                .map(({ id }) => id())
        );
        return {
            $implicit: hiddenItemIDs,
            hiddenItemIDs: hiddenItemIDs
        };
    });

    /**
     * Whether the overflow result is hidden.
     *
     * @docs-private
     */
    protected readonly resultHidden = computed(() => !this.items().some(({ hidden }) => hidden()));

    /**
     * Whether the overflow order should be reversed.
     * Also changes the position of the `resultTemplateRef`.
     *
     * @default false
     */
    readonly reverseOverflowOrder = input(false, { transform: booleanAttribute });

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly contentObserver = inject(ContentObserver);

    constructor() {
        toObservable(this.reverseOverflowOrder)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe(() => {
                this.items().forEach(({ hidden }) => hidden.set(false));
            });

        const dueTime = 100;
        merge(
            toObservable(this.items).pipe(debounceTime(dueTime)),
            this.resizeObserver.observe(this.elementRef.nativeElement).pipe(debounceTime(dueTime)),
            this.contentObserver.observe(this.elementRef.nativeElement).pipe(debounceTime(dueTime))
        )
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                this.updateItemsVisibility();
            });
    }

    /**
     * Updates the visibility of items based on the container width.
     *
     * This method calculates whether items should be hidden or shown by comparing the scroll width of the container
     * with its visible width. It determines which items are visible and which are hidden, and applies the hiding logic
     * based on the `reverseOverflowOrder` flag.
     *
     * The function operates recursively to adjust the visibility of items until the overflow condition is resolved.
     *
     * - If the container is overflown, it hides the last visible item from the end (or start if `reverseOverflowOrder`)
     * and checks if further adjustments are needed.
     * - If the container is not overflown, it reveals the first hidden item from the start
     * (or end if `reverseOverflowOrder`), ensuring it fits within the visible area.
     */
    private updateItemsVisibility(): void {
        const items = this.items();
        const itemElementRefs = this.itemElementRefs();
        const reverseOverflowOrder = this.reverseOverflowOrder();
        const resultElementWidth = this.resultElementRef()?.nativeElement.offsetWidth || 0;
        const { offsetWidth: totalWidth } = this.elementRef.nativeElement;
        const visibleItems = items.filter(this.isVisibleItem);
        const visibleItemsTotalWidth = visibleItems.reduce(
            (width, _, index) => width + itemElementRefs[index].nativeElement.offsetWidth,
            0
        );
        const _resultElementWidth = items.length > visibleItems.length ? resultElementWidth : 0;
        if (visibleItemsTotalWidth + _resultElementWidth > totalWidth) {
            const lastVisibleItemIndex = reverseOverflowOrder
                ? items.findIndex(this.isVisibleItem)
                : this.findLastIndex(items, this.isVisibleItem);
            if (lastVisibleItemIndex !== -1) {
                items[lastVisibleItemIndex].hidden.set(true);
                if (!this.isEdgeItemIndex(items, lastVisibleItemIndex, reverseOverflowOrder)) {
                    this.updateItemsVisibility();
                }
            }
        } else {
            const firstHiddenItemIndex = reverseOverflowOrder
                ? this.findLastIndex(items, this.isHiddenItem)
                : items.findIndex(this.isHiddenItem);
            if (firstHiddenItemIndex !== -1) {
                const firstHiddenItemWidth = itemElementRefs[firstHiddenItemIndex].nativeElement.offsetWidth;
                const _isEdgeItemIndex = this.isEdgeItemIndex(items, firstHiddenItemIndex, reverseOverflowOrder);
                const _resultElementWidth = _isEdgeItemIndex ? 0 : resultElementWidth;
                if (firstHiddenItemWidth + visibleItemsTotalWidth + _resultElementWidth <= totalWidth) {
                    items[firstHiddenItemIndex].hidden.set(false);
                    if (!_isEdgeItemIndex) {
                        this.updateItemsVisibility();
                    }
                }
            }
        }
    }

    /**
     * Determines if the given item index is at the edge of the array (first or last element), based on the
     * `reverseOverflowOrder` flag.
     */
    private isEdgeItemIndex<T>(array: readonly T[], index: number, reverseOverflowOrder: boolean): boolean {
        return reverseOverflowOrder ? index === 0 : index === array.length - 1;
    }

    /**
     * Determines if the given item is hidden.
     */
    private isHiddenItem = ({ hidden }: KbqOverflowItem) => hidden();

    /**
     * Determines if the given item is visible.
     */
    private isVisibleItem = ({ hidden }: KbqOverflowItem) => !hidden();

    /** @TODO Should use `Array.prototype.findLastIndex` after migrating to ES2023 */
    private findLastIndex<T>(
        array: readonly T[],
        predicate: (value: T, index: number, array: readonly T[]) => boolean
    ): number {
        for (let i = array.length - 1; i >= 0; i--) {
            if (predicate(array[i], i, array)) {
                return i;
            }
        }

        return -1;
    }
}
