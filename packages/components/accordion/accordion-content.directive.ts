import { Directive, ElementRef, inject } from '@angular/core';
import { KbqAccordionItemDirective } from './accordion-item.directive';

@Directive({
    selector: '[kbqAccordionContent]',
    exportAs: 'kbqAccordionContent',
    host: {
        '[attr.role]': '"region"',
        '[style.display]': 'hidden ? "none" : ""',
        '[attr.data-state]': 'item.dataState',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.data-orientation]': 'item.orientation',
        '(animationend)': 'onAnimationEnd()'
    }
})
export class KbqAccordionContentDirective {
    protected readonly item = inject(KbqAccordionItemDirective);
    protected readonly nativeElement = inject(ElementRef).nativeElement;

    protected hidden = false;

    protected onAnimationEnd() {
        this.hidden = !this.item.expanded;

        const { height, width } = this.nativeElement.getBoundingClientRect();

        this.nativeElement.style.setProperty('--radix-collapsible-content-height', `${height}px`);
        this.nativeElement.style.setProperty('--radix-collapsible-content-width', `${width}px`);

        this.nativeElement.style.setProperty(
            '--radix-accordion-content-height',
            'var(--radix-collapsible-content-height)'
        );
        this.nativeElement.style.setProperty(
            '--radix-accordion-content-width',
            'var(--radix-collapsible-content-width)'
        );
    }

    onToggle() {
        if (!this.item.expanded) {
            this.hidden = false;
        }
    }
}
