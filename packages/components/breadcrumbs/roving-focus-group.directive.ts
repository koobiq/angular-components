import {
    booleanAttribute,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    NgZone,
    Output,
    signal
} from '@angular/core';
import { Direction, ENTRY_FOCUS, EVENT_OPTIONS, focusFirst, Orientation } from './utils';

@Directive({
    selector: '[rdxRovingFocusGroup]',
    host: {
        '[attr.data-orientation]': 'dataOrientation',
        '[attr.tabindex]': 'tabIndex',
        '[attr.dir]': 'dir',
        '(focus)': 'handleFocus($event)',
        '(blur)': 'handleBlur()',
        '(mouseup)': 'handleMouseUp()',
        '(mousedown)': 'handleMouseDown()',
        style: 'outline: none;'
    }
})
export class RdxRovingFocusGroupDirective {
    private readonly ngZone = inject(NgZone);
    private readonly elementRef = inject(ElementRef);

    @Input() orientation: Orientation | undefined;
    @Input() dir: Direction = 'ltr';
    @Input({ transform: booleanAttribute }) loop: boolean = true;
    @Input({ transform: booleanAttribute }) preventScrollOnEntryFocus: boolean = false;

    @Output() readonly entryFocus = new EventEmitter<Event>();
    @Output() readonly currentTabStopIdChange = new EventEmitter<string | null>();

    /** @docs-private */
    readonly currentTabStopId = signal<string | null>(null);

    /** @docs-private */
    readonly focusableItems = signal<HTMLElement[]>([]);

    private readonly isClickFocus = signal(false);
    private readonly isTabbingBackOut = signal(false);
    private readonly focusableItemsCount = signal(0);

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
    handleMouseUp() {
        // reset `isClickFocus` after 1 tick because handleFocus might not triggered due to focused element
        this.ngZone.runOutsideAngular(() => {
            Promise.resolve().then(() => {
                this.ngZone.run(() => {
                    this.isClickFocus.set(false);
                });
            });
        });
    }

    /** @docs-private */
    handleFocus(event: FocusEvent) {
        // We normally wouldn't need this check, because we already check
        // that the focus is on the current target and not bubbling to it.
        // We do this because Safari doesn't focus buttons when clicked, and
        // instead, the wrapper will get focused and not through a bubbling event.
        const isKeyboardFocus = !this.isClickFocus();

        if (
            event.currentTarget === this.elementRef.nativeElement &&
            event.target === event.currentTarget &&
            isKeyboardFocus &&
            !this.isTabbingBackOut()
        ) {
            const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);

            this.elementRef.nativeElement.dispatchEvent(entryFocusEvent);
            this.entryFocus.emit(entryFocusEvent);

            if (!entryFocusEvent.defaultPrevented) {
                const items = this.focusableItems().filter((item) => item.dataset['disabled'] !== '');
                const activeItem = items.find((item) => item.getAttribute('data-active') === 'true');
                const currentItem = items.find((item) => item.id === this.currentTabStopId());
                const candidateItems = [activeItem, currentItem, ...items].filter(Boolean) as HTMLElement[];

                focusFirst(candidateItems, this.preventScrollOnEntryFocus);
            }
        }

        this.isClickFocus.set(false);
    }

    /** @docs-private */
    handleMouseDown() {
        this.isClickFocus.set(true);
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
    onFocusableItemAdd() {
        this.focusableItemsCount.update((count) => count + 1);
    }

    /** @docs-private */
    onFocusableItemRemove() {
        this.focusableItemsCount.update((count) => Math.max(0, count - 1));
    }

    /** @docs-private */
    registerItem(item: HTMLElement) {
        const currentItems = this.focusableItems();

        this.focusableItems.set([...currentItems, item]);
    }

    /** @docs-private */
    unregisterItem(item: HTMLElement) {
        const currentItems = this.focusableItems();

        this.focusableItems.set(currentItems.filter((el) => el !== item));
    }

    /** @docs-private */
    getFocusableItemsCount() {
        return this.focusableItemsCount();
    }
}
