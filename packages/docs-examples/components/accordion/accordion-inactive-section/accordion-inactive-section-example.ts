import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';

/**
 * @title Accordion inactive section
 */
@Component({
    selector: 'accordion-inactive-section-example',
    imports: [KbqAccordionModule],
    templateUrl: 'accordion-inactive-section-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionInactiveSectionExample {}
