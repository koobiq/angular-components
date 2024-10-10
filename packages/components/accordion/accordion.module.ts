import { NgModule } from '@angular/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqAccordionContent } from './accordion-content';
import { KbqAccordionHeader } from './accordion-header';
import { KbqAccordionItem } from './accordion-item';
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
    imports: [
        KbqIcon
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
