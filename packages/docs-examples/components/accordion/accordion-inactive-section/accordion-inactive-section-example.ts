import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';

/**
 * @title Accordion inactive section
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'accordion-inactive-section-example',
    templateUrl: 'accordion-inactive-section-example.html',
    imports: [KbqAccordionModule]
})
export class AccordionInactiveSectionExample {}
