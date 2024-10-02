import { NgModule } from '@angular/core';
import { KbqAccordionContent } from './accordion-content.component';
import { KbqAccordionHeader } from './accordion-header.component';
import { KbqAccordionItem } from './accordion-item.component';
import { KbqAccordionTrigger } from './accordion-trigger.component';
import { KbqAccordion } from './accordion.component';

@NgModule({
    exports: [
        KbqAccordion,
        KbqAccordionContent,
        KbqAccordionHeader,
        KbqAccordionItem,
        KbqAccordionTrigger
    ],
    declarations: [
        KbqAccordion,
        KbqAccordionContent,
        KbqAccordionHeader,
        KbqAccordionItem,
        KbqAccordionTrigger
    ]
})
export class KbqAccordionModule {}
