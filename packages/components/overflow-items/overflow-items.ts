import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    computed,
    contentChild,
    contentChildren,
    Directive,
    inject,
    input,
    numberAttribute,
    output,
    Renderer2,
    signal
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { KBQ_WINDOW, kbqInjectElementRef } from '@koobiq/components/core';
import { debounceTime, merge, skip, switchMap } from 'rxjs';

/**
 * Manages the visibility of the element.
 *
 * @docs-private
 */
@Directive({
    host: {
        '[attr.aria-hidden]': 'hidden()',
        // @TODO should be refactored (#DS-3834)
        '[class.kbq-overflow-item-hidden]': 'hidden()'
    }
})
export class ElementVisibilityManager {
    private readonly renderer = inject(Renderer2);
    private readonly hiddenState = signal(false);

    /**
     * @docs-private
     */
    readonly elementRef = kbqInjectElementRef();

    /**
     * Whether the element is hidden.
     *
     * @docs-private
     */
    readonly hidden = computed(() => this.hiddenState());

    /**
     * Hides the element.
     *
     * @docs-private
     */
    hide(): void {
        this.renderer.setStyle(this.elementRef.nativeElement, 'visibility', 'hidden');
        this.renderer.setStyle(this.elementRef.nativeElement, 'position', 'absolute');
        this.hiddenState.set(true);
    }

    /**
     * Shows the element.
     *
     * @docs-private
     */
    show(): void {
        this.renderer.removeStyle(this.elementRef.nativeElement, 'visibility');
        this.renderer.removeStyle(this.elementRef.nativeElement, 'position');
        this.hiddenState.set(false);
    }
}

/**
 * Directive for displaying the result of hidden items by the `KbqOverflowItems` directive.
 */
@Directive({
    standalone: true,
    selector: '[kbqOverflowItemsResult]',
    exportAs: 'kbqOverflowItemsResult',
    host: { class: 'kbq-overflow-items-result' }
})
export class KbqOverflowItemsResult extends ElementVisibilityManager {}

/**
 * Directive for the item that can be hidden by the `KbqOverflowItems` directive.
 */
@Directive({
    standalone: true,
    selector: '[kbqOverflowItem]',
    exportAs: 'kbqOverflowItem',
    host: {
        class: 'kbq-overflow-item',
        '[class.kbq-overflow-item_always-visible]': 'alwaysVisible()'
    }
})
export class KbqOverflowItem extends ElementVisibilityManager {
    /**
     * Unique identifier for the item.
     */
    readonly id = input.required({ alias: 'kbqOverflowItem' });
    /**
     * Defines the order in which the item is processed in the overflow container,
     * without changing its original position in the `QueryList`.
     */
    readonly order = input(null, { transform: numberAttribute });
    /**
     * Element with this attribute will be ignored when hiding and will always remain visible.
     * @default false
     */
    readonly alwaysVisible = input(false, { transform: booleanAttribute });

    /**
     * @docs-private
     */
    override hide(): void {
        if (this.alwaysVisible()) return;

        super.hide();
    }
}

/**
 * Directive for managing the visibility of items that overflow the container.
 */
