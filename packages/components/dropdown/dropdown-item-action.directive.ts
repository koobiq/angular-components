import { Directive, ElementRef, InjectionToken, Signal, inject } from '@angular/core';

/**
 * Narrow view of `KbqDropdownItem` that `KbqDropdownItemAction` needs. Read through
 * `KBQ_DROPDOWN_ITEM_ACTION_HOST` instead of importing `KbqDropdownItem` directly: the item
 * imports `KbqDropdownItemAction` for its `contentChild` query, so an import back from here would
 * form a circular dependency between the two files, which breaks the query at runtime (the
 * predicate ends up captured as `undefined`).
 * @docs-private
 */
export interface KbqDropdownItemActionHost {
    readonly disabled: boolean;
    readonly progress: Signal<boolean>;
}

/** @docs-private */
export const KBQ_DROPDOWN_ITEM_ACTION_HOST = new InjectionToken<KbqDropdownItemActionHost>(
    'kbq-dropdown-item-action-host'
);

/**
 * Marks a secondary, independently-focusable/clickable element (e.g. a settings link) projected
 * inside a `kbq-dropdown-item` alongside the item's own primary action. Requires the item's host
 * element to be non-interactive (e.g. `<div kbq-dropdown-item>`), since interactive content
 * cannot validly nest inside another interactive element.
 */
@Directive({
    selector: '[kbq-dropdown-item-action]',
    host: {
        class: 'kbq-dropdown-item__action',
        '[class.kbq-disabled]': 'isInactive()',
        '[attr.aria-disabled]': 'isInactive() || null',
        '[attr.tabindex]': "isInactive() ? '-1' : null",
        '(click)': 'onClick($event)'
    }
})
export class KbqDropdownItemAction {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly dropdownItem = inject(KBQ_DROPDOWN_ITEM_ACTION_HOST, { optional: true });

    /** Returns the host DOM element. */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    /** `progress` takes priority over the action, same as `disabled`. */
    protected isInactive(): boolean {
        return !!this.dropdownItem?.disabled || !!this.dropdownItem?.progress();
    }

    /**
     * Always stops the click from bubbling to the item's own primary click handler.
     * Additionally, blocks the action's own default behavior when the parent item is
     * disabled/loading — `<a>` has no native `disabled`.
     */
    onClick(event: MouseEvent): void {
        event.stopPropagation();

        if (this.isInactive()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
}
