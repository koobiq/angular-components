import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';

/**
 * @title Accordion
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'accordion-overview-example',
    templateUrl: 'accordion-overview-example.html',
    imports: [KbqAccordionModule]
})
export class AccordionOverviewExample {}
