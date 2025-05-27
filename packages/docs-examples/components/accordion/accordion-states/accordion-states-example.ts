import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule, KbqAccordionVariant } from '@koobiq/components/accordion';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';

/**
 * @title Accordion states
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'accordion-states-example',
    templateUrl: 'accordion-states-example.html',
    imports: [KbqAccordionModule, KbqButtonToggleModule]
})
export class AccordionStatesExample {
    accordionVariant = KbqAccordionVariant;
}
