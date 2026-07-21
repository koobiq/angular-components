import { Directive, inject } from '@angular/core';
import { kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqAccordion } from './accordion';
import { KbqAccordionItem } from './accordion-item';

@Directive({
    selector: '[kbqAccordionTrigger]',
    host: {
        '[attr.id]': 'triggerId',
        '[attr.role]': '"button"',
        '[attr.aria-expanded]': 'item.expanded',
        '[attr.aria-controls]': 'contentId',
        '[attr.aria-disabled]': 'item.disabled',
        '[attr.data-state]': 'item.dataState',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.data-orientation]': 'item.orientation',
        '(click)': 'onClick()',
        '(focus)': 'onFocus()'
    }
})
export class KbqAccordionTriggerDirective {
    /** @docs-private */
    protected readonly nativeElement = kbqInjectNativeElement();
    /** @docs-private */
    protected readonly accordion = inject(KbqAccordion);
    /** @docs-private */
    protected readonly item = inject(KbqAccordionItem);

    /** @docs-private */
    get triggerId(): string {
        return `${this.item.id}-trigger`;
    }

    /** @docs-private */
    get contentId(): string {
        return `${this.item.id}-content`;
    }

    /** Fires when trigger clicked */
    onClick(): void {
        if (!this.accordion.collapsible() && this.item.expanded) return;

        this.item.toggle();

        this.accordion.setActiveItem(this.item);
    }

    /**
     * Keeps the accordion's key manager in sync with native focus so that arrow-key navigation
     * continues from the header the user has just tabbed/focused into.
     * @docs-private
     */
    onFocus(): void {
        this.accordion.setActiveItem(this.item);
    }

    /** @docs-private */
    focus() {
        this.nativeElement.focus();
    }
}
