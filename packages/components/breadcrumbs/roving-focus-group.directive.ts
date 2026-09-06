import { Directionality } from '@angular/cdk/bidi';
import { booleanAttribute, computed, Directive, ElementRef, inject, Input, input, output, signal } from '@angular/core';
import { Direction, ENTRY_FOCUS, EVENT_OPTIONS, focusFirst, getActiveElementRoot, Orientation } from './utils';

@Directive({
    selector: '[rdxRovingFocusGroup]',
    host: {
        '[attr.data-orientation]': 'dataOrientation',
        '[attr.tabindex]': 'tabIndex',
        '[attr.dir]': 'dir()',
        '(focus)': 'handleFocus($event)',
        '(focusout)': 'handleBlur()'
    }
})
export class RdxRovingFocusGroupDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly directionality = inject(Directionality, { optional: true });

    /**
     * Axis the arrow keys navigate along. Kept as a decorator input because the host component writes it
     * directly, once, from its own constructor — a signal input cannot be assigned to.
     */
    @Input() orientation: Orientation | undefined;
    /**
     * Reading direction the arrow keys are mapped against, written onto the host as `dir`. Left unset,
     * no attribute is emitted — the element inherits the document direction, and the key mapping follows
     * the ambient CDK `Directionality`.
     */
    readonly dir = input<Direction | null>(null);
    readonly loop = input<boolean, unknown>(true, { transform: booleanAttribute });
    readonly preventScrollOnEntryFocus = input<boolean, unknown>(false, { transform: booleanAttribute });

    readonly entryFocus = output<Event>();
    readonly currentTabStopIdChange = output<string | null>();

    /** @docs-private */
    readonly currentTabStopId = signal<string | null>(null);

    /** @docs-private */
    readonly focusableItems = signal<HTMLElement[]>([]);

    /** Tab stop id of each registered element, so the current tab stop can be resolved back to its node. */
    private readonly itemIds = new WeakMap<HTMLElement, string>();

    private readonly isTabbingBackOut = signal(false);

    /**
     * Reading direction the arrow keys are actually mapped against: the input when it is set, the
     * ambient `Directionality` otherwise.
     * @docs-private
     */
    readonly resolvedDir = computed<Direction>(() => this.dir() ?? this.directionality?.valueSignal() ?? 'ltr');

    /** @docs-private */
    get dataOrientation() {
        return this.orientation || 'horizontal';
    }

    /** @docs-private */
    get tabIndex() {
        return this.isTabbingBackOut() || this.getFocusableItemsCount() === 0 ? -1 : 0;
    }

    /** @docs-private */
    handleBlur() {
        this.isTabbingBackOut.set(false);
    }

    /** @docs-private */
    handleFocus(event: FocusEvent) {
        // Forwarded regardless of what moved the focus here: a click on the group's own padding lands on
        // the host, which is a tab stop with nothing to do, and the trail would otherwise hold an
        // invisible focus that the next Tab leaves altogether. A click on an item is unaffected — the
        // item records itself as the current tab stop on `mousedown`, so the forward returns to it.
        if (
            event.currentTarget === this.elementRef.nativeElement &&
            event.target === event.currentTarget &&
            !this.isTabbingBackOut()
        ) {
            const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);

            this.elementRef.nativeElement.dispatchEvent(entryFocusEvent);
            this.entryFocus.emit(entryFocusEvent);

            if (!entryFocusEvent.defaultPrevented) {
                const items = this.focusableItems().filter((item) => item.dataset['disabled'] !== '');
                const activeItem = items.find((item) => item.getAttribute('data-active') === 'true');
                const currentItem = items.find((item) => this.itemIds.get(item) === this.currentTabStopId());
                const candidateItems = [activeItem, currentItem, ...items].filter(Boolean) as HTMLElement[];

                focusFirst(
                    candidateItems,
                    this.preventScrollOnEntryFocus(),
                    getActiveElementRoot(this.elementRef.nativeElement)
                );
            }
        }
    }

    /** @docs-private */
    onItemFocus(tabStopId: string) {
        this.currentTabStopId.set(tabStopId);
        this.currentTabStopIdChange.emit(tabStopId);
    }

    /** @docs-private */
    onItemShiftTab() {
        this.isTabbingBackOut.set(true);
    }

    /** @docs-private */
    registerItem(item: HTMLElement, tabStopId?: string) {
        if (tabStopId !== undefined) {
            this.itemIds.set(item, tabStopId);
        }

        this.focusableItems.update((items) => (items.includes(item) ? items : [...items, item]));
    }

    /** @docs-private */
    unregisterItem(item: HTMLElement) {
        if (this.itemIds.get(item) === this.currentTabStopId()) {
            this.currentTabStopId.set(null);
        }

        this.itemIds.delete(item);
        this.focusableItems.update((items) => items.filter((el) => el !== item));
    }

    /** @docs-private */
    getFocusableItemsCount() {
        return this.focusableItems().length;
    }
}
