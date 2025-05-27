import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';

/**
 * @title Accordion content
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'accordion-content-example',
    templateUrl: 'accordion-content-example.html',
    styleUrls: ['accordion-content-example.css'],
    imports: [KbqAccordionModule, KbqCheckboxModule]
})
export class AccordionContentExample {
    image: boolean = false;
}