@Directive({
    standalone: true,
    selector: '[kbqOverflowItems]',
    exportAs: 'kbqOverflowItems',
    host: { class: 'kbq-overflow-items' }
})
export class KbqOverflowItems {
    private readonly elementRef = kbqInjectElementRef();
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);

    /**
     * `KbqOverflowItem` directive references.
     */
    private readonly items = contentChildren(KbqOverflowItem);

    /**
     * `KbqOverflowItemsResult` directive reference.
     */
    private readonly result = contentChild(KbqOverflowItemsResult);

    /**
     * Whether the overflow order should be reversed.
     *
     * @example
     * ```
     * [0, 1, hidden, hidden] ---> [hidden, hidden, 2, 3]
     * ```
     *
     * @default false
     */
    readonly reverseOverflowOrder = input(false, { transform: booleanAttribute });

    /**
     * Debounce time for recalculating items visibility.
     *
     * @default 0
     */
    readonly debounceTime = input(0, { transform: numberAttribute });

    /**
     * List of additional elements to observe for resize changes.
     *
     * @default document.body
     */
    readonly additionalResizeObserverTargets = input<Element | Element[]>(this.document.body);

    /**
     * Emits when the set of hidden items changes.
     */
    readonly changes = output<ReadonlySet<unknown>>();

    /**
     * Set of hidden item IDs.
     */
    readonly hiddenItemIDs = toSignal(outputToObservable(this.changes), {
        initialValue: new Set<unknown>([]) as ReadonlySet<unknown>
    });

    constructor() {
        this.setStyles();
        this.setupObservers();
    }

    private setupObservers(): void {
        const resizeObservers = merge(
            this.resizeObserver.observe(this.elementRef.nativeElement),
            toObservable(this.additionalResizeObserverTargets).pipe(
                switchMap((targets) => {
                    return Array.isArray(targets)
                        ? merge(...targets.map((target) => this.resizeObserver.observe(target)))
                        : this.resizeObserver.observe(targets);
                })
            )
        );

        merge(toObservable(this.items), toObservable(this.reverseOverflowOrder).pipe(skip(1)), resizeObservers)
            .pipe(debounceTime(this.debounceTime()), takeUntilDestroyed())
            .subscribe(() => {
                const hiddenItems = this.getHiddenItems(
                    this.sortItemsByOrder(this.excludeAlwaysVisibleItems(this.items())),
                    this.reverseOverflowOrder(),
                    this.result(),
                    this.elementRef.nativeElement
                );
                const hiddenItemIDs = new Set(hiddenItems.map(({ id }) => id()));

                this.changes.emit(hiddenItemIDs);
            });
    }

    /**
     * Sort items by their `order` attribute.
     * If an item does not have an `order` defined, its index is used as a fallback.
     */
    private sortItemsByOrder(items: ReadonlyArray<KbqOverflowItem>): ReadonlyArray<KbqOverflowItem> {
        const itemsWithOrder = Array.from(items, (item, index) => ({ item, order: item.order() ?? index }));

        return itemsWithOrder.sort((a, b) => a.order - b.order).map(({ item }) => item);
    }

    /**
     * Excludes items that have the `alwaysVisible` attribute.
     */
    private excludeAlwaysVisibleItems(items: ReadonlyArray<KbqOverflowItem>): ReadonlyArray<KbqOverflowItem> {
        return items.filter(({ alwaysVisible }) => !alwaysVisible());
    }

    /**
     * Manages the visibility of items based on the available space in the container and returns the hidden items.
     * Direction of hiding is determined by the `reverseOverflowOrder` attribute.
     */
    private getHiddenItems(
        items: ReadonlyArray<KbqOverflowItem>,
        reverseOverflowOrder: boolean,
        result: KbqOverflowItemsResult | undefined,
        container: HTMLElement
    ): ReadonlyArray<KbqOverflowItem> {
        result?.hide();
        items.forEach((item) => item.show());

        while (this.hasOverflown(container, items, result)) {
            const itemToHide = reverseOverflowOrder
                ? items.find(({ hidden }) => !hidden())
                : this.findLast(items, ({ hidden }) => !hidden());

            if (!itemToHide) break;

            itemToHide.hide();
            result?.show();
        }

        return items.filter(({ hidden }) => hidden());
    }

    /**
     * This method sets the necessary styles for the directive.
     */
    private setStyles(): void {
        this.renderer.setStyle(this.elementRef.nativeElement, 'position', 'relative');
        this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'flex');
        this.renderer.setStyle(this.elementRef.nativeElement, 'flex-wrap', 'nowrap');
        this.renderer.setStyle(this.elementRef.nativeElement, 'flex-grow', '1');
        this.renderer.setStyle(this.elementRef.nativeElement, 'overflow', 'hidden');
    }

    private hasOverflown(
        container: HTMLElement,
        items: ReadonlyArray<KbqOverflowItem>,
        result: KbqOverflowItemsResult | undefined
    ): boolean {
        const { paddingLeft, paddingRight } = this.window.getComputedStyle(container);
        const containerWidthWithoutPaddings =
            container.clientWidth - (parseFloat(paddingLeft) || 0) - (parseFloat(paddingRight) || 0);
        const itemsWidth = items.reduce(
            (width, item) =>
                width + (item.hidden() ? 0 : this.getElementWidthWithMargins(item.elementRef.nativeElement)),
            0
        );
        const resultWidth =
            !result || result?.hidden() ? 0 : this.getElementWidthWithMargins(result.elementRef.nativeElement);

        return itemsWidth + resultWidth > containerWidthWithoutPaddings;
    }

    private getElementWidthWithMargins(element: HTMLElement): number {
        const { marginRight, marginLeft } = this.window.getComputedStyle(element);

        return element.offsetWidth + (parseFloat(marginLeft) || 0) + (parseFloat(marginRight) || 0);
    }

    /**
     * @TODO Should be removed when `Array.prototype.findLast` is supported.
     */
    private findLast<T>(array: ReadonlyArray<T>, predicate: (item: T) => boolean): T | undefined {
        for (let i = array.length - 1; i >= 0; i--) {
            if (predicate(array[i])) {
                return array[i];
            }
        }

        return undefined;
    }
}
