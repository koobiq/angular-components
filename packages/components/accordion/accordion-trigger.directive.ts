import { Directive, inject } from '@angular/core';
import { KbqAccordionItem } from './accordion-item';
import { KbqAccordion } from './accordion.component';
import { kbqInjectNativeElement } from '@koobiq/components/core';

@Directive({
    selector: '[kbqAccordionTrigger]',
    host: {
        '[attr.role]': '"button"',
        '[attr.aria-expanded]': 'item.expanded',
        '[attr.data-state]': 'item.dataState',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.disabled]': 'item.disabled ? "" : null',
        '[attr.data-orientation]': 'item.orientation',
        '(click)': 'onClick()'
    }
})
export class KbqAccordionTriggerDirective {
    /** @docs-private */
    protected readonly nativeElement = kbqInjectNativeElement();
    /** @docs-private */
    protected readonly accordion = inject(KbqAccordion);
    /** @docs-private */
    protected readonly item = inject(KbqAccordionItem);

    /** Fires when trigger clicked */
    onClick(): void {
        if (!this.accordion.collapsible && this.item.expanded) return;

        this.item.toggle();

        this.accordion.setActiveItem(this.item);
    }

    /** @docs-private */
    focus() {
        this.nativeElement.focus();
    }
}
