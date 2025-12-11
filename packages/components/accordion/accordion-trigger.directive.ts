import { Directive, ElementRef, inject } from '@angular/core';
import { KbqAccordionItem } from './accordion-item';
import { KbqAccordion } from './accordion.component';

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
    protected readonly nativeElement = inject(ElementRef).nativeElement;
    protected readonly accordion = inject(KbqAccordion);
    protected readonly item = inject(KbqAccordionItem);

    /** Fires when trigger clicked */
    onClick(): void {
        if (!this.accordion.collapsible && this.item.expanded) return;

        this.item.toggle();

        this.accordion.setActiveItem(this.item);
    }

    focus() {
        this.nativeElement.focus();
    }
}
