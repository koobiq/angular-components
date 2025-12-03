import { Directive, ElementRef, inject } from '@angular/core';
import { KbqAccordionItemDirective } from './accordion-item.directive';
import { KbqAccordionRootDirective } from './accordion-root.directive';

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
    protected readonly accordionRoot = inject(KbqAccordionRootDirective);
    protected readonly item = inject(KbqAccordionItemDirective);

    /** Fires when trigger clicked */
    onClick(): void {
        if (!this.accordionRoot.collapsible && this.item.expanded) return;

        this.item.toggle();

        this.accordionRoot.setActiveItem(this.item);
    }

    focus() {
        this.nativeElement.focus();
    }
}
