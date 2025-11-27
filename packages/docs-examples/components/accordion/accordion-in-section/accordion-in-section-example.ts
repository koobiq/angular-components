import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';

/**
 * @title Accordion in section
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'accordion-in-section-example',
    templateUrl: 'accordion-in-section-example.html',
    styleUrls: ['accordion-in-section-example.css'],
    imports: [KbqAccordionModule]
})
export class AccordionInSectionExample {}
