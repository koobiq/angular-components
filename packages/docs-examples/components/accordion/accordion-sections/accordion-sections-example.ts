import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';

/**
 * @title Accordion sections
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'accordion-sections-example',
    templateUrl: 'accordion-sections-example.html',
    imports: [KbqAccordionModule, KbqButtonToggleModule]
})
export class AccordionSectionsExample {}
