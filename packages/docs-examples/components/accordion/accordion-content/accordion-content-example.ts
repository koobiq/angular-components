import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';

/**
 * @title Accordion content
 */
@Component({
    selector: 'accordion-content-example',
    imports: [KbqAccordionModule, KbqCheckboxModule],
    templateUrl: 'accordion-content-example.html',
    styleUrls: ['accordion-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionContentExample {
    image: boolean = false;
}
