import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    computed,
    contentChild,
    contentChildren,
    Directive,
    ElementRef,
    inject,
    input,
    numberAttribute,
    output,
    Renderer2,
    signal
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, merge, skip } from 'rxjs';

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
    private readonly elementRef = inject(ElementRef);
    private readonly _hidden = signal(false);

    /**
     * Whether the element is hidden.
     *
     * @docs-private
     */
    readonly hidden = computed(() => this._hidden());

    /**
     * Hides the element.
     *
     * @docs-private
     */
    hide(): void {
        this.renderer.setStyle(this.elementRef.nativeElement, 'visibility', 'hidden');
        this.renderer.setStyle(this.elementRef.nativeElement, 'position', 'absolute');
        this._hidden.set(true);
    }

    /**
     * Shows the element.
     *
     * @docs-private
     */
    show(): void {
        this.renderer.removeStyle(this.elementRef.nativeElement, 'visibility');
        this.renderer.removeStyle(this.elementRef.nativeElement, 'position');
        this._hidden.set(false);
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
    host: { class: 'kbq-overflow-item' }
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
     * Emits when the set of hidden items changes.
     */
    readonly changes = output<ReadonlySet<unknown>>();

    /**
     * Set of hidden item IDs.
     */
    readonly hiddenItemIDs = toSignal(outputToObservable(this.changes), {
        initialValue: new Set<unknown>([]) as ReadonlySet<unknown>
    });

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);

    constructor() {
        this.setStyles();

        merge(
            toObservable(this.items),
            toObservable(this.reverseOverflowOrder).pipe(skip(1)),
            this.resizeObserver.observe(this.elementRef.nativeElement),
            this.resizeObserver.observe(this.document.body)
        )
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
    private sortItemsByOrder(items: Readonly<KbqOverflowItem[]>): KbqOverflowItem[] {
        const itemsWithOrder = Array.from(items, (item, index) => ({ item, order: item.order() ?? index }));

        return itemsWithOrder.sort((a, b) => a.order - b.order).map(({ item }) => item);
    }

    /**
     * Excludes items that have the `alwaysVisible` attribute.
     */
    private excludeAlwaysVisibleItems(items: Readonly<KbqOverflowItem[]>): KbqOverflowItem[] {
        return items.filter(({ alwaysVisible }) => !alwaysVisible());
    }

    /**
     * Manages the visibility of items based on the available space in the container and returns the hidden items.
     * Direction of hiding is determined by the `reverseOverflowOrder` attribute.
     */
    private getHiddenItems(
        items: Readonly<KbqOverflowItem[]>,
        reverseOverflowOrder: boolean,
        result: KbqOverflowItemsResult | undefined,
        container: HTMLElement
    ): KbqOverflowItem[] {
        result?.hide();
        items.forEach((item) => item.show());

        while (this.hasScrollbar(container)) {
            const visibleItems = items.filter(({ hidden }) => !hidden());

            if (visibleItems.length === 0) break;

            const itemToHide = reverseOverflowOrder ? visibleItems[0] : visibleItems[visibleItems.length - 1];

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

    /**
     * Determines if the given element has a scrollbar.
     */
    private readonly hasScrollbar = ({ scrollWidth, clientWidth }: HTMLElement): boolean => scrollWidth > clientWidth;
}
