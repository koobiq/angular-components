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
import { KBQ_WINDOW, kbqInjectNativeElement, KbqOrientation } from '@koobiq/components/core';
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
    readonly element = kbqInjectNativeElement();

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
        this.renderer.setStyle(this.element, 'visibility', 'hidden');
        this.renderer.setStyle(this.element, 'position', 'absolute');
        this.hiddenState.set(true);
    }

    /**
     * Shows the element.
     *
     * @docs-private
     */
    show(): void {
        this.renderer.removeStyle(this.element, 'visibility');
        this.renderer.removeStyle(this.element, 'position');
        this.hiddenState.set(false);
    }
}

/**
 * Directive for displaying the result of hidden items by the `KbqOverflowItems` directive.
 */
@Directive({
    selector: '[kbqOverflowItemsResult]',
    exportAs: 'kbqOverflowItemsResult',
    host: { class: 'kbq-overflow-items-result' }
})
export class KbqOverflowItemsResult extends ElementVisibilityManager {}

/**
 * Directive for the item that can be hidden by the `KbqOverflowItems` directive.
 */
@Directive({
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
    selector: '[kbqOverflowItems]',
    exportAs: 'kbqOverflowItems',
    host: { class: 'kbq-overflow-items' }
})
export class KbqOverflowItems {
    private readonly element = kbqInjectNativeElement();
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

    /**
     * Defines the orientation of the overflow items.
     *
     * @default 'horizontal'
     */
    readonly orientation = input<KbqOrientation>('horizontal');

    /**
     * Defines the wrap of the overflow items.
     *
     * @default 'nowrap'
     */
    readonly wrap = input<'wrap' | 'nowrap'>('nowrap');

    private readonly orientationConfig: Record<
        KbqOrientation,
        {
            containerSize: (element: HTMLElement) => number;
            paddingStart: (computedStyle: CSSStyleDeclaration) => number;
            paddingEnd: (computedStyle: CSSStyleDeclaration) => number;
            itemSize: (element: HTMLElement) => number;
            checkCrossAxisExceeded: (element: HTMLElement) => boolean;
            flexDirection: 'row' | 'column';
        }
    > = {
        horizontal: {
            containerSize: (element) => element.clientWidth,
            paddingStart: ({ paddingLeft }) => parseFloat(paddingLeft) || 0,
            paddingEnd: ({ paddingRight }) => parseFloat(paddingRight) || 0,
            checkCrossAxisExceeded: ({ clientHeight, scrollHeight }) => clientHeight < scrollHeight,
            itemSize: (element) => {
                const { marginRight, marginLeft } = this.window.getComputedStyle(element);

                return element.offsetWidth + (parseFloat(marginLeft) || 0) + (parseFloat(marginRight) || 0);
            },
            flexDirection: 'row'
        },
        vertical: {
            containerSize: (element) => element.clientHeight,
            paddingStart: ({ paddingTop }) => parseFloat(paddingTop) || 0,
            paddingEnd: ({ paddingBottom }) => parseFloat(paddingBottom) || 0,
            checkCrossAxisExceeded: ({ clientWidth, scrollWidth }) => clientWidth < scrollWidth,
            itemSize: (element) => {
                const { marginTop, marginBottom } = this.window.getComputedStyle(element);

                return element.offsetHeight + (parseFloat(marginTop) || 0) + (parseFloat(marginBottom) || 0);
            },
            flexDirection: 'column'
        }
    } as const;

    constructor() {
        this.setStyles();
        this.setupObservers();
    }

    private setupObservers(): void {
        const resizeObservers = merge(
            this.resizeObserver.observe(this.element),
            toObservable(this.additionalResizeObserverTargets).pipe(
                switchMap((targets) => {
                    return Array.isArray(targets)
                        ? merge(...targets.map((target) => this.resizeObserver.observe(target)))
                        : this.resizeObserver.observe(targets);
                })
            )
        );

        merge(
            toObservable(this.items),
            toObservable(this.reverseOverflowOrder).pipe(skip(1)),
            toObservable(this.orientation).pipe(skip(1)),
            resizeObservers
        )
            .pipe(debounceTime(this.debounceTime()), takeUntilDestroyed())
            .subscribe(() => {
                const hiddenItems = this.getHiddenItems(
                    this.sortItemsByOrder(this.items()),
                    this.reverseOverflowOrder(),
                    this.result(),
                    this.element,
                    this.orientation()
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
     * Manages the visibility of items based on the available space in the container and returns the hidden items.
     * Direction of hiding is determined by the `reverseOverflowOrder` attribute.
     */
    private getHiddenItems(
        items: ReadonlyArray<KbqOverflowItem>,
        reverseOverflowOrder: boolean,
        result: KbqOverflowItemsResult | undefined,
        container: HTMLElement,
        orientation: KbqOrientation
    ): ReadonlyArray<KbqOverflowItem> {
        result?.hide();
        items.forEach((item) => item.show());

        while (this.hasOverflown(container, items, result, orientation)) {
            const itemToHide = reverseOverflowOrder
                ? items.find(({ hidden, alwaysVisible }) => !hidden() && !alwaysVisible())
                : this.findLast(items, ({ hidden, alwaysVisible }) => !hidden() && !alwaysVisible());

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
        this.renderer.setStyle(this.element, 'position', 'relative');
        this.renderer.setStyle(this.element, 'overflow', 'hidden');
        this.renderer.setStyle(this.element, 'display', 'flex');
        this.renderer.setStyle(this.element, 'flex-grow', '1');

        toObservable(this.orientation)
            .pipe(takeUntilDestroyed())
            .subscribe((orientation) => {
                const { flexDirection } = this.orientationConfig[orientation];

                this.renderer.setStyle(this.element, 'flex-direction', flexDirection);
            });

        toObservable(this.wrap)
            .pipe(takeUntilDestroyed())
            .subscribe((wrap) => this.renderer.setStyle(this.element, 'flex-wrap', wrap));
    }

    private hasOverflown(
        container: HTMLElement,
        items: ReadonlyArray<KbqOverflowItem>,
        result: KbqOverflowItemsResult | undefined,
        orientation: KbqOrientation
    ): boolean {
        const { containerSize, paddingStart, paddingEnd, itemSize, checkCrossAxisExceeded } =
            this.orientationConfig[orientation];
        const computedStyle = this.window.getComputedStyle(container);
        const containerSizeWithoutPaddings =
            containerSize(container) - paddingStart(computedStyle) - paddingEnd(computedStyle);
        const itemsSize = items.reduce((size, item) => size + (item.hidden() ? 0 : itemSize(item.element)), 0);
        const resultSize = !result || result.hidden() ? 0 : itemSize(result.element);
        const isCrossAxisExceeded = this.wrap() === 'wrap' ? checkCrossAxisExceeded(container) : true;

        return itemsSize + resultSize > containerSizeWithoutPaddings && isCrossAxisExceeded;
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
