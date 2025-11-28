import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';

/**
 * @title Accordion
 */
@Component({
    selector: 'accordion-overview-example',
    imports: [KbqAccordionModule],
    templateUrl: 'accordion-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionOverviewExample {}
