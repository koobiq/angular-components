import { Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';

/**
 * @title accordion-sections
 */
@Component({
    standalone: true,
    selector: 'accordion-sections-example',
    templateUrl: 'accordion-sections-example.html',
    imports: [KbqAccordionModule, KbqButtonToggleModule]
})
export class AccordionSectionsExample {}
