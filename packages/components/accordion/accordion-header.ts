import { Directive, inject } from '@angular/core';
import { KbqAccordion } from './accordion';
import { KbqAccordionItem } from './accordion-item';

@Directive({
    selector: 'kbq-accordion-header, [kbq-accordion-header]',
    host: {
        class: 'kbq-accordion-header',
        '[attr.role]': '"heading"',
        '[attr.aria-level]': 'accordion.level()',
        '[attr.aria-labelledby]': 'labelledBy',
        '[attr.data-state]': 'item.dataState',
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
     * Names the heading after the trigger alone.
     *
     * A `role="heading"` takes its name from its content, so the header actions sitting beside the
     * trigger would otherwise append their own labels to it — a section titled "Profile" would be
     * announced as "Profile Run More" when navigating by heading. Pointing at the trigger yields the
     * announcement the WAI-ARIA APG gets by keeping the button the only element in the heading,
     * which this component cannot do because the header is also the row that lays the actions out.
     * @docs-private
     */
    protected get labelledBy(): string | null {
        return this.item.trigger()?.triggerId ?? null;
    }
}
