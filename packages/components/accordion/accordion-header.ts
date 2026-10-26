import { computed, Directive, inject } from '@angular/core';
import { KbqAccordion } from './accordion';
import { KbqAccordionItem } from './accordion-item';

@Directive({
    selector: 'kbq-accordion-header, [kbq-accordion-header]',
    host: {
        class: 'kbq-accordion-header',
        '[attr.role]': '"heading"',
        '[attr.aria-level]': 'accordion.level()',
        '[attr.aria-labelledby]': 'labelledBy',
        // Signals of this directive's own: the item and its other parts read the same state, and the host bindings of
        // every item in a view run in that view's reactive consumer, where a signal read again after others costs a
        // scan of all it has read so far.
        '[attr.data-state]': 'dataState()',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.data-orientation]': 'item.orientation'
    }
})
export class KbqAccordionHeader {
    /** @docs-private */
    protected readonly item = inject(KbqAccordionItem);
    /** @docs-private */
    protected readonly accordion = inject(KbqAccordion);

    /**
     * Value of `data-state`.
     *
     * @internal
     */
    protected readonly dataState = computed(() => this.item.dataState);

    /**
     * Names the heading after the trigger alone.
     *
     * A `role="heading"` takes its name from its content, so the header actions sitting beside the
     * trigger would otherwise append their own labels to it — a section titled "Profile" would be
     * announced as "Profile Run More" when navigating by heading. Pointing at the trigger yields the
     * announcement the WAI-ARIA APG gets by keeping the button the only element in the heading,
     * which this component cannot do because the header is also the row that lays the actions out.
     *
     * @docs-private
     */
    protected get labelledBy(): string | null {
        return this.item.trigger()?.triggerId ?? null;
    }
}
