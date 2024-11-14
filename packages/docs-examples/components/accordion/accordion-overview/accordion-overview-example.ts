import { Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';

/**
 * @title Accordion
 */
@Component({
    standalone: true,
    selector: 'accordion-overview-example',
    templateUrl: 'accordion-overview-example.html',
    imports: [KbqAccordionModule]
})
export class AccordionOverviewExample {}
