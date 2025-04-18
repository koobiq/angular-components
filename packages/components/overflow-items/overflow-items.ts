import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
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
        '[attr.aria-hidden]': 'hidden()'
    }
})
export class ElementVisibilityManager {
    private readonly renderer = inject(Renderer2);

    /**
     * Reference to the element.
     *
     * @docs-private
     */
    readonly elementRef = inject(ElementRef);

    /**
     * Whether the element is hidden.
     *
     * @docs-private
     */
    readonly hidden = signal(false);

    /**
     * Hides the element.
     *
     * @docs-private
     */
    hide(): void {
        this.renderer.setStyle(this.elementRef.nativeElement, 'visibility', 'hidden');
        this.renderer.setStyle(this.elementRef.nativeElement, 'position', 'absolute');
        this.hidden.set(true);
    }

    /**
     * Shows the element.
     *
     * @docs-private
     */
    show(): void {
        this.renderer.removeStyle(this.elementRef.nativeElement, 'visibility');
        this.renderer.removeStyle(this.elementRef.nativeElement, 'position');
        this.hidden.set(false);
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
     *
     * @docs-private
     */
    private readonly items = contentChildren(KbqOverflowItem);

    /**
     * `KbqOverflowItemsResult` directive reference.
     *
     * @docs-private
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
     * @default 100
     */
    readonly debounceTime = input(100, { transform: numberAttribute });

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
            this.resizeObserver.observe(this.elementRef.nativeElement)
        )
            .pipe(debounceTime(this.debounceTime()), takeUntilDestroyed())
            .subscribe(() => {
                const hiddenItems = this.calculateItemsVisibility(
                    this.getSortedItemsByOrder(),
                    this.reverseOverflowOrder(),
                    this.result(),
                    this.elementRef.nativeElement
                );
                const hiddenItemIDs = new Set(hiddenItems.map(({ id }) => id()));

                this.changes.emit(hiddenItemIDs);
            });
    }

    /**
     * Returns a list of items sorted by their specified `order` value.
     * If an item does not have an `order` defined, its index is used as a fallback.
     * This ensures a stable order while allowing custom positioning.
     */
    private getSortedItemsByOrder(): KbqOverflowItem[] {
        const items = Array.from(this.items(), (item, index) => ({ item, order: item.order() ?? index }));

        return items.sort((a, b) => a.order - b.order).map(({ item }) => item);
    }

    /**
     * Calculates the visibility of items, based on the container width and `reverseOverflowOrder` property.
     */
    private calculateItemsVisibility(
        items: readonly KbqOverflowItem[],
        reverseOverflowOrder: boolean,
        result: KbqOverflowItemsResult | undefined,
        { offsetWidth: totalWidth }: HTMLElement
    ): KbqOverflowItem[] {
        result?.hide();
        items.forEach((item) => {
            item.show();
        });
        let itemsWidth = items.reduce(
            (width, { elementRef }) => width + this.getElementWidthWithMargins(elementRef),
            0
        );
        const startIndex = reverseOverflowOrder ? 0 : items.length - 1;
        const endIndex = reverseOverflowOrder ? items.length : -1;
        const step = reverseOverflowOrder ? 1 : -1;
        const resultWidth = result ? this.getElementWidthWithMargins(result.elementRef) : 0;

        for (let index = startIndex; index !== endIndex; index += step) {
            const current = items[index];

            if (current.alwaysVisible()) continue;

            const currentWidth = this.getElementWidthWithMargins(current.elementRef);
            const _resultWidth = items.some(this.isHiddenItem) ? resultWidth : 0;

            if (itemsWidth + _resultWidth > totalWidth) {
                current.hide();
                itemsWidth -= currentWidth;
            } else {
                const isEdgeElement = reverseOverflowOrder ? index === 0 : index === items.length - 1;
                const _resultWidth = isEdgeElement ? 0 : resultWidth;

                if (itemsWidth + currentWidth + _resultWidth <= totalWidth) {
                    current.show();
                    itemsWidth += currentWidth;
                }
            }
        }

        const hiddenItems = items.filter(this.isHiddenItem);

        if (hiddenItems.length > 0) {
            result?.show();
        }

        return hiddenItems;
    }

    /**
     * Returns the width of the element including margins.
     */
    private getElementWidthWithMargins({ nativeElement }: ElementRef<HTMLElement>): number {
        const { marginLeft, marginRight } = this.getWindow().getComputedStyle(nativeElement);

        return Math.ceil(parseFloat(marginLeft) + nativeElement.offsetWidth + parseFloat(marginRight));
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
     * Determines if the given item is hidden.
     */
    private isHiddenItem = ({ hidden }: KbqOverflowItem) => hidden();

    /**
     * Returns the window object.
     */
    private getWindow(): Window {
        return this.document.defaultView || window;
    }
}
