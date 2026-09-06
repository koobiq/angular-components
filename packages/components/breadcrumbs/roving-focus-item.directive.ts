import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    NgZone,
    OnDestroy
} from '@angular/core';
import { RdxRovingFocusGroupDirective } from './roving-focus-group.directive';
import { focusFirst, generateId, getActiveElementRoot, getFocusIntent, wrapArray } from './utils';

@Directive({
    selector: '[rdxRovingFocusItem]',
    host: {
        '[attr.tabindex]': 'tabIndex',
        '[attr.data-orientation]': 'parent.orientation',
        '[attr.data-active]': 'active()',
        '[attr.data-disabled]': '!focusable() ? "" : undefined',
        '(mousedown)': 'handleMouseDown($event)',
        '(keydown)': 'handleKeydown($event)',
        '(focus)': 'onFocus()'
    }
})
export class RdxRovingFocusItemDirective implements OnDestroy {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly ngZone = inject(NgZone);
    protected readonly parent = inject(RdxRovingFocusGroupDirective);

    readonly focusable = input<boolean, unknown>(true, { transform: booleanAttribute });
    /**
     * Whether the item is the one focus returns to when the group is re-entered. Defaults to `false`, so
     * that `data-active` discriminates: with every item active the lookup degenerates to the first one.
     */
    readonly active = input<boolean, unknown>(false, { transform: booleanAttribute });
    readonly tabStopId = input<string>('');
    readonly allowShiftKey = input<boolean, unknown>(false, { transform: booleanAttribute });

    private readonly id = computed(() => this.tabStopId() || generateId());

    /** @docs-private */
    readonly isCurrentTabStop = computed(() => this.parent.currentTabStopId() === this.id());

    constructor() {
        // Registration follows `focusable`, which the host binds to a derived expression: an item that
        // becomes focusable after creation has to join the group, and one that stops being focusable has
        // to leave it, or the group keeps counting an element the arrow keys can no longer reach.
        effect((onCleanup) => {
            if (!this.focusable()) return;

            const element = this.elementRef.nativeElement;

            this.parent.registerItem(element, this.id());

            onCleanup(() => this.parent.unregisterItem(element));
        });
    }

    /**
     * Lifecycle hook triggered on destruction.
     * Unregisters the element from the parent roving focus group.
     * @docs-private
     */
    ngOnDestroy() {
        this.parent.unregisterItem(this.elementRef.nativeElement);
    }

    /**
     * Determines the `tabIndex` of the element.
     * Returns `0` if the element is the current tab stop; otherwise, returns `-1`.
     * @docs-private
     */
    get tabIndex() {
        return this.isCurrentTabStop() ? 0 : -1;
    }

    /** @docs-private */
    handleMouseDown(event: MouseEvent) {
        if (!this.focusable()) {
            // We prevent focusing non-focusable items on `mousedown`.
            // Even though the item has tabIndex={-1}, that only means take it out of the tab order.
            event.preventDefault();
        } else {
            // Safari doesn't focus a button when clicked so we run our logic on mousedown also
            this.parent.onItemFocus(this.id());
        }
    }

    /** @docs-private */
    onFocus() {
        this.parent.onItemFocus(this.id());
    }

    /**
     * Handles the `keydown` event for keyboard navigation within the roving focus group.
     * Supports navigation based on orientation and direction, and focuses appropriate elements.
     *
     * @param event The `KeyboardEvent` object.
     * @docs-private
     */
    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Tab' && event.shiftKey) {
            this.parent.onItemShiftTab();

            return;
        }

        if (event.target !== this.elementRef.nativeElement) return;

        const focusIntent = getFocusIntent(event, this.parent.orientation, this.parent.resolvedDir());

        if (focusIntent !== undefined) {
            if (event.metaKey || event.ctrlKey || event.altKey || (this.allowShiftKey() ? false : event.shiftKey)) {
                return;
            }

            event.preventDefault();

            let candidateNodes = this.parent.focusableItems().filter((item) => item.dataset['disabled'] !== '');

            if (focusIntent === 'last') {
                candidateNodes.reverse();
            } else if (focusIntent === 'prev' || focusIntent === 'next') {
                if (focusIntent === 'prev') candidateNodes.reverse();
                const currentIndex = candidateNodes.indexOf(this.elementRef.nativeElement);

                candidateNodes = this.parent.loop()
                    ? wrapArray(candidateNodes, currentIndex + 1)
                    : candidateNodes.slice(currentIndex + 1);
            }

            this.ngZone.runOutsideAngular(() => {
                Promise.resolve().then(() => {
                    focusFirst(candidateNodes, false, getActiveElementRoot(this.elementRef.nativeElement));
                });
            });
        }
    }
}
