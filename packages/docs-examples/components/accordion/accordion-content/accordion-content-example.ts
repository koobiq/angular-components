import { Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';

/**
 * @title accordion-content
 */
@Component({
    standalone: true,
    selector: 'accordion-content-example',
    templateUrl: 'accordion-content-example.html',
    styleUrl: 'accordion-content-example.css',
    imports: [KbqAccordionModule, KbqCheckboxModule]
})
export class AccordionContentExample {
    image: boolean = false;
}
