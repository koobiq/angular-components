import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';

/**
 * @title Accordion in section
 */
@Component({
    selector: 'accordion-in-section-example',
    imports: [KbqAccordionModule],
    templateUrl: 'accordion-in-section-example.html',
    styleUrls: ['accordion-in-section-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionInSectionExample {}
