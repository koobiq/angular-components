import { Directive, effect, ElementRef, inject, InjectionToken, Signal } from '@angular/core';

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
    'kbqDropdownItemAction-host'
);

/**
 * Marks a secondary, independently-focusable/clickable element (e.g. a settings link) projected
 * inside a `kbq-dropdown-item` alongside the item's own primary action. Requires the item's host
 * element to be non-interactive (e.g. `<div kbq-dropdown-item>`), since interactive content
 * cannot validly nest inside another interactive element.
 */
@Directive({
    selector: '[kbqDropdownItemAction]',
    host: {
        class: 'kbq-dropdown-item__action',
        '[class.kbq-disabled]': 'isInactive()',
        '[attr.aria-disabled]': 'isInactive() || null',
        '(click)': 'onClick($event)'
    }
})
export class KbqDropdownItemAction {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly dropdownItem = inject(KBQ_DROPDOWN_ITEM_ACTION_HOST);

    /**
     * The `tabindex` this element had before `isInactive()` first forced it to `-1`, so it can be
     * restored instead of left removed. Plain `[attr.tabindex]` can't do this: co-located host
     * bindings for the same attribute (e.g. `KbqIconButton`'s own `tabindex`) apply in directive
     * order and the last one always wins outright, so writing `null` here on the active branch
     * would strip whatever tabindex the host component set, not just leave it alone.
     */
    private originalTabindex: string | null = null;

    constructor() {
        effect(() => {
            const el = this.elementRef.nativeElement;

            if (this.isInactive()) {
                if (this.originalTabindex === null) this.originalTabindex = el.getAttribute('tabindex');

                el.setAttribute('tabindex', '-1');
            } else if (this.originalTabindex !== null) {
                el.setAttribute('tabindex', this.originalTabindex);
                this.originalTabindex = null;
            }
        });
    }

    /** Returns the host DOM element. */
    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    /** `progress` takes priority over the action, same as `disabled`. */
    protected isInactive(): boolean {
        return this.dropdownItem.disabled || this.dropdownItem.progress();
    }

    /**
     * Always stops the click from bubbling to the item's own primary click handler.
     * Additionally, blocks the action's own default behavior when the parent item is
     * disabled/loading — `<a>` has no native `disabled`.
     */
    protected onClick(event: MouseEvent): void {
        event.stopPropagation();

        if (this.isInactive()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
}
