import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    computed,
    contentChild,
    contentChildren,
    DestroyRef,
    Directive,
    inject,
    InjectionToken,
    input,
    numberAttribute,
    output,
    Renderer2,
    signal,
    untracked
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
    KBQ_WINDOW,
    type KbqFlexWrap,
    kbqInjectNativeElement,
    type KbqOrientation,
    KbqOverflowFitEngine,
    kbqOverflowRecalculationTriggers
} from '@koobiq/components/core';

/**
 * Elements that `KbqOverflowItems` observes for resize changes on top of its own element and
 * `additionalResizeObserverTargets`. Provided by a component that is as wide as its content, such as the actions panel:
 * items hidden by `KbqOverflowItems` drop out of that width, so the component does not grow back by itself once there
 * is room for them again, and only the element that bounds it reports that room.
 *
 * @docs-private
 */
export const KBQ_OVERFLOW_ITEMS_RESIZE_OBSERVER_TARGETS = new InjectionToken<readonly Element[]>(
    'KBQ_OVERFLOW_ITEMS_RESIZE_OBSERVER_TARGETS',
    { factory: () => [] }
);

/**
 * Manages the visibility of the element.
 *
 * @docs-private
 */
@Directive({
    host: {
        '[attr.aria-hidden]': 'hidden()',
        '[class.kbq-overflow-item-hidden]': 'hidden()'
    }
})
export class ElementVisibilityManager {
    private readonly renderer = inject(Renderer2);

    /**
     * @docs-private
     */
    readonly element = kbqInjectNativeElement();

    private readonly hiddenState = signal(false);

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
    host: { class: 'kbq-overflow-items-result' },
    exportAs: 'kbqOverflowItemsResult'
})
export class KbqOverflowItemsResult extends ElementVisibilityManager {}

/**
 * Directive for the item that can be hidden by the `KbqOverflowItems` directive.
 */
@Directive({
    selector: '[kbqOverflowItem]',
    host: {
        class: 'kbq-overflow-item',
        '[class.kbq-overflow-item_always-visible]': 'alwaysVisible()'
    },
    exportAs: 'kbqOverflowItem'
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
     * Element with this attribute will be ignored when hiding and will always remain visible. Defaults to `false`.
     */
    readonly alwaysVisible = input(false, { transform: booleanAttribute });

    /**
     * @docs-private
     */
    override hide(): void {
        // Untracked: called from a consumer's `effect()`, `alwaysVisible` would make the effect run again when it changes.
        if (untracked(this.alwaysVisible)) return;

        super.hide();
    }
}

/**
 * Directive for managing the visibility of items that overflow the container.
 */
@Directive({
    selector: '[kbqOverflowItems]',
    host: { class: 'kbq-overflow-items' },
    exportAs: 'kbqOverflowItems'
})
export class KbqOverflowItems {
    private readonly element = kbqInjectNativeElement();
    private readonly destroyRef = inject(DestroyRef);
    private readonly renderer = inject(Renderer2);
    private readonly window = inject(KBQ_WINDOW);
    private readonly document = inject(DOCUMENT);
    private readonly resizeObserverTargets = inject(KBQ_OVERFLOW_ITEMS_RESIZE_OBSERVER_TARGETS);

    /**
     * Whether the overflow order should be reversed. Defaults to `false`.
     *
     * @example
     * ```text
     * [0, 1, hidden, hidden] ---> [hidden, hidden, 2, 3]
     * ```
     */
    readonly reverseOverflowOrder = input(false, { transform: booleanAttribute });

    /**
     * Debounce time for recalculating items visibility. Defaults to `0`.
     */
    readonly debounceTime = input(0, { transform: numberAttribute });

    /**
     * List of additional elements to observe for resize changes. Defaults to `document.body`.
     */
    readonly additionalResizeObserverTargets = input<Element | Element[]>(this.document.body);

    /**
     * Defines the orientation of the overflow items. Defaults to `'horizontal'`.
     */
    readonly orientation = input<KbqOrientation>('horizontal');

    /**
     * Defines the wrap of the overflow items. Defaults to `'nowrap'`.
     */
    readonly wrap = input<KbqFlexWrap>('nowrap');

    /**
     * Emits the set of hidden items after every recalculation, also when it has not changed: a recalculation shows every
     * item before it hides the overflown ones again, so a consumer that hides items itself re-applies that here.
     */
    readonly changes = output<ReadonlySet<unknown>>();

    /**
     * `KbqOverflowItem` directive references.
     */
    private readonly items = contentChildren(KbqOverflowItem);

    /**
     * `KbqOverflowItemsResult` directive reference.
     */
    private readonly result = contentChild(KbqOverflowItemsResult);

    /**
     * The measurement and hiding core, shared with the horizontal navbar, see `KbqOverflowFitEngine`.
     */
    private readonly engine = new KbqOverflowFitEngine(this.window);

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
        // What the hidden set depends on besides the geometry.
        const inputs = computed(() => [
            this.items().map((item) => [item.order(), item.alwaysVisible()]),
            this.result(),
            this.reverseOverflowOrder(),
            this.orientation(),
            this.wrap()
        ]);

        kbqOverflowRecalculationTriggers({
            element: this.element,
            targets: this.resizeObserverTargets,
            additionalTargets: this.additionalResizeObserverTargets,
            debounceTime: this.debounceTime,
            extra: [toObservable(inputs).pipe(map(() => undefined))]
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
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
        this.engine.showAll(items, result);

        // The engine hides in the order the items are handed in; the default order is the end of the list.
        const subject = this.engine.containerSubject(container, orientation, this.wrap());
        const hideOrder = reverseOverflowOrder ? items : [...items].reverse();

        this.engine.hideOverflownItems(hideOrder, subject, result, this.wrap());

        return items.filter((item) => item.hidden());
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
     * This method sets the necessary styles for the directive.
     */
    private setStyles(): void {
        this.renderer.setStyle(this.element, 'position', 'relative');
        this.renderer.setStyle(this.element, 'overflow', 'hidden');
        this.renderer.setStyle(this.element, 'display', 'flex');
        this.renderer.setStyle(this.element, 'flex-grow', '1');

        toObservable(this.orientation)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((orientation) => {
                const { flexDirection } = this.engine.orientationConfig[orientation];

                this.renderer.setStyle(this.element, 'flex-direction', flexDirection);
            });

        toObservable(this.wrap)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((wrap) => this.renderer.setStyle(this.element, 'flex-wrap', wrap));
    }
}
